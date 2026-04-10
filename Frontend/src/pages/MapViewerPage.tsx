import React, { useEffect, useState, useCallback,useRef } from 'react';
import MapCanvas from '../components/MapCanvas';
import CountryTooltip from '../components/CountryTooltip';
import GeoJsonService from '../services/GeoJsonService';
import type { GeoJsonFeature } from '../types/GeoJsonFeature';
import type { LatLon } from '../types/LatLon';
import './MapViewerPage.css';
import type { MapMode } from '../types/MapMode';
import type { MapViewerProps } from '../types/MapViewerProps';
import getCountry from '../services/GetCountryData';
import { useNavigate, useParams } from 'react-router-dom';
import arabicMap from '../countries/countriesARMap.json';
import englishMap from '../countries/countriesENMap.json';
import { useLang } from '../contexts/lang';

const mapStyles: Record<MapMode, string> = {

  full: "fixed inset-0 z-40 w-screen h-screen transition-all duration-500", 

  sidebar: "fixed inset-0 z-20 w-screen h-screen transition-all duration-500",
  
  hidden: "fixed inset-0 w-screen h-screen transition-all duration-500 z-0"
};

const MapViewerPage: React.FC<MapViewerProps> = ({
  size, setSize, setSidebarCountry, setSimilarCountries
  }) => {
  const [currentCountry, setCurrentCountry] = useState<GeoJsonFeature | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cursor, setCursor] = useState("default");
  const navigate = useNavigate();
  const { lang } = useLang();
const { country } = useParams<{ country: string }>();
const [focusBbox, setFocusBbox] = useState<[number, number, number, number] | null>(null);
const justClickedRef = useRef(false);
  /**
   * Load GeoJSON data on component mount
   */
  useEffect(() => {
    const loadGeoData = async () => {
      try {
        setIsLoading(true);
        await GeoJsonService.fetchGeoJsonData();
        setIsLoading(false);
      } catch (err) {
        console.error('Failed to load GeoJSON:', err);
        setError('Failed to load map data. Please refresh the page.');
        setIsLoading(false);
      }
    };

    loadGeoData();
  }, []);

  useEffect(() => {
  if (!country || isLoading || !GeoJsonService.IsCountryValid(country.replaceAll('-',' '),lang)) 
    {
      setFocusBbox(null);
      navigate('/');
      return;
    }
      

  setSize('sidebar');
  setSidebarCountry(null);

  if (!justClickedRef.current) {
    // Direct URL navigation → need to zoom manually
    const feature = GeoJsonService.getFeatures().find(
      f => {
        if (lang === "en") return f.properties.name?.toLowerCase() === country.toLowerCase().replaceAll('-',' ')
          // @ts-expect-error : always exists
          else return f.properties.name?.toLowerCase() === englishMap[country.replaceAll('-',' ')].toLowerCase().replaceAll('-',' ')
        }
    );
    if (feature?.focusBbox) {
      console.log(feature.focusBbox);
      setFocusBbox(feature.focusBbox);
    }
  } else {
    // Came from a map click → zoom already happened in MapCanvas
    justClickedRef.current = false;
    setFocusBbox(null);
  }
    getCountry(country.replaceAll('-',' '),lang)
      .then(data => {
        setSidebarCountry(data.target);
        setSimilarCountries(data.similar);
      })
      // @ts-expect-error: Silence the next line specifically
      .catch(e => setSidebarCountry({
        error: e.response.data.error
      }))

// eslint-disable-next-line react-hooks/exhaustive-deps
}, [country, isLoading]);
  

  /**
   * Handle country hover from map canvas
   */
  const handleCountryHover = useCallback((latLon: LatLon, x: number, y: number) => {
    const feature = GeoJsonService.getCountryFeature(latLon.lat, latLon.lon);

    // Only update if country changed to avoid unnecessary re-renders
    if (feature !== currentCountry) {
      setCurrentCountry(feature);
    }
    if(feature!==null){
      setTooltipPosition({ x, y });
      setCursor("pointer");
    }else{
      setCurrentCountry(null);
      setCursor("default");
    }    
  }, [currentCountry]);

const handleCountryClick = (latLon: LatLon) => {
  const clickedCountry = GeoJsonService.getCountryFeature(latLon.lat, latLon.lon) ?? currentCountry;
  if (clickedCountry != null) {
    justClickedRef.current = true;
    navigate('/' + (lang === "en" 
      ? clickedCountry.properties.name.replace(/ /g, '-') 
      // @ts-expect-error : always exists
    : arabicMap[clickedCountry.properties.name].replace(/ /g, '-'))
);
  }
};

  if (isLoading) {
  return (
    <div 
      className="fixed inset-0 flex flex-col items-center justify-center transition-opacity duration-500"
      style={{ backgroundColor: '#a2caff' }}
    >
      <div className="relative flex items-center justify-center">
        <div className="absolute h-16 w-16 rounded-full border-4 border-white/30 animate-ping"></div>
        
        <div className="relative h-12 w-12 bg-white rounded-full shadow-lg flex items-center justify-center">
          <div className="h-5 w-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
      
      <p className="mt-4 text-white font-medium tracking-widest text-sm uppercase animate-pulse">
        Initializing Map...
      </p>
    </div>
  );
}

  if (error) {
    return (
      <div className="map-viewer-container error">
        <div className="error-message">{error}</div>
      </div>
    );
  }

  return (
    <div className={"map-viewer-container"}>
      <MapCanvas
        onCountryHover={handleCountryHover}
        onCountryClick={handleCountryClick}
        mapImageUrl="/MapFiles/map.dzi"
        className={"map-canvas cursor-"+cursor+" "+mapStyles[size]}
        currentCountry={currentCountry}
        focusBbox={focusBbox}
        mapMode={size}
      />

      <CountryTooltip
        visible={!!currentCountry}
        countryName={
          currentCountry?.properties?.NAME ||
          currentCountry?.properties?.name ||
          'Unknown'
        }
        x={tooltipPosition.x}
        y={tooltipPosition.y}
      />
    </div>
  );
};

export default MapViewerPage;
