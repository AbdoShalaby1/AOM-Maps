namespace AOM_Maps.Services
{
    public class FileHelpers
    {
        public static async Task<string?> DownloadFileAsync(string url, string folderPath, string filename)
        {
            if (string.IsNullOrWhiteSpace(url) || FileExistsLocally(folderPath,filename))
            {
                return null;
            }
            Directory.CreateDirectory(folderPath);
            string filePath = Path.Combine(folderPath, filename);
            using var client = new HttpClient();
            client.Timeout = TimeSpan.FromSeconds(15);
            client.DefaultRequestHeaders.Add("User-Agent", "NationalDataBot/1.0 (contact: your@email.com)");

            try
            {


                using var response = await client.GetAsync(url, HttpCompletionOption.ResponseHeadersRead);

                if (response.IsSuccessStatusCode)
                {
                    Console.WriteLine($"{filename}: {url}");
                    Console.WriteLine($"Downloading {filename}");
                    using var contentStream = await response.Content.ReadAsStreamAsync();
                    using var fileStream = new FileStream(filePath, FileMode.Create, FileAccess.Write, FileShare.None, 8192, true);

                    await contentStream.CopyToAsync(fileStream);
                    return filePath;
                }
                else
                {
                    // This will tell you if it's a 403 (Forbidden), 404 (Not Found), etc.
                    Console.WriteLine($"{filename}: {url} (Status: {response.StatusCode})");

                    // Optional: Read the actual error message sent by the server
                    string errorBody = await response.Content.ReadAsStringAsync();
                    Console.WriteLine($"Error Details: {errorBody}");
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[Network Error] Skipping {url}: {ex.Message}");
            }

            return null;
        }


        public static bool FileExistsLocally(string directory, string filenamePrefix)
        {
            if (!Directory.Exists(directory))
            {
                return false;
            }
            return Directory.EnumerateFiles(directory, filenamePrefix + "*").Any();
        }

        /// <summary>
        /// Searches for images and attempts to download them one by one until a download succeeds.
        /// </summary>
        public static async Task TryDownloadFirstValidImage(DuckDuckGoSearch searcher, string query, string folder, string fileName)
        {
            // Skip if file already exists
            if (FileExistsLocally(folder, fileName)) return;

            try
            {
                // Fetch up to 5 results to have fallbacks
                var results = await searcher.SearchImagesAsync(query, maxResults: 5);

                if (results == null || results.Count == 0) return;

                foreach (var result in results)
                {
                    string? imageUrl = result["image"]?.ToString();

                    if (string.IsNullOrEmpty(imageUrl)) continue;

                    // Attempt download
                    var status = await DownloadFileAsync(imageUrl, folder, fileName);

                    // If status is not null (success), break the loop and move to next image category
                    if (status != null)
                    {
                        return;
                    }

                    // If status is null, the loop continues to the next result in 'results'
                }
            }
            catch (Exception ex)
            {
                // Log error if needed, but allow the main process to continue
                Console.WriteLine($"Error processing query '{query}': {ex.Message}");
            }
        }
    }
}
