import allCountries from '../countries/countryNames.json';
import allCountriesAR from '../countries/countryNamesAR.json';
import { useMemo } from 'react';

function scoreMatch(name: string, query: string): number {
  const normalizedName = name.toLowerCase().trim();
  const normalizedQuery = query.toLowerCase().trim();

  if (!normalizedQuery) return 0;

  // Level 1: Exact Prefix (Highest Priority)
  if (normalizedName.startsWith(normalizedQuery)) return 3;

  // Level 2: Substring (Medium Priority)
  if (normalizedName.includes(normalizedQuery)) return 2;

  // Level 3: Fuzzy Subsequence (Lowest Priority)
  // Checks if characters appear in order: "pain" -> "sPAIN"
  let queryIdx = 0;
  for (let nameIdx = 0; nameIdx < normalizedName.length; nameIdx++) {
    if (normalizedName[nameIdx] === normalizedQuery[queryIdx]) {
      queryIdx++;
    }
    if (queryIdx === normalizedQuery.length) return 1;
  }

  return 0;
}

export function useFuzzySearch(query: string, maxResults = 5, lang = "en"): string[] {
  return useMemo(() => {
    if (!query.trim()) return [];
    const sourceList = lang === "en" ? allCountries : allCountriesAR;

    return sourceList
      .map(name => ({ name, score: scoreMatch(name, query) }))
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score || a.name.localeCompare(b.name))
      .slice(0, maxResults)
      .map(item => item.name);
  }, [query, lang, maxResults]);
}