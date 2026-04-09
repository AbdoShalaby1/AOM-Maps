using Newtonsoft.Json.Linq;
using System.Text.RegularExpressions;

namespace AOM_Maps.Services
{
    public class DuckDuckGoSearch : IDisposable
    {
        private readonly HttpClient _client;
        private string? _vqd = null!;

        public DuckDuckGoSearch(string? proxy = null)
        {
            var handler = new HttpClientHandler
            {
                AutomaticDecompression = System.Net.DecompressionMethods.GZip | System.Net.DecompressionMethods.Deflate,
                Proxy = proxy != null ? new System.Net.WebProxy(proxy) : null
            };

            _client = new HttpClient(handler);
            // Updated to a recent Chrome User-Agent
            _client.DefaultRequestHeaders.Add("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36");
        }

        public async Task<List<Dictionary<string, object>>> SearchImagesAsync(
            string keywords,
            string region = "wt-wt",
            string safesearch = "moderate",
            int? maxResults = null,
            CancellationToken ct = default)
        {
            if (string.IsNullOrEmpty(keywords)) throw new ArgumentException("Keywords are mandatory");

            _vqd = await GetVqdAsync(keywords, ct);
            if (string.IsNullOrEmpty(_vqd))
            {
                Console.WriteLine($"[ERROR] Search aborted for '{keywords}' because VQD could not be retrieved.");
                return [];
            }

            var results = new List<Dictionary<string, object>>();
            var cache = new HashSet<string>();

            var ssMap = new Dictionary<string, string> { { "on", "1" }, { "moderate", "1" }, { "off", "-1" } };
            string ssValue = ssMap.GetValueOrDefault(safesearch.ToLower(), "1");

            var queryParams = new Dictionary<string, string>
            {
                { "l", region },
                { "o", "json" },
                { "q", keywords },
                { "vqd", _vqd },
                { "f", ",,,,," },
                { "p", ssValue }
            };

            for (int i = 0; i < 5; i++)
            {
                string url = $"https://duckduckgo.com/i.js?{await new FormUrlEncodedContent(queryParams).ReadAsStringAsync(ct)}";

                using var request = new HttpRequestMessage(HttpMethod.Get, url);
                request.Headers.Referrer = new Uri("https://duckduckgo.com/");
                // Headers to mimic a browser Fetch/XHR request
                request.Headers.Add("Accept", "application/json, text/javascript, */*; q=0.01");
                request.Headers.Add("Sec-Fetch-Dest", "empty");
                request.Headers.Add("Sec-Fetch-Mode", "cors");
                request.Headers.Add("Sec-Fetch-Site", "same-origin");
                request.Headers.Add("X-Requested-With", "XMLHttpRequest");

                var response = await _client.SendAsync(request, ct);
                if (!response.IsSuccessStatusCode)
                {
                    Console.WriteLine($"[ERROR] DDG Image request failed with status: {response.StatusCode}");
                    break;
                }

                var content = await response.Content.ReadAsStringAsync(ct);
                var json = JObject.Parse(content);
                var pageData = json["results"] as JArray;

                if (pageData == null) break;

                foreach (var row in pageData)
                {
                    string? imgUrl = row["image"]?.ToString();
                    if (!string.IsNullOrEmpty(imgUrl) && cache.Add(imgUrl))
                    {
                        results.Add(row.ToObject<Dictionary<string, object>>()!);

                        if (maxResults.HasValue && results.Count >= maxResults.Value)
                            return results;
                    }
                }

                var next = json["next"]?.ToString();
                if (string.IsNullOrEmpty(next) || !maxResults.HasValue) break;

                var match = Regex.Match(next, @"s=([^&]+)");
                if (match.Success) queryParams["s"] = match.Groups[1].Value;
                else break;
            }

            return results;
        }

        private async Task<string?> GetVqdAsync(string keywords, CancellationToken ct)
        {
            string url = $"https://duckduckgo.com/?q={Uri.EscapeDataString(keywords)}";

            using var request = new HttpRequestMessage(HttpMethod.Get, url);
            // Mimic a full page navigation
            request.Headers.Add("Accept", "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8");
            request.Headers.Add("Accept-Language", "en-US,en;q=0.5");
            request.Headers.Add("Sec-Fetch-Dest", "document");
            request.Headers.Add("Sec-Fetch-Mode", "navigate");
            request.Headers.Add("Sec-Fetch-Site", "none");
            request.Headers.Add("Sec-Fetch-User", "?1");
            request.Headers.Add("Upgrade-Insecure-Requests", "1");

            try
            {
                var response = await _client.SendAsync(request, ct);
                var html = await response.Content.ReadAsStringAsync(ct);

                // Improved Regex to catch vqd in various formats (vqd: '...', vqd="...", etc)
                var match = Regex.Match(html, @"vqd\s*[:=]\s*['""]([^'""]+)['""]", RegexOptions.IgnoreCase);

                if (!match.Success)
                {
                    Console.WriteLine($"[ERROR] VQD extraction failed for query: {keywords}. HTML length: {html.Length}. Potential block or challenge page.");
                    // Optional: Log the first 200 chars of HTML to see if it's a "Forbidden" page
                    if (html.Length > 0) Console.WriteLine($"[DEBUG] HTML Start: {html.Substring(0, Math.Min(200, html.Length))}");
                    return null;
                }

                return match.Groups[1].Value;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[CRITICAL] GetVqdAsync failed: {ex.Message}");
                return null;
            }
        }

        public void Dispose() => _client?.Dispose();
    }
}