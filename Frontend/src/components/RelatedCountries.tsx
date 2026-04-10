import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaEye, FaEyeSlash } from 'react-icons/fa6';

interface Props {
  neighbors: string[];
}

const NeighborStrap = ({ neighbors }: Props) => {
  const [isVisible, setIsVisible] = useState(true);
  const navigate = useNavigate();

  if (!neighbors || neighbors.length === 0) return null;

  return (
    <div
      className="
        fixed left-1/2 -translate-x-1/2 z-40 select-none
        bottom-[calc(50dvh+0.35rem)] w-[calc(100vw-1.5rem)] max-w-[26rem]
        sm:w-[calc(100vw-2rem)] sm:max-w-none sm:bottom-[calc(50dvh+0.75rem)]
        md:left-[70vw] md:w-[58vw] md:bottom-4
        lg:w-[52vw]
      "
    >
      
      {/* Centered Header Badge */}
      <div className="flex justify-center items-center gap-2 mb-1.5 md:mb-2"> 
        <div className="inline-flex items-center gap-1.5 px-2 py-1 md:gap-3 md:px-3 md:py-1.5 bg-slate-900/90 backdrop-blur-sm rounded-full border border-slate-700/50">
          <span className="flex h-1.5 w-1.5 md:h-2 md:w-2 relative">
            <span className="animate-ping absolute inline-flex h-1.5 w-1.5 md:h-2 md:w-2 rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 md:h-2 md:w-2 bg-blue-600"></span>
          </span>
          <p className="text-[8px] md:text-[10px] uppercase tracking-[0.16em] md:tracking-[0.3em] text-slate-300 font-bold">
            See Also
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsVisible((prev) => !prev)}
          className="inline-flex items-center px-2 py-1 md:px-3 md:py-1.5 rounded-full border border-slate-700/50 bg-slate-900/90 text-slate-200 text-[9px] md:text-[11px] font-bold uppercase tracking-[0.12em] md:tracking-[0.2em] hover:bg-slate-800 transition-colors cursor-pointer"
          aria-label={isVisible ? 'Hide similar countries' : 'Show similar countries'}
        >
          {isVisible ? <FaEye /> : <FaEyeSlash />}
        </button>
      </div>
      
      {/* Wrapped Container */}
      {isVisible && (
        <div className="relative group">
          <div className="flex flex-wrap gap-2 md:gap-3 p-2 md:p-2.5 justify-center">
          {neighbors.map((country) => (
            <button 
              key={country} 
              onClick={async () => navigate(`/${country.replaceAll(" ","-")}`)}
              className="group flex-shrink-0 flex items-center gap-2
                         bg-slate-900/80 backdrop-blur-xl
                         border border-white/20 
                         px-3 py-2 md:px-5 md:py-2.5 rounded-full
                         cursor-pointer
                         hover:bg-slate-900 hover:border-blue-400/50
                         hover:shadow-[0_0_20px_rgba(59,130,246,0.15)]
                         transition-all duration-300"
            >
              <span className="text-xs md:text-sm font-semibold text-white tracking-tight whitespace-nowrap">
                  {country}
              </span>
            </button>
          ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default NeighborStrap;