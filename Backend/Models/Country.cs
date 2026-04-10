using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace AOM_Maps.Models
{
    [Index(nameof(Name))]
    public class Country
    {
        [JsonIgnore]
        public int Id { get; set; }
        public string Name { get; set; } = null!;
        public string Continent { get; set; } = null!;
        public string President { get; set; } = null!;
        public string Capital { get; set; } = null!;
        public string Population { get; set; } = null!;
        public string Summary { get; set; } = null!;
        public string Geography { get; set; } = null!;

        public string HDILevel { get; set; } = null!;
        public string Politics { get; set; } = null!;
        public string Entertainment { get; set; } = null!;
        public string Culinary { get; set; } = null!;
        public string Sport { get; set; } = null!;
        public string Economy { get; set; } = null!;

        public Currency Currency { get; set; } = null!;
        public List<SportTeam> SportTeams { get; set; } = null!;
        public List<Language> Languages { get; set; } = null!;
        public List<CountryMedia>? Media { get; set; }
        public List<CountryMedia>? ArabicMedia { get; set; }

        public List<Dish> Dishes { get; set; } = null!;

        public List<Landmark> Landmarks { get; set; } = null!;
        public List<History> History { get; set; } = null!;

        [MaxLength(2)]
        public string Lang { get; set; } = "en";
    }
}