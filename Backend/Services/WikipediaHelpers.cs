using Microsoft.AspNetCore.Mvc;
using System.Text.Json;

namespace AOM_Maps.Services
{
    public static class WikipediaHelpers
    {
        public static async Task<string?> GetCountryWiki(string country)
        {
            using var client = new HttpClient();
            client.Timeout = TimeSpan.FromSeconds(10);
            var url = $"https://r.jina.ai/https://en.wikipedia.org/wiki/{country.Replace(" ", "_")}";
            var response = await client.GetAsync(url);

            if (!response.IsSuccessStatusCode)
            {
                var statusCode = (int)response.StatusCode;
                var errorMsg = $"Error: Could not reach Wikipedia for {country}. Status: {statusCode}";
                Console.WriteLine($"[ERROR] {errorMsg}");
                return null;
            }
            var content = await response.Content.ReadAsStringAsync();
            return content;
        }

        public static async Task<string?> GetDirectMediaUrl(string fileTitle, HttpClient client)
        {
            var apiUrl = $"https://en.wikipedia.org/w/api.php?action=query&titles={Uri.EscapeDataString(fileTitle)}&prop=imageinfo&iiprop=url&format=json";

            try
            {
                var response = await client.GetStringAsync(apiUrl);
                using JsonDocument doc = JsonDocument.Parse(response);
                JsonElement root = doc.RootElement;
                if (root.TryGetProperty("query", out JsonElement query) &&
                    query.TryGetProperty("pages", out JsonElement pages))
                {
                    var firstPage = pages.EnumerateObject().FirstOrDefault();

                    if (firstPage.Value.TryGetProperty("imageinfo", out JsonElement imageInfo) &&
                        imageInfo.GetArrayLength() > 0)
                    {
                        return imageInfo[0].GetProperty("url").GetString()!;
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error fetching URL: {ex.Message}");
            }

            return null;
        }

    }
}
