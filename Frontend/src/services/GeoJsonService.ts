import type { GeoJsonData } from "../types/GeoJsonData";
import type { GeoJsonFeature } from "../types/GeoJsonFeature";
import countryNames from '../countries/countryNames.json';
import CountryNamesAR from '../countries/countryNamesAR.json';

class GeoJsonService {
  private geoJsonData: GeoJsonData | null = null;
  private isLoaded = false;

  /**
   * Fetch GeoJSON data from remote source
   */
  async fetchGeoJsonData(): Promise<GeoJsonData> {
    if (this.geoJsonData) {
      return this.geoJsonData;
    }

    try {
      const response = await fetch('/countries.geojson');
      const data: GeoJsonData = await response.json();

      // 1. Clip the coordinates to prevent infinite Mercator scaling
      this.clipFeatures(data);
      
      // 2. Compute bounding boxes for the newly clipped data
      this.computeBBoxes(data);
      
      this.geoJsonData = data;
      this.isLoaded = true;
      return data;
    } catch (error) {
      console.error('Failed to fetch GeoJSON data:', error);
      throw error;
    }
  }

  /**
   * Iterates through all features and caps the latitude to prevent 
   * rendering errors in Mercator projections.
   */
  private clipFeatures(data: GeoJsonData): void {
    const MERCATOR_LAT_LIMIT = -85.05112878;

    data.features.forEach(feature => {
      if (feature.geometry.type === 'Polygon') {
        feature.geometry.coordinates = feature.geometry.coordinates.map(ring =>
          ring.map((coord: number[]) => [coord[0], Math.max(coord[1], MERCATOR_LAT_LIMIT)])
        );
      } else if (feature.geometry.type === 'MultiPolygon') {
        feature.geometry.coordinates = feature.geometry.coordinates.map(polygon =>
          polygon.map((ring: number[][]) =>
            ring.map((coord: number[]) => [coord[0], Math.max(coord[1], MERCATOR_LAT_LIMIT)])
          )
        );
      }
    });
  }

  /**
   * Compute bounding boxes for all features (for faster hit detection)
   * Draws an invisible rectangle around the country bypassing the complex geometry
   * if the mouse is inside this rectangle: it triggers the complex geometry calculation
   * for the actual country borders
   * this improves performance
   */
  private computeBBoxes(data: GeoJsonData): void {
  data.features.forEach(feature => {
    const lats: number[] = [];
    const lons: number[] = [];
    
    const coords = feature.geometry.type === 'Polygon' 
      ? [feature.geometry.coordinates] 
      : feature.geometry.coordinates;

    const flattenedCoords = coords.flat(Infinity) as number[];
    flattenedCoords.forEach((val, i) => {
      if (i % 2 === 0) lons.push(val);
      else lats.push(val);
    });

    feature.bbox = [
      Math.min(...lons),
      Math.min(...lats),
      Math.max(...lons),
      Math.max(...lats)
    ];

    if (feature.geometry.type === 'MultiPolygon') {
      // Find the polygon with the most points (the mainland)
      const mainland = [...feature.geometry.coordinates].sort((a, b) => 
        b[0].length - a[0].length
      )[0];

      const mainlandLats: number[] = [];
      const mainlandLons: number[] = [];
      const mainlandFlat = mainland.flat(Infinity) as number[];

      mainlandFlat.forEach((val, i) => {
        if (i % 2 === 0) mainlandLons.push(val);
        else mainlandLats.push(val);
      });

      feature.focusBbox = [
        Math.min(...mainlandLons),
        Math.min(...mainlandLats),
        Math.max(...mainlandLons),
        Math.max(...mainlandLats)
      ];
      if (["Samoa","American Samoa", "Tonga", "Wallis and Futuna"].includes(feature.properties.name))
        {
        feature.focusBbox[0] += 360;
        feature.focusBbox[2] += 360;
      }
      if (feature.properties.name === "Wallis and Futuna")
      {
        feature.focusBbox[0] -= 5;
        feature.focusBbox[2] -= 5;
      }
    } else {
      // For simple Polygons, focusBox is the same as bbox
      feature.focusBbox = feature.bbox;
      if (feature.properties.name === "Niue")
      {
        feature.focusBbox[0] += 360;
        feature.focusBbox[2] += 360;
      }
    }
  });
}

  /**
   * Get country feature at given coordinates using point-in-polygon test
   * 
   * try the bounding box first which may short circuit 
   * the ray cast skipping an expensive computation
   * then try the ray casting algorithm
   */
  getCountryFeature(lat: number, lon: number): GeoJsonFeature | null {
  if (!this.geoJsonData) return null;

  for (const feature of this.geoJsonData.features) {
    const bbox = feature.bbox;
    if (!bbox) continue;

    if (lon < bbox[0] || lon > bbox[2] || lat < bbox[1] || lat > bbox[3]) {
      continue;
    }

    const polygons = feature.geometry.type === 'Polygon'
      ? [feature.geometry.coordinates]
      : feature.geometry.coordinates;

    const isInside = polygons.some(polygon => {
      const [exteriorRing, ...holes] = polygon;
      const inMainShape = this.isPointInPolygon(lat, lon, exteriorRing);
      if (!inMainShape) return false;

      const inAHole = holes.some((hole: number[][]) => this.isPointInPolygon(lat, lon, hole));
      
      return !inAHole;
    });

    if (isInside) {
      return feature;
    }
  }

  return null;
}

  /**
   * Ray casting algorithm for point-in-polygon detection:
   * 
   * We take the current point the mouse is hovering on
   * then shoot a ray (draw an invisible line) to the right until
   * we reach the end of the map (the right border of the entire map)
   * if we touch a country borders even times then we are out
   * if odd then we are in
   * how is that?
   * imagine a square country and you are in the middle
   * a ray shoots to the right
   * it touches the border once which is odd then we are in
   * now if we are outside, it touches twice (even) so we are out
   * 
   * ring parameter is the country borders
   */
  private isPointInPolygon(
    lat: number,
    lon: number,
    ring: number[][]
  ): boolean {
    let inside = false;

    for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
      const [xi, yi] = ring[i];
      const [xj, yj] = ring[j];

      if (
        ((yi > lat) !== (yj > lat)) &&
        lon < ((xj - xi) * (lat - yi)) / (yj - yi) + xi
      ) {
        inside = !inside;
      }
    }

    return inside;
  }

  IsCountryValid(name: string, lang: string): boolean {
    if (lang == "en")
      return countryNames.includes(name);
    return CountryNamesAR.includes(name);
}

  /**
   * Get all features
   */
  getFeatures(): GeoJsonFeature[] {
    return this.geoJsonData?.features || [];
  }

  getCountryBBox(name: string): [number, number, number, number] | null {
    if (!this.geoJsonData) return null;
    
    const feature = this.geoJsonData.features.find(f => 
      f.properties.name?.toLowerCase() === name.toLowerCase()
    );

    return feature?.bbox || null;
  }
  /**
   * Check if data is loaded
   */
  isDataLoaded(): boolean {
    return this.isLoaded;
  }

  /**
   * Clear cached data
   */
  clearCache(): void {
    this.geoJsonData = null;
    this.isLoaded = false;
  }
}

export default new GeoJsonService();
