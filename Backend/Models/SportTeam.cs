using System.Text.Json.Serialization;

namespace AOM_Maps.Models
{
    public class SportTeam
    {
        [JsonIgnore]
        public int CountryId { get; set; }
        [JsonIgnore]
        public int Id { get; set; }
        [JsonIgnore]
        public Country Country { get; set; } = null!;
        public string Sport { get; set; } = null!;
        public string Team { get; set; } = null!;
    }
}
