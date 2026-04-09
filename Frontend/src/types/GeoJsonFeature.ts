import type { GeoJsonProperties } from "./GeoJsonProperties";
export interface GeoJsonFeature {
  type: string;
  properties: GeoJsonProperties;
  geometry: {
    type: 'Polygon' | 'MultiPolygon';
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    coordinates: any[];
  };
  bbox?: [number, number, number, number]; // [minLon, minLat, maxLon, maxLat]
  focusBbox?: [number, number, number, number]; // [minLon, minLat, maxLon, maxLat]
}