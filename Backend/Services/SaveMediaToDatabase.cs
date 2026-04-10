using AOM_Maps.Context;
using AOM_Maps.DTOS;
using AOM_Maps.Models;
using HtmlAgilityPack;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;
using System.Text.RegularExpressions;

namespace AOM_Maps.Services
{
    public partial class DownloadMedia(AppDbContext _context)
    {
        /// <summary>
        /// Fetches media URLs from DuckDuckGo and Wikipedia, and saves them to the database.
        /// </summary>
        public async Task<List<CountryMedia>> FetchAndSaveMediaUrlsAsync(CountryDTO countryDto, string lang = "en")
        {
            Console.WriteLine($"[LOG] Starting FetchAndSaveMediaUrlsAsync for: {countryDto.Name}");
            var existingCountry = await _context.Countries
                .Include(c => c.Media)
                .Include(c => c.ArabicMedia)
                .FirstOrDefaultAsync(c => c.Name == countryDto.Name);

            if (lang == "en")
            {
                if (existingCountry?.Media.Any() == true)
                {
                    Console.WriteLine($"[LOG] Media already exists in DB for {countryDto.Name}. Skipping fetch.");
                    countryDto.Media = existingCountry.Media;
                    return existingCountry.Media;
                }   
            }    
            else
            {
                if (existingCountry?.ArabicMedia.Any() == true)
                {
                    Console.WriteLine($"[LOG] Media already exists in DB for {countryDto.Name}. Skipping fetch.");
                    countryDto.Media = existingCountry.ArabicMedia;
                    return existingCountry.ArabicMedia;
                }
            }

            var mediaList = new List<CountryMedia>();
            using var DDG = new DuckDuckGoSearch();

            // Helper: Get first valid image URL from DDG with connectivity check
            async Task<string?> GetFirstImageUrlAsync(string query)
            {
                try
                {
                    var results = await DDG.SearchImagesAsync(query, maxResults: 10);
                    if (results == null || !results.Any())
                    {
                        Console.WriteLine($"[LOG] DDG returned no results for query: {query}");
                        return null;
                    }

                    using var checkClient = new HttpClient();
                    // Crucial: Use the same User-Agent and no-referrer strategy for the check
                    checkClient.DefaultRequestHeaders.Add("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36");

                    foreach (var result in results)
                    {
                        string? url = result["image"]?.ToString();
                        if (string.IsNullOrEmpty(url)) continue;

                        try
                        {
                            // Perform a lightweight HEAD request to see if the host blocks us
                            using var cts = new CancellationTokenSource(TimeSpan.FromSeconds(3));
                            var request = new HttpRequestMessage(HttpMethod.Head, url);
                            var response = await checkClient.SendAsync(request, cts.Token);

                            if (response.IsSuccessStatusCode)
                            {
                                // If the image is from a known "problem" site (like some wiki variants that require auth), skip it
                                if (url.Contains("lookaside.fbsbx.com") || url.Contains("i.ytimg.com")) continue;

                                Console.WriteLine($"[LOG] Validated image found for '{query}': {url}");
                                return url;
                            }
                        }
                        catch
                        {
                            // If the image host times out or fails, move to the next result
                            continue;
                        }
                    }

                    Console.WriteLine($"[LOG] No reachable images found for query: {query}");
                    return null;
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"[ERROR] Image fetching/validation failed for '{query}': {ex.Message}");
                    return null;
                }
            }

            // Helper: Safely add media if URL is valid
            void AddMedia(string? url, string type)
            {
                if (!string.IsNullOrEmpty(url))
                    mediaList.Add(new CountryMedia { Type = type, Link = url });
            }

            // 1. DuckDuckGo Image Fetching
            Console.WriteLine("[LOG] Fetching images from DuckDuckGo...");
            AddMedia(await GetFirstImageUrlAsync(countryDto.Capital), "capital");
            AddMedia(await GetFirstImageUrlAsync($"{countryDto.Name} culture"), "culture");
            AddMedia(await GetFirstImageUrlAsync($"{countryDto.President} {countryDto.Name}"), "president");

            for (int i = 0; i < countryDto.Dishes.Count; i++)
                AddMedia(await GetFirstImageUrlAsync($"{countryDto.Dishes[i].Title} {countryDto.Name}"), $"dish-{i}");

            for (int i = 0; i < countryDto.Landmarks.Count; i++)
                AddMedia(await GetFirstImageUrlAsync($"{countryDto.Landmarks[i].Title} {countryDto.Name}"), $"landmark-{i}");

            // 2. Wikipedia Flag & Anthem Fetching (direct from country page)
            Console.WriteLine("[LOG] Fetching Flag/Anthem from Wikipedia...");
            await FetchWikiMediaFromCountryPageAsync(countryDto.Name, mediaList);

            foreach (var media in mediaList)
            {
                media.CountryId = existingCountry!.Id;
            }

            Console.WriteLine($"[LOG] Total media items found: {mediaList.Count}. Saving to database...");
            countryDto.Media = mediaList;
            _context.Media.AddRange(mediaList);
            await _context.SaveChangesAsync();
            Console.WriteLine("[LOG] Save successful.");

            return mediaList;
        }

        /// <summary>
        /// Extracts flag and anthem directly from wikipedia.com/wiki/{countryName}
        /// </summary>
        private async Task FetchWikiMediaFromCountryPageAsync(string countryName, List<CountryMedia> mediaList)
        {
            using var client = new HttpClient();
            client.DefaultRequestHeaders.Add("User-Agent", "NationalDataBot/1.0 (contact: your@email.com)");

            var wikiUrl = $"https://en.wikipedia.org/wiki/{Uri.EscapeDataString(countryName.Replace(" ", "_"))}";

            try
            {
                Console.WriteLine($"[LOG] Requesting Wikipedia page: {wikiUrl}");
                string html = await client.GetStringAsync(wikiUrl);
                var doc = new HtmlDocument();
                doc.LoadHtml(html);

                // === EXTRACT FLAG ===
                var flagImg = doc.DocumentNode
                    .SelectNodes("//img[contains(@class, 'flag') or contains(@class, 'thumbimage') or contains(@src, 'Flag_of_')]")
                    ?.FirstOrDefault(img =>
                        img.GetAttributeValue("src", "").Contains("/wiki/Special:FilePath/") ||
                        img.GetAttributeValue("src", "").EndsWith(".svg") ||
                        img.GetAttributeValue("src", "").EndsWith(".png") ||
                        img.GetAttributeValue("src", "").EndsWith(".jpg"));

                if (flagImg != null)
                {
                    string src = flagImg.GetAttributeValue("src", "");
                    string flagUrl = ConvertWikiImageUrlToDirect(src);
                    if (!string.IsNullOrEmpty(flagUrl))
                    {
                        Console.WriteLine($"[LOG] Flag found via HTML: {flagUrl}");
                        mediaList.Add(new CountryMedia { Type = "flag", Link = flagUrl });
                    }
                }
                else
                {
                    Console.WriteLine("[LOG] Flag not found in HTML. Trying Jina.ai fallback...");
                    var jinaUrl = $"https://r.jina.ai/{wikiUrl}";
                    var jinaText = await client.GetStringAsync(jinaUrl);

                    var flagMatch = Regex.Match(jinaText, @"image_flag\s*=\s*([^\|\n\]]+)", RegexOptions.IgnoreCase);
                    if (flagMatch.Success)
                    {
                        string filename = flagMatch.Groups[1].Value.Trim();
                        Console.WriteLine($"[LOG] Filename found in Jina: {filename}. Getting direct URL...");
                        string directUrl = await GetDirectFileUrlAsync(filename, client);
                        if (!string.IsNullOrEmpty(directUrl))
                            mediaList.Add(new CountryMedia { Type = "flag", Link = directUrl });
                    }
                }

                // === EXTRACT ANTHEM ===
                var anthemLink = doc.DocumentNode
                    .SelectNodes("//a[@href]")
                    ?.FirstOrDefault(a =>
                    {
                        var title = a.GetAttributeValue("title", "").ToLower();
                        var href = a.GetAttributeValue("href", "").ToLower();
                        var text = a.InnerText.ToLower();
                        return (title.Contains("anthem") || text.Contains("anthem") || href.Contains("anthem"))
                               && !href.Contains("list_of_national_anthems");
                    });

                if (anthemLink != null)
                {
                    string anthemHref = anthemLink.GetAttributeValue("href", "");
                    string anthemTitle = anthemLink.GetAttributeValue("title", "");
                    Console.WriteLine($"[LOG] Anthem link candidate found: {anthemTitle}");

                    if (anthemHref.Contains("/wiki/File:"))
                    {
                        string filename = anthemTitle.StartsWith("File:", StringComparison.OrdinalIgnoreCase)
                            ? anthemTitle
                            : $"File:{anthemTitle}";
                        string audioUrl = await GetDirectFileUrlAsync(filename, client);
                        if (!string.IsNullOrEmpty(audioUrl) && IsAudioFile(audioUrl))
                            mediaList.Add(new CountryMedia { Type = "anthem", Link = audioUrl });
                    }
                    else if (anthemHref.StartsWith("/wiki/") && !anthemHref.Contains(":"))
                    {
                        string anthemPageUrl = $"https://en.wikipedia.org{anthemHref}";
                        string audioUrl = await ExtractAudioFromAnthemPageAsync(anthemPageUrl, client);
                        if (!string.IsNullOrEmpty(audioUrl))
                            mediaList.Add(new CountryMedia { Type = "anthem", Link = audioUrl });
                    }
                }
                else
                {
                    Console.WriteLine("[LOG] Anthem not found in HTML. Trying Jina.ai fallback...");
                    var jinaUrl = $"https://r.jina.ai/{wikiUrl}";
                    var jinaText = await client.GetStringAsync(jinaUrl);

                    var anthemMatch = Regex.Match(jinaText, @"national_anthem\s*=\s*\[\[([^\|\]]+)", RegexOptions.IgnoreCase);
                    if (anthemMatch.Success)
                    {
                        string anthemPage = anthemMatch.Groups[1].Value.Trim();
                        string anthemPageUrl = $"https://en.wikipedia.org/wiki/{Uri.EscapeDataString(anthemPage)}";
                        string audioUrl = await ExtractAudioFromAnthemPageAsync(anthemPageUrl, client);
                        if (!string.IsNullOrEmpty(audioUrl))
                            mediaList.Add(new CountryMedia { Type = "anthem", Link = audioUrl });
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[ERROR] Critical failure fetching Wikipedia media for {countryName}: {ex.Message}");
            }
        }

        private string ConvertWikiImageUrlToDirect(string src)
        {
            if (string.IsNullOrEmpty(src)) return null;

            if (src.Contains("/thumb/"))
            {
                var match = Regex.Match(src, @"/thumb/([^/]+)/\d+px-\1");
                if (match.Success)
                    return $"https:{match.Value}";
            }

            if (src.Contains("/wiki/Special:FilePath/"))
                return $"https:{src}";

            if (src.StartsWith("//"))
                return $"https:{src}";

            return null;
        }

        private async Task<string?> GetDirectFileUrlAsync(string filename, HttpClient client)
        {
            if (!filename.StartsWith("File:", StringComparison.OrdinalIgnoreCase))
                filename = $"File:{filename}";

            var apiUrl = $"https://en.wikipedia.org/w/api.php?action=query&titles={Uri.EscapeDataString(filename)}&prop=imageinfo&iiprop=url&format=json";

            try
            {
                var response = await client.GetStringAsync(apiUrl);
                using var doc = JsonDocument.Parse(response);
                var root = doc.RootElement;

                if (root.TryGetProperty("query", out var query) &&
                    query.TryGetProperty("pages", out var pages))
                {
                    var firstPage = pages.EnumerateObject().FirstOrDefault();
                    if (firstPage.Value.TryGetProperty("imageinfo", out var imageInfo) &&
                        imageInfo.GetArrayLength() > 0)
                    {
                        var url = imageInfo[0].GetProperty("url").GetString();
                        Console.WriteLine($"[LOG] API direct URL resolved: {url}");
                        return url;
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[ERROR] API fetch failed for {filename}: {ex.Message}");
            }
            return null;
        }

        private async Task<string?> ExtractAudioFromAnthemPageAsync(string anthemPageUrl, HttpClient client)
        {
            try
            {
                Console.WriteLine($"[LOG] Extracting audio from anthem page: {anthemPageUrl}");
                var html = await client.GetStringAsync(anthemPageUrl);
                var doc = new HtmlDocument();
                doc.LoadHtml(html);

                var audioLinks = doc.DocumentNode.SelectNodes("//a[@href]")
                    ?.Where(a =>
                    {
                        var href = a.GetAttributeValue("href", "").ToLower();
                        return href.Contains("/wiki/file:") &&
                               (href.EndsWith(".ogg") || href.EndsWith(".mp3") ||
                                href.EndsWith(".wav") || href.EndsWith(".oga"));
                    });

                if (audioLinks?.Any() == true)
                {
                    var firstLink = audioLinks.First();
                    string title = firstLink.GetAttributeValue("title", "");
                    return await GetDirectFileUrlAsync(title, client);
                }

                var audioEl = doc.DocumentNode.SelectSingleNode("//audio//source[@src]");
                if (audioEl != null)
                {
                    string src = audioEl.GetAttributeValue("src", "");
                    if (!string.IsNullOrEmpty(src) && IsAudioFile(src))
                        return src.StartsWith("//") ? $"https:{src}" : src;
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[ERROR] Anthem page extraction failed: {ex.Message}");
            }
            return null;
        }

        private bool IsAudioFile(string url)
        {
            if (string.IsNullOrEmpty(url)) return false;
            var extensions = new[] { ".ogg", ".mp3", ".wav", ".oga", ".opus" };
            return extensions.Any(ext => url.ToLower().EndsWith(ext));
        }
    }
}