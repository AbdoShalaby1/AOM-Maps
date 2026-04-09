import type { LatLon } from "./LatLon";
import type { GeoJsonFeature } from "./GeoJsonFeature";
import type { MapMode } from "./MapMode";

export interface MapCanvasProps {
  onCountryHover: (latLon: LatLon, x: number, y: number) => void;
  onCountryClick: (latLon: LatLon) => void;
  mapImageUrl?: string;
  className?: string;
  currentCountry: GeoJsonFeature | null;
  focusBbox?: [number, number, number, number] | null;
  mapMode: MapMode;
}