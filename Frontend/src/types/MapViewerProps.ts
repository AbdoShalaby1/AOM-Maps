import type {  Dispatch, SetStateAction } from "react"
import type { CountryData } from "./CountryData"
import type { MapMode } from "./MapMode"

export interface MapViewerProps {
  size : MapMode
  setSize : Dispatch<SetStateAction<MapMode>>
  setSidebarCountry: Dispatch<SetStateAction<CountryData | null>>
  setSimilarCountries: Dispatch<SetStateAction<string[]>>
}