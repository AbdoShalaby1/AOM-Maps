using HtmlAgilityPack;

namespace AOM_Maps.Services
{
    public partial class DownloadMedia
    {
        public static async Task<dynamic> GetMediaFromWiki(string country)
        {
            string anthemListUrl = "https://en.wikipedia.org/wiki/List_of_national_anthems";
            string baseDir = AppDomain.CurrentDomain.BaseDirectory;
            string targetFolder = Path.GetFullPath(Path.Combine(baseDir, "..", "..","..","..", "Frontend", "public", "CountryImages", country));

            try
            {
                using var client = new HttpClient();
                client.DefaultRequestHeaders.Add("User-Agent", "NationalDataBot/1.0 (contact: your@email.com)");
                string html = await client.GetStringAsync(anthemListUrl);
                HtmlDocument doc = new();
                doc.LoadHtml(html);
                var tables = doc.DocumentNode.SelectNodes("//table[contains(@class, 'wikitable')]");
                if (tables == null) return new { error = "Tables not found" };

                string? flagLink = null;
                string? audioLink = null;
                bool foundMatch = false;

                foreach (var table in tables)
                {
                    var rows = table.SelectNodes(".//tr")?.Skip(1);
                    if (rows == null) continue;

                    foreach (var row in rows)
                    {
                        var cells = row.SelectNodes("td|th");
                        if (cells == null || cells.Count == 0) continue;
                        if (cells[0].InnerText.Contains(country, StringComparison.OrdinalIgnoreCase))
                        {
                            var imgTag = cells[0].SelectSingleNode(".//img");
                            if (imgTag != null)
                            {
                                string src = imgTag.GetAttributeValue("src", "");
                                flagLink = "https:" + src.Replace("thumb/", "");
                                int lastSlashIndex = flagLink.LastIndexOf('/');
                                if (lastSlashIndex != -1) flagLink = flagLink.Substring(0, lastSlashIndex);
                            }
                            var links = row.SelectNodes(".//a[@href]");
                            if (links != null)
                            {
                                foreach (var a in links)
                                {
                                    string href = a.GetAttributeValue("href", "");
                                    string title = a.GetAttributeValue("title", "");
                                    string[] extensions = { ".ogg", ".mp3", ".wav", ".oga" };

                                    if (href.Contains("File:") && extensions.Any(ext => href.ToLower().EndsWith(ext)))
                                    {
                                        audioLink = await WikipediaHelpers.GetDirectMediaUrl(title, client);
                                        break;
                                    }
                                }
                            }

                            foundMatch = true;
                            break;
                        }
                    }
                    if (foundMatch) break;
                }

                if (!foundMatch) return new { error = $"Country '{country}' not found." };

                string flagExt = flagLink != null ? Path.GetExtension(flagLink).Replace(".", "") : "svg";
                string audioExt = audioLink != null ? Path.GetExtension(audioLink).Replace(".", "") : "ogg";

                if (!FileHelpers.FileExistsLocally(targetFolder, $"flag.{flagExt}"))
                    await FileHelpers.DownloadFileAsync(flagLink!, targetFolder, $"flag.{flagExt}");

                if (!FileHelpers.FileExistsLocally(targetFolder, $"anthem.{audioExt}"))
                    await FileHelpers.DownloadFileAsync(audioLink!, targetFolder, $"anthem.{audioExt}");

                Console.WriteLine(targetFolder);
                return new { status = "success", country, saved_to = targetFolder };
            }
            catch (Exception ex)
            {
                return new { error = ex.Message };
            }
        }
    }
}
