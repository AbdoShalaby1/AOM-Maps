using AOM_Maps.DTOS;
using AOM_Maps.Models;
using Google.GenAI;
using System.Text.Json;

namespace AOM_Maps.Services
{
    public class AISummary(IConfiguration config)
    {
        public async Task<CountryDTO?> SummarizeCountryWiki(string country)
        {
            var inputText = await WikipediaHelpers.GetCountryWiki(country);

            var client = new Client(apiKey: config.GetValue<string>("AIApiKey"));
            var response = await client.Models.GenerateContentAsync(
                model: "gemini-3.1-flash-lite-preview",
                contents: $$"""
                Act as a structured data extraction engine. Analyze the provided text about {{country}} and output ONLY a minified JSON object. 

                ### EXTRACTION RULES:
                1. **Word Count Enforcement**: 
                    - The following fields MUST contain a comprehensive summary between 150 and 200 words each: "Summary", "Geography", "Politics", "Entertainment", "Culinary", "Sport", and "Economy".
                    - The "description" fields within arrays ("History", "Dishes", "Famous Landmarks") are EXEMPT from the 150-200 word rule; keep these concise (3-5 sentences).
                2. **History**: Extract a chronological list of ALL historical events on the page. 
                    - Format: An array of objects.
                    - Each object MUST have: 
                        "title": (The title from the page in simple english)
                        "description": (A comprehensive summary of the event in simple English 150-200 words)
                3. **Summaries**: For Geography, Politics, Entertainment, Culinary, Sport, and Economy, provide a comprehensive, clear summary in simple English 150-200 words.
                4. **Constraints**: 
                    - No conversational filler. 
                    - No markdown code blocks (```json).
                    - If data is missing,
                        try as hard as you can to get data, if you can't then search other sources.
                5. **Languages**: Must be 'Official languages' only.
                6. **Dishes**: The dishes must be the ones you mentioned in the culinary section.
                7. **Landmarks**: Famous landmarks should be also from the page.
                8. **Sport Teams**: If a sport has multiple famous teams in the country: make each team a new item and the sport name is also present (e.g., {"sport": "football", "team": "Al-Ahly"}).
                9. **Sport Word Count**: Sport teams list is not part of the 150-200 words in the "Sport" summary section.
                10. HDI Level: - If HDI >= 0.800: Return "Excellent"
                - If HDI is between 0.700 and 0.799: Return "Above Average"
                - If HDI is between 0.550 and 0.699: Return "Average"
                - If HDI < 0.550: Return "Poor"
                11. Currency ISO part: ISO 4217 code, ex: "EGP", "USD"
                12. Currency must be only one (the most used in the country) even if the country has multiple
                13. Continent must be one only and only from the famous ones
                14. If no president is available: return the sultan/king/head of the country generally
                15. The Name property should be the one supplied not the one from wikipedia
        
                ### REQUIRED JSON SCHEMA:
                {
                    "Name": "string",
                    "Continent" : "string",
                    "President" : "string",
                    "Currency" : {"name": "string", "ISO": "string"},
                    "HDI Level" : "string",
                    "Languages" : ["string"],
                    "Dishes" : [{ "title": "string", "description": "string" }],
                    "Famous Landmarks" : [{ "title": "string", "description": "string" }],
                    "Sport Teams" : [{ "sport": "string", "team": "string" }],
                    "Capital" : "string",
                    "Population" : "string",
                    "Summary": "string",
                    "Geography": "string",
                    "History": [
                        { "title": "string", "description": "string" }
                    ], 
                    "Politics": "string",
                    "Entertainment": "string",
                    "Culinary": "string",
                    "Sport": "string",
                    "Economy": "string"
                }

                ### INPUT TEXT:
                {{inputText}} 
                """
            );
            var options = new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            };

            return JsonSerializer.Deserialize<CountryDTO>(response.Text!,options);
        }
    }
}
