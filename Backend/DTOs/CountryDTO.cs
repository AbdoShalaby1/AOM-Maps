using AOM_Maps.Models;
using System.Text.Json.Serialization;

namespace AOM_Maps.DTOS
{
    public class CountryDTO
    {
        public string Name { get; set; } = null!;
        public string Continent { get; set; } = null!;
        public string President { get; set; } = null!;
        public string Capital { get; set; } = null!;
        public string Population { get; set; } = null!;
        public string Summary { get; set; } = null!;
        public string Geography { get; set; } = null!;
        [JsonPropertyName("HDI Level")]
        public string HDILevel { get; set; } = null!;
        public string Politics { get; set; } = null!;
        public string Entertainment { get; set; } = null!;
        public string Culinary { get; set; } = null!;
        public string Sport { get; set; } = null!;
        public string Economy { get; set; } = null!;
        public string Lang { get; set; } = null!;
        public Currency Currency { get; set; } = null!;
        [JsonPropertyName("Sport Teams")]
        public List<SportTeam> SportTeams { get; set; } = null!;
        public List<string> Languages { get; set; } = null!;
        public List<Dish> Dishes { get; set; } = null!;
        [JsonPropertyName("Famous Landmarks")]
        public List<Landmark> Landmarks { get; set; } = null!;
        public List<History> History { get; set; } = null!;
        public List<CountryMedia>? Media { get; set; }
    }
}
