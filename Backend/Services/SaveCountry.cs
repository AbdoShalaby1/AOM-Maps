using AOM_Maps.Context;
using AOM_Maps.DTOS;
using AOM_Maps.Models;
using Microsoft.EntityFrameworkCore;

namespace AOM_Maps.Services
{
    public class SaveCountry(AppDbContext context)
    {
        private readonly AppDbContext _context = context;

        public async Task Save(CountryDTO data)
        {
            // transaction because all or none, we dont want to save currency without country
            using (var transaction = await _context.Database.BeginTransactionAsync())
            {
                try
                {
                    // Find or create Currency
                    var currency = await _context.Currencies
                        .FirstOrDefaultAsync(c => c.ISO == data.Currency.ISO && c.Name == data.Currency.Name);
                    
                    if (currency == null)
                    {
                        currency = new Currency
                        {
                            Name = data.Currency.Name,
                            ISO = data.Currency.ISO
                        };
                        _context.Currencies.Add(currency);
                        await _context.SaveChangesAsync();
                    }

                    var country = new Country
                    {
                        Name = data.Name,
                        Continent = data.Continent,
                        President = data.President,
                        Capital = data.Capital,
                        Population = data.Population,
                        Summary = data.Summary,
                        Geography = data.Geography,
                        HDILevel = data.HDILevel,
                        Politics = data.Politics,
                        Entertainment = data.Entertainment,
                        Culinary = data.Culinary,
                        Sport = data.Sport,
                        Economy = data.Economy,
                        Currency = currency,
                        SportTeams = data.SportTeams,
                        Languages = [.. data.Languages.Select(l => new Language { Name = l })],
                        Dishes = data.Dishes,
                        Landmarks = data.Landmarks,
                        History = data.History,
                        Media = data.Media
                    };

                    _context.Countries.Add(country);
                    await _context.SaveChangesAsync();
                    await transaction.CommitAsync();
                }
                catch (Exception)
                {
                    await transaction.RollbackAsync();
                    throw;
                }
            }
        }
    }
}
