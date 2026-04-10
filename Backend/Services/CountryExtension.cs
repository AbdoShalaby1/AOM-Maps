using AOM_Maps.DTOS;
using AOM_Maps.Models;
using static System.Runtime.InteropServices.JavaScript.JSType;

namespace AOM_Maps.Services
{
    public static class CountryExtension
    {
        public static CountryDTO ToDTO(this Country data)
        {
            return new CountryDTO
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
                Currency = data.Currency,
                SportTeams = data.SportTeams,
                Languages = [.. data.Languages.Select(l => l.Name)],
                Dishes = data.Dishes,
                Landmarks = data.Landmarks,
                History = data.History,
                Media = data.Media,
                Lang = data.Lang
            };
        }
    }
}
