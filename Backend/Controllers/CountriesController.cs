using AOM_Maps.Context;
using AOM_Maps.DTOS;
using AOM_Maps.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AOM_Maps.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CountriesController(Translate _translate, AppDbContext _context, SaveCountry _saveCountry, FetchCountryService _fetchService, DownloadMedia _downloadMedia) : ControllerBase
    {
        [HttpGet("{country}")]
        public async Task<ActionResult<CountryDTO?>> GetCountry(string country, [FromQuery] string lang = "en")
        {
            CountryDTO resp = null!;
            try
            {
                var data = await _fetchService.FetchCountryDatabase(country,lang);
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
                
                await _downloadMedia.FetchAndSaveMediaUrlsAsync(resp,lang);
                var similar = await _fetchService.FetchSimilarCountries(resp,lang);

                return Ok(new { target = resp, similar });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[ERROR] Unexpected error in GetCountry for '{country}': {ex.Message}");
                return StatusCode(500, new { error = ex.Message });
            }
        }








        [HttpGet("translate/{country}")]
        public async Task<IActionResult> TranslateCountry(string country)
        {
            try
            {
                await _translate.TranslateCountries(country);
                return Ok();
            }
            catch (Exception ex)
            {
                // Extract the status code from the exception message (e.g., "429 Too Many Requests")
                if (ex.Message.Contains("429")) return StatusCode(429);
                if (ex.Message.Contains("401") || ex.Message.Contains("403")) return StatusCode(403);
                if (ex.Message.Contains("400")) return StatusCode(400);

                // Fallback for everything else
                return StatusCode(500);
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
