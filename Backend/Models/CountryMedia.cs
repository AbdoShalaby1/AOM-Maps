using System.Text.Json.Serialization;

namespace AOM_Maps.Models
{
    public class CountryMedia
    {
        [JsonIgnore]
        public int Id { get; set; }
        [JsonIgnore]
        public int CountryId { get; set; }
        [JsonIgnore]

        public Country Country { get; set; } = null!;
        public string Type { get; set; } = null!;
        public string Link { get; set; } = null!;

    }
}
