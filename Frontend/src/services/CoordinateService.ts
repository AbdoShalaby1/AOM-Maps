/**
 * CoordinateService
 * Handles coordinate transformations between screen pixels, viewport, image, and lat/lon
 * Supports Web Mercator projection
 */

import type { LatLon } from "../types/LatLon";
import type { Point } from "../types/Point";



class CoordinateService {
  /**
   * CALIBRATED: Converts mouse pixels to the correct country coordinates
   */
  imageCoordinatesToLatLon(
    imageX: number,
    imageY: number
  ): LatLon {
    // 1. Horizontal Calibration (Longitude)
    // Distance between Egypt (25.0) and Gold Coast (153.4)
    const lonPerPixel = (153.4 - 25.0) / (14688 - 8846);
    const lonAtPixelZero = 25.0 - (8846 * lonPerPixel);
    const lon = lonAtPixelZero + (imageX * lonPerPixel);

    // 2. Vertical Calibration (Latitude)
    const latToMercator = (lat: number) => Math.log(Math.tan(Math.PI / 4 + (lat * Math.PI / 180) / 2));
    
    const mercator1 = latToMercator(22.0);   // Egypt Point
    const mercator2 = latToMercator(-28.0);  // Gold Coast Point
    
    const mercatorPerPixel = (mercator2 - mercator1) / (9491 - 7134);
    const mercatorAtPixelZero = mercator1 - (7134 * mercatorPerPixel);
    
    const currentMercator = mercatorAtPixelZero + (imageY * mercatorPerPixel);
    const lat = (2 * Math.atan(Math.exp(currentMercator)) - Math.PI / 2) * (180 / Math.PI);

    return { 
      lat: this.clampLatitude(lat), 
      lon: this.clampLongitude(lon) 
    };
  }

  latLonToImageCoordinates(
    lat: number,
    lon: number
  ): Point {
    const lonPerPixel = (153.4 - 25.0) / (14688 - 8846);
    const lonAtPixelZero = 25.0 - (8846 * lonPerPixel);
    const x = (lon - lonAtPixelZero) / lonPerPixel;

    const latToMercator = (l: number) => Math.log(Math.tan(Math.PI / 4 + (l * Math.PI / 180) / 2));
    const mercator1 = latToMercator(22.0);
    const mercator2 = latToMercator(-28.0);
    const mercatorPerPixel = (mercator2 - mercator1) / (9491 - 7134);
    const mercatorAtPixelZero = mercator1 - (7134 * mercatorPerPixel);

    const currentMercator = latToMercator(lat);
    const y = (currentMercator - mercatorAtPixelZero) / mercatorPerPixel;

    return { x, y };
  }

  clampLatitude(lat: number): number {
    return Math.max(-85.051129, Math.min(85.051129, lat));
  }

  clampLongitude(lon: number): number {
    return ((lon + 180) % 360 + 360) % 360 - 180;
  }
}

export default new CoordinateService();
