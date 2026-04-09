using AOM_Maps.Context;
using AOM_Maps.DTOS;
using AOM_Maps.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AOM_Maps.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CountriesController(AppDbContext _context, SaveCountry _saveCountry, FetchCountryService _fetchService, DownloadMedia _downloadMedia) : ControllerBase
    {
        [HttpGet("{country}")]
        public async Task<ActionResult<CountryDTO?>> GetCountry(string country)
        {
            CountryDTO resp = null!;
            try
            {
                var data = await _fetchService.FetchCountryDatabase(country);
                if (data is not null)
                {
                    resp = data;
                }
                else
                {
                    Console.WriteLine($"[INFO] Country '{country}' not in DB, fetching from external API...");
                    var response = await _fetchService.FetchCountryOnline(country);

                    if (response is null)
                    {
                        Console.WriteLine($"[WARN] External API returned null for '{country}'");
                        return NotFound(new { error = $"Could not fetch data for country '{country}'. Please try again later." });
                    }

                    resp = response;

                    try
                    {
                        await _saveCountry.Save(resp);
                    }
                    catch (Exception)
                    {
                    }
                }
                
                await _downloadMedia.FetchAndSaveMediaUrlsAsync(resp);
                var similar = await _fetchService.FetchSimilarCountries(resp);

                return Ok(new { target = resp, similar });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[ERROR] Unexpected error in GetCountry for '{country}': {ex.Message}");
                return StatusCode(500, new { error = ex.Message });
            }
        }
















        // not used in production, i just used it in testing the gemini api
        [HttpDelete("{country}")]
        public async Task<IActionResult> DeleteCountry(string country)
        {
            try
            {
                var countryToDelete = await _context.Countries
                    .Include(c => c.Currency)
                    .FirstOrDefaultAsync(x => x.Name == country);

                if (countryToDelete is null)
                {
                    return NotFound(new { error = $"Country '{country}' not found." });
                }

                // Get the currency before deleting the country
                var currency = countryToDelete.Currency;

                _context.Countries.Remove(countryToDelete);
                await _context.SaveChangesAsync();

                // Check if this currency is used by any other countries
                if (currency != null)
                {
                    var currencyUsageCount = await _context.Countries
                        .CountAsync(c => c.Currency.ISO == currency.ISO);

                    // If no countries use this currency anymore, delete it
                    if (currencyUsageCount == 0)
                    {
                        _context.Currencies.Remove(currency);
                        await _context.SaveChangesAsync();
                        Console.WriteLine($"[INFO] Deleted unused currency: {currency.Name} ({currency.ISO})");
                    }
                }

                return Ok(new { error = $"Country '{country}' deleted successfully." });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[ERROR] Error deleting country '{country}': {ex.Message}");
                return StatusCode(500, new { error = "An error occurred while deleting the country." });
            }
        }
    }
}
