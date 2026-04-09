using System.Text.Json.Serialization;

namespace AOM_Maps.Models
{
    public class TitleDescription
    {
        [JsonIgnore]
        public int Id { get; set; }
        [JsonIgnore]
        public int CountryId { get; set; }
        [JsonIgnore]
        public Country Country { get; set; } = null!;
        public string Title { get; set; } = null!;
        public string Description { get; set; } = null!;

    }
}
