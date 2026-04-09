using System.Text.Json.Serialization;

namespace AOM_Maps.Models
{
    public class Language
    {
        [JsonIgnore]
        public int Id { get; set; }
        [JsonIgnore]
        public int CountryId { get; set; }
        public string Name { get; set; } = null!;
        [JsonIgnore]
        public Country Country { get; set; } = null!;
    }
}
