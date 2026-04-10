using AOM_Maps.Context;
using AOM_Maps.DTOS;
using AOM_Maps.Models;
using Google.GenAI;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;

namespace AOM_Maps.Services
{
    public class Translate(AppDbContext _context, SaveCountry _saveCountry, FetchCountryService _fetchService, DownloadMedia _downloadMedia, IConfiguration _config)
    {
        public async Task TranslateCountries(string name)
        {
            var data = await _fetchService.FetchCountryDatabase(name);
            if (data == null) return;

            // Prepare the JSON serialization options
            var jsonOptions = new JsonSerializerOptions
            {
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
                WriteIndented = true
            };

            // Serialize the English DTO into JSON
            var jsonInput = JsonSerializer.Serialize(data, jsonOptions);

            var prompt = $@"
                You are a professional translator specializing in geographical and cultural data.
                Task: Translate the following JSON object from English to Arabic.
                
                Rules:
                1. Maintain the exact JSON structure.
                2. Translate all string values to natural, high-quality Arabic.
                3. Do not translate proper names that should remain in English (if any), but generally, country names and cities should be in Arabic.
                4. Return ONLY the valid JSON object. No markdown formatting like ```json.

                Input Data:
                {jsonInput}";

            // Initialize the Gemini client
            var client = new Client(apiKey: _config.GetValue<string>("AIApiKey"));
            var response = await client.Models.GenerateContentAsync(
                model: "gemini-3.1-flash-lite-preview",
                contents: prompt
            );

            var translatedJson = response.Text?.Trim();

            // Safeguard: Strip markdown if the model hallucinates formatting despite instructions
            if (!string.IsNullOrEmpty(translatedJson) && translatedJson.StartsWith("```json", StringComparison.OrdinalIgnoreCase))
            {
                translatedJson = translatedJson.Substring(7);
                if (translatedJson.EndsWith("```"))
                {
                    translatedJson = translatedJson.Substring(0, translatedJson.Length - 3);
                }
                translatedJson = translatedJson.Trim();
            }

            if (string.IsNullOrEmpty(translatedJson)) return;

            // Deserialize back to the DTO
            var deserializeOptions = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
            var translatedData = JsonSerializer.Deserialize<CountryDTO>(translatedJson, deserializeOptions);

            if (translatedData == null || string.IsNullOrEmpty(translatedData.Name)) return;

            // Preserve non-translated data such as the media collection and enforce the language flag
            translatedData.Lang = "ar";
            translatedData.Media = data.Media;

            // Save the newly translated country
            var arabicCountry = await _saveCountry.Save(translatedData);

            // Connect media items
            var englishCountry = await _context.Countries
                .Include(c => c.Media)
                .FirstOrDefaultAsync(c => c.Name == data.Name && c.Lang == "en");

            if (englishCountry != null && englishCountry.Media.Any() && arabicCountry != null)
            {
                foreach (var media in englishCountry.Media)
                {
                    media.CountryARId = arabicCountry.Id;
                }

                await _context.SaveChangesAsync();
                Console.WriteLine($"[LOG] Successfully linked {englishCountry.Media.Count} assets to {arabicCountry.Name}");
            }
        }
    }
}