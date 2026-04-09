export interface CountryData {
  error?: string;
  name: string;
  continent: string;
  president: string;
  capital: string;
  population: string;
  summary: string;
  geography: string;
  "HDI Level": string;
  politics: string;
  entertainment: string;
  culinary: string;
  sport: string;
  economy: string;
  currency: {
    name: string;
    iso: string;
  };
  languages: string[];
  "Sport Teams": { sport: string; team: string }[];
  dishes: { title: string; description: string; imageUrl?: string }[];
  "Famous Landmarks": { title: string; description: string; imageUrl?: string }[];
  history: { title: string; description: string; imageUrl?: string }[];
  media?: CountryMedia[];
}

export interface CountryMedia {
  id: number;
  countryId: number;
  type: string;  // "flag", "anthem", "capital", "culture", "president", "dish-0", "landmark-1", etc.
  link: string;  // Direct URL to the media file
}