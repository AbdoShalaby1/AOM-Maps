/* eslint-disable */
import React, { useEffect, useRef } from 'react';
import OpenSeadragon from 'openseadragon';
import CoordinateService from '../services/CoordinateService';
import GeoJsonService from '../services/GeoJsonService';
import type { MapCanvasProps } from '../types/MapCanvasProps';
import { useTheme } from '../contexts/theme';

function performZoom(
  viewerInstance: OpenSeadragon.Viewer,
  bbox: [number, number, number, number]
) {
  const [minLon, minLat, maxLon, maxLat] = bbox;
  const topLeft = CoordinateService.latLonToImageCoordinates(maxLat, minLon);
  const bottomRight = CoordinateService.latLonToImageCoordinates(minLat, maxLon);
  const imageSize = viewerInstance.world.getItemAt(0).getContentSize();
  const width = (bottomRight.x - topLeft.x) / imageSize.x;
  const height = (bottomRight.y - topLeft.y) / imageSize.y;
  const x = topLeft.x / imageSize.x;
  const y = topLeft.y / imageSize.x;
  const isMobile = typeof window !== 'undefined' && window.matchMedia('(max-width: 768px)').matches;
  const scaleFactor =  (isMobile ? 1.6 : 1.3);
  const finalWidth = width * scaleFactor;
  const finalHeight = height * scaleFactor;
  const paddedRect = new OpenSeadragon.Rect(
    x - (finalWidth - width) / 2,
    y - (finalHeight - height) / 2,
    finalWidth,
    finalHeight
  );
  // Keep desktop framing unchanged; reduce left shift on phones.
  paddedRect.x -= paddedRect.width * (isMobile ? 0 : 0.4);
  // On mobile with bottom sidebar open, bias zoom target upward into visible map area.
  if (isMobile) {
    paddedRect.y += paddedRect.height * 0.55;
  }
  console.log("Zoomed!");
  viewerInstance.viewport.fitBoundsWithConstraints(paddedRect, false);
}

const MapCanvas: React.FC<MapCanvasProps> = ({
  onCountryHover,
  onCountryClick,
  mapImageUrl = '/MapFiles/map.dzi',
  className = '',
  focusBbox,
  mapMode
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<OpenSeadragon.Viewer | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mouseTrackerRef = useRef<OpenSeadragon.MouseTracker | null>(null);
  const pendingBboxRef = useRef<[number, number, number, number] | null>(null);
  const isMobile = typeof window !== 'undefined' && window.matchMedia('(max-width: 768px)').matches;
  const applyViewportLayout = (viewerInstance: OpenSeadragon.Viewer) => {
    if (!viewerInstance.world.getItemAt(0)) return;
    const viewport = viewerInstance.viewport as OpenSeadragon.Viewport & { visibilityRatio: number };
    const inSidebarMode = mapMode === 'sidebar';
    viewport.visibilityRatio = inSidebarMode ? 0.6 : 1.0;
    (viewerInstance as OpenSeadragon.Viewer & { constrainDuringPan: boolean }).constrainDuringPan = true;
    viewport.applyConstraints(false);
  };

  useEffect(() => {
  const viewerInstance = viewerRef.current;
  if (!viewerInstance) return;

  const onCanvasActivate = (event: any) => {
    const clickPosition = (event as { position?: OpenSeadragon.Point }).position;
    const hasQuickFlag = typeof (event as { quick?: unknown }).quick === 'boolean';
    if ((hasQuickFlag && !(event as { quick: boolean }).quick) || !clickPosition) return;
    if (!viewerInstance?.world.getItemAt(0)) return;
    try {
      const viewportPoint = viewerInstance.viewport.pointFromPixel(clickPosition);
      const imagePoint = viewerInstance.viewport.viewportToImageCoordinates(viewportPoint);
      const latLon = CoordinateService.imageCoordinatesToLatLon(imagePoint.x, imagePoint.y);
      onCountryClick(latLon);

      const clickedCountry = GeoJsonService.getCountryFeature(latLon.lat, latLon.lon);
      if (!clickedCountry?.focusBbox) return;
      performZoom(viewerInstance, clickedCountry.focusBbox);
    } catch (error) {
      console.error('Error processing tap/click:', error);
    }
  };

  const canvasTap = 'canvas-tap' as unknown as keyof OpenSeadragon.ViewerEventMap;
  viewerInstance.addHandler('canvas-click', onCanvasActivate);
  viewerInstance.addHandler(canvasTap, onCanvasActivate);

  return () => {
    viewerInstance.removeHandler('canvas-click', onCanvasActivate);
    viewerInstance.removeHandler(canvasTap, onCanvasActivate);
  };
}, [onCountryClick]);


useEffect(() => {
  if (!containerRef.current) return;

  const viewer = new OpenSeadragon.Viewer({
    element: containerRef.current,
    showNavigationControl: false,
    animationTime: 0.5,
    tileSources: mapImageUrl,
    blendTime: 0.1,
    drawer : 'canvas',
    gestureSettingsMouse: {
      clickToZoom: false,
      dblClickToZoom: false,
    },
    
    gestureSettingsTouch: {
      clickToZoom: false,
      dblClickToZoom: false,
    },
    minZoomImageRatio: isMobile ? 2 : 1.0, 
    maxZoomPixelRatio: 2,
    visibilityRatio: 0.6, 
    constrainDuringPan: true,
    defaultZoomLevel: 1.2
  });
  viewerRef.current = viewer;
  
  const tracker = new OpenSeadragon.MouseTracker({
    element: viewer.canvas,
    moveHandler: (e: OpenSeadragon.MouseTrackerEvent) => handleMouseMove(e),
    exitHandler: () => onCountryHover({ lat: 0, lon: 0 }, -1000, -1000)
  });
  
  const handleMouseMove = (e: OpenSeadragon.MouseTrackerEvent) => {
    if (!viewerRef.current?.world.getItemAt(0) || !onCountryHover) {
      return ;
    }
  
    try {
      const pos = (e as unknown as { position?: OpenSeadragon.Point }).position;
      if (!pos) return;
      const viewportPoint = viewerRef.current.viewport.pointFromPixel(pos);
      const imagePoint = viewerRef.current.viewport.viewportToImageCoordinates(viewportPoint);
      const latLon = CoordinateService.imageCoordinatesToLatLon(
        imagePoint.x,
        imagePoint.y,
      );

      onCountryHover(latLon, pos.x, pos.y);
      
    } catch (error) {
      console.error('Error processing mouse move:', error);
    }
  };
  viewer.addHandler('open', () => {
    applyViewportLayout(viewer);
    if (!canvasRef.current) {
      const overlay = document.createElement('canvas');
      overlay.style.pointerEvents = 'none';
      overlay.style.position = 'absolute';
      overlay.style.top = '0';
      overlay.style.left = '0';
      viewer.canvas.appendChild(overlay);
      canvasRef.current = overlay;

        if (pendingBboxRef.current) {
          performZoom(viewer, pendingBboxRef.current);
          pendingBboxRef.current = null;
        }
    }

    mouseTrackerRef.current = tracker;
  });
  
  
  return () => {
    if (mouseTrackerRef.current) {
      mouseTrackerRef.current.destroy();
      mouseTrackerRef.current = null;
    }
    if (viewerRef.current) {
      viewerRef.current.destroy();
      viewerRef.current = null;
    }
    canvasRef.current = null;
  };

},[mapImageUrl]);

useEffect(() => {
  const viewerInstance = viewerRef.current;
  if (!viewerInstance) return;
  applyViewportLayout(viewerInstance);
}, [mapMode]);

useEffect(() => {
  const onResize = () => {
    const viewerInstance = viewerRef.current;
    if (!viewerInstance) return;
    applyViewportLayout(viewerInstance);
  };

  window.addEventListener('resize', onResize);
  return () => window.removeEventListener('resize', onResize);
}, [mapMode]);

useEffect(() => {
  console.log("Bbox Changed");
  if (!focusBbox) return;
  const vi = viewerRef.current;
  if (!vi) { pendingBboxRef.current = focusBbox; return; }
  try {
    performZoom(vi, focusBbox);
  } catch {
    pendingBboxRef.current = focusBbox;
  }
}, [focusBbox]);
const {theme} = useTheme();
  return (
    <div
      ref={containerRef}
      id="osd-viewer"
      className={className}
      style={{
       width: '100%',
      height: '100%',
      position: 'relative',
      top: 0,
      left: 0,
      backgroundColor: '#a2caff',
      filter: theme === "light" ? '' : 'brightness(0.85) invert(1) contrast(1.25) sepia(0.4) saturate(0.6) hue-rotate(180deg)'
      }}
    />
  );
};

export default MapCanvas;
