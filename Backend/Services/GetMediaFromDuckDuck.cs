using AOM_Maps.DTOS;

namespace AOM_Maps.Services
{
    public partial class DownloadMedia
    {
        public static async Task GetMediaFromDuckDuck(CountryDTO country)
        {
            string baseDir = AppDomain.CurrentDomain.BaseDirectory;
            string targetFolder = Path.GetFullPath(Path.Combine(baseDir, "..", "..", "..", "..", "Frontend", "public", "CountryImages", country.Name));

            using var DDG = new DuckDuckGoSearch();

            // 1. Static Images
            await FileHelpers.TryDownloadFirstValidImage(DDG, $"{country.Capital}", targetFolder, "capital.jpg");
            await FileHelpers.TryDownloadFirstValidImage(DDG, $"{country.Name} culture", targetFolder, "culture.jpg");
            await FileHelpers.TryDownloadFirstValidImage(DDG, $"{country.President} {country.Name}", targetFolder, "president.jpg");

            // 2. List-based: Dishes
            for (int i = 0; i < country.Dishes.Count; i++)
            {
                await FileHelpers.TryDownloadFirstValidImage(DDG, $"{country.Dishes[i].Title} {country.Name}", targetFolder, $"dish-{i}.jpg");
            }

            // 3. List-based: Landmarks
            for (int i = 0; i < country.Landmarks.Count; i++)
            {
                await FileHelpers.TryDownloadFirstValidImage(DDG, $"{country.Landmarks[i].Title} {country.Name}", targetFolder, $"landmark-{i}.jpg");
            }
        }
    }
}