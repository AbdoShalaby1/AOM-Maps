import { useState } from 'react'
import SidePanel from './components/Sidepanel'
import MapViewerPage from './pages/MapViewerPage'
import type {CountryData}  from './types/CountryData';
import type {MapMode}  from './types/MapMode';
import Searchbar from './components/SearchBar';
import { useNavigate } from 'react-router-dom';
import NeighborStrap from './components/RelatedCountries';

function App() {
    const [sidebarCountry, setsidebarCountry] =
    useState<CountryData | null>(null);
    const [similarCountries, setSimilarCountries] = useState<string[]>([]);
    const [mapSize, setMapSize] = useState<MapMode>('full');
    const navigate = useNavigate();

    const handleClose=()=>{
      setMapSize('full');
      setsidebarCountry(null);
      navigate('/');
    }

  return (
    <div className='relative flex h-screen w-full transition-all duration-500'>
      <SidePanel
          country={sidebarCountry}
          mode={mapSize}
          setMode={setMapSize}
          onClose={handleClose}
        />
      <div className="flex-1 relative h-full transition-all duration-500">
        <MapViewerPage size={mapSize} setSize={setMapSize} setSidebarCountry={setsidebarCountry} setSimilarCountries={setSimilarCountries}/>
      </div>
        {mapSize === 'sidebar' && sidebarCountry != null && <NeighborStrap neighbors={similarCountries} />}
        <Searchbar isVisible={mapSize !== 'hidden'} mapMode={mapSize} /> 
    </div>
  );
}


export default App;