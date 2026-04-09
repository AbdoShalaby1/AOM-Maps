import type { GeoJsonFeature } from "./GeoJsonFeature";
export interface GeoJsonData {
  type: string;
  features: GeoJsonFeature[];
}