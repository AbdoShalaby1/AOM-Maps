using AOM_Maps.Context;
using AOM_Maps.DTOS;
using Microsoft.EntityFrameworkCore;


namespace AOM_Maps.Services
{
    public class FetchCountryService(AppDbContext _context, AISummary _aisummary)
    {
        public async Task<CountryDTO?> FetchCountryOnline(string country)
        {   
            var response = await _aisummary.SummarizeCountryWiki(country);
            return response;
        }
        public async Task<CountryDTO?> FetchCountryDatabase(string country)
        {
            var data = await _context.Countries
                    .Include(c => c.SportTeams)
                    .Include(c => c.Languages)
                    .Include(c => c.Dishes)
                    .Include(c => c.Landmarks)
                    .Include(c => c.History)
                    .Include(c => c.Currency)
                    .FirstOrDefaultAsync(x => x.Name == country);

            if (data is not null)
            {
                return data.ToDTO();
            }
            return null;
        }

        public async Task<List<string>> FetchSimilarCountries(CountryDTO data)
        {
            var similar = await _context.Countries
            .Select(c => new
            {
                c.Name,
                SameHDI = c.HDILevel == data.HDILevel,
                SameContinent = c.Continent == data.Continent,
                SameCurrency = c.Currency.ISO == data.Currency.ISO,
                SameLanguage = c.Languages.Any(l => data.Languages.Contains(l.Name)),
                IsTarget = c.Name == data.Name
            })
            .Where(c => !c.IsTarget && (c.SameHDI || c.SameContinent || c.SameCurrency || c.SameLanguage))
            .OrderByDescending(c =>
                (c.SameHDI ? 1 : 0) +
                (c.SameContinent ? 1 : 0) +
                (c.SameCurrency ? 1 : 0) +
                (c.SameLanguage ? 1 : 0)
            )
            .Take(5).Select(c => c.Name)
            .ToListAsync();

            return similar;
        }
    }
}
