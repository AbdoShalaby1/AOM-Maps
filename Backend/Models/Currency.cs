using System.Text.Json.Serialization;

namespace AOM_Maps.Models
{
    public class Currency
    {
        [JsonIgnore]
        public int Id { get; set; }
        [JsonIgnore]
        public List<Country> Countries { get; set; } = null!;
        public string Name { get; set; } = null!;
        public string ISO { get; set; } = null!;
    }
}
