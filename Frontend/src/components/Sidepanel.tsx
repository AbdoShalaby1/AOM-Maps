import { useEffect, useState } from 'react';
import type { MapMode } from '../types/MapMode';
import type { CountryData } from '../types/CountryData';
import { 
  FaXmark, FaExpand, FaCompress, 
  FaUtensils, FaFutbol, FaBuildingColumns, 
  FaChartLine, FaGripLines, FaScaleBalanced,
  FaMusic, FaMasksTheater
} from 'react-icons/fa6';
import { FaGlobeAfrica } from 'react-icons/fa';
import ConsultingAI from './LoadingSidebar';
import { IoAlertCircle } from 'react-icons/io5';
import { useLang } from '../contexts/lang';
import { useTheme } from '../contexts/theme';

const SidePanel = ({ 
  country, 
  onClose, 
  mode, 
  setMode
}: { 
  country: CountryData | null; 
  onClose: () => void; 
  mode: MapMode; 
  setMode: (mode: MapMode) => void;
}) => {
  const [eraIndex, setEraIndex] = useState(0);
  const [showAllHistory, setShowAllHistory] = useState(false);
  const { lang } = useLang();
  const { theme } = useTheme();
  const dark = theme === 'dark';

  const getMediaUrl = (type: string): string | undefined =>
    country?.media?.find(m => m.type === type)?.link;

  const BLANK_COUNTRY: CountryData = {
    name: '', continent: '', president: '', capital: '', population: '',
    summary: '', geography: '', "HDI Level": '', politics: '',
    entertainment: '', culinary: '', sport: '',economy: '',
    currency: { name: '', iso: '' }, languages: [],
    "Sport Teams": [], dishes: [], "Famous Landmarks": [],
    history: [{ title: '', description: '' }], media: []
  };

  const displayCountry = country || BLANK_COUNTRY;
  const words = displayCountry.name?.split(' ');
  const hasMassiveWord = words?.some(word => word.length > 9);

  useEffect(() => {
    requestAnimationFrame(() => setEraIndex(0));
  }, [displayCountry?.name]);

  const panelStyles: Record<MapMode, string> = {
    sidebar: `
      fixed z-30 transition-all duration-300 ease-in-out shadow-2xl overflow-hidden
      bottom-0 left-0 w-full h-[50dvh] translate-y-0 opacity-100
      md:top-0 md:h-screen md:w-[40%] md:translate-y-0 md:translate-x-0 md:opacity-100
    `,
    full: `
      fixed z-30 transition-all duration-300 ease-in-out overflow-hidden
      bottom-0 left-0 w-full h-[50dvh] translate-y-full opacity-0
      md:top-0 md:h-screen md:w-[40%] md:translate-y-0 md:-translate-x-full md:opacity-0
    `,
    hidden: `
      fixed z-50 transition-all duration-300 ease-in-out overflow-hidden
      bottom-0 left-0 w-full h-[100dvh] translate-y-0 opacity-100
      will-change: transform, opacity
    `
  };

  return (
    <div className={`${panelStyles[mode]} flex flex-col overflow-hidden font-sans
      ${dark
        ? 'bg-gradient-to-b from-slate-900 to-slate-800'
        : 'bg-gradient-to-b from-white to-slate-50'}`}
    >
      {/* --- HEADER --- */}
      <header className="p-3 md:p-4 bg-gradient-to-r from-slate-900 to-slate-800 text-white sticky top-0 z-20 shadow-lg border-b border-slate-700">
        <div className="flex flex-wrap items-center gap-3 md:gap-6">
          {getMediaUrl('flag') && (
            <img 
              src={getMediaUrl('flag')} 
              referrerPolicy="no-referrer"
              alt={`${country?.name} flag`}
              className="w-20 h-14 md:w-32 md:h-20 lg:w-40 lg:h-24 object-cover rounded-xl shadow-xl border-2 border-white/20 flex-shrink-0"
            />
          )}
          <div className="flex-1 min-w-0 pr-1 self-center">
            <h2 className={`font-black leading-tight break-keep ${
              hasMassiveWord ? 'text-xl md:text-2xl' : 'text-xl md:text-3xl lg:text-4xl'
            }`}>
              {displayCountry.name}
            </h2>
          </div>
          <div className="flex items-center gap-1.5 bg-white/10 p-1.5 rounded-lg backdrop-blur-md border border-white/20 flex-shrink-0 mt-0.5">
            <button 
              onClick={() => setMode(mode === 'sidebar' ? 'hidden' : 'sidebar')}
              className="p-1 rounded-md hover:bg-white/20 transition-all duration-300 cursor-pointer text-slate-200 hover:text-white touch-manipulation min-h-[30px] min-w-[30px] flex items-center justify-center"
              title="Toggle View"
            >
              {mode === 'sidebar' ? <FaExpand size={16} /> : <FaCompress size={16} />}
            </button>
            <button 
              onClick={onClose}
              className="p-1 rounded-md hover:bg-red-500/80 transition-all duration-300 cursor-pointer text-slate-200 hover:text-white touch-manipulation min-h-[30px] min-w-[30px] flex items-center justify-center"
              title="Close"
            >
              <FaXmark size={16} />
            </button>
          </div>
        </div>
      </header>

      {/* --- SCROLLABLE CONTENT --- */}
      <main className={`p-3 md:p-5 lg:p-6 space-y-6 md:space-y-8 overflow-y-auto flex-1 min-h-0 custom-scrollbar overscroll-y-contain pb-safe
        ${dark ? 'bg-slate-900' : 'bg-white'}`}
      >
        {!displayCountry.error && displayCountry.name === "" ? (
          <ConsultingAI />
        ) : displayCountry.error ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6">
            <IoAlertCircle className="text-red-500 text-6xl md:text-8xl mb-4 animate-pulse" />
            <h2 className={`text-2xl md:text-4xl font-bold mb-2 ${dark ? 'text-slate-100' : 'text-gray-800'}`}>Error</h2>
            <p className={`text-base md:text-xl max-w-md italic ${dark ? 'text-slate-400' : 'text-gray-600'}`}>
              "{displayCountry.error}"
            </p>
          </div>
        ) : (
          <>
            {/* --- COUNTRY INFO --- */}
            <section className={`p-4 md:p-6 rounded-xl border shadow-sm hover:shadow-md transition-all
              ${dark
                ? 'bg-slate-800 border-slate-700'
                : 'bg-gradient-to-br from-slate-50 to-white border-slate-200'}`}
            >
              <h3 dir={lang === "en" ? "ltr" : "rtl"} className={`text-lg md:text-xl font-bold mb-4 md:mb-5 flex items-center gap-2
                ${dark ? 'text-slate-100' : 'text-slate-800'}`}
              >
                <FaGlobeAfrica className={`text-base md:text-lg ${dark ? 'text-slate-400' : 'text-slate-600'}`} />
                {lang === "en" ? "Country Information" : "معلومات الدولة"}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                {[
                  { label: lang === "en" ? "Capital" : "العاصمة", value: displayCountry.capital },
                  { label: lang === "en" ? "Continent" : "القارة", value: displayCountry.continent },
                  { label: lang === "en" ? "Population" : "عدد السكان", value: displayCountry.population },
                  { label: lang === "en" ? "Life Quality" : "جودة الحياة", value: displayCountry["HDI Level"] }
                ].map((item, i) => (
                  <div key={i} className={`p-3 md:p-4 rounded-lg border
                    ${dark ? 'bg-slate-700 border-slate-600' : 'bg-white border-slate-200'}`}
                  >
                    <p dir={lang === "en" ? "ltr" : "rtl"} className={`text-[10px] md:text-xs font-bold uppercase tracking-widest mb-1
                      ${dark ? 'text-slate-400' : 'text-slate-600'}`}
                    >{item.label}</p>
                    <p dir={lang === "en" ? "ltr" : "rtl"} className={`text-sm md:text-base font-black
                      ${dark ? 'text-slate-100' : 'text-slate-900'}`}
                    >{item.value}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* --- LANGUAGES & ANTHEM --- */}
            <section className={`p-4 md:p-6 rounded-xl border shadow-sm hover:shadow-md transition-all
              ${dark
                ? 'bg-slate-800 border-slate-700'
                : 'bg-gradient-to-br from-slate-50 to-white border-slate-200'}`}
            >
              <h3 dir={lang === "en" ? "ltr" : "rtl"} className={`text-lg md:text-xl font-bold mb-4 md:mb-5 flex items-center gap-2
                ${dark ? 'text-slate-100' : 'text-slate-800'}`}
              >
                <FaMusic className={`text-base md:text-lg ${dark ? 'text-slate-400' : 'text-slate-600'}`} />
                {lang === "en" ? "Languages" : "اللغات"}
                {getMediaUrl('anthem') ? lang === "en" ? " & National Anthem" : " و النشيد الوطني" : null}
              </h3>
              <div className="mb-5 md:mb-6">
                <p dir={lang === "en" ? "ltr" : "rtl"} className={`text-[10px] md:text-sm font-bold uppercase tracking-widest mb-2 md:mb-3
                  ${dark ? 'text-slate-300' : 'text-slate-700'}`}
                >{lang === "en" ? "Official Languages" : "اللغات الرسمية"}</p>
                <div dir={lang === "en" ? "ltr" : "rtl"} className={`p-3 md:p-4 rounded-lg border flex flex-wrap gap-2
                  ${dark ? 'bg-slate-700 border-slate-600' : 'bg-white border-slate-200'}`}
                >
                  {displayCountry.languages && displayCountry.languages.length > 0 ? (
                    displayCountry.languages.map((l, i) => (
                      <span key={i} className="px-2 md:px-3 py-1 md:py-1.5 bg-gradient-to-r from-slate-600 to-slate-700 text-white rounded-full text-xs md:text-sm font-bold">
                        {l}
                      </span>
                    ))
                  ) : (
                    <span className={`italic text-sm ${dark ? 'text-slate-400' : 'text-slate-500'}`}>
                      {lang === "en" ? "No Languages" : "لا توجد لغات"}
                    </span>
                  )}
                </div>
              </div>
              {getMediaUrl('anthem') && (
                <div>
                  <p dir={lang === "en" ? "ltr" : "rtl"} className={`text-[10px] md:text-sm font-bold uppercase tracking-widest mb-2 md:mb-3
                    ${dark ? 'text-slate-300' : 'text-slate-700'}`}
                  >{lang === "en" ? "National Anthem" : "النشيد الوطني"}</p>
                  <div className={`p-3 md:p-4 rounded-lg border
                    ${dark ? 'bg-slate-700 border-slate-600' : 'bg-white border-slate-200'}`}
                  >
                    <audio controls controlsList="nodownload" className="w-full max-w-full outline-none transition-opacity duration-300 rounded"
                      title={`${displayCountry.name} National Anthem`}
                    >
                      <source src={getMediaUrl('anthem')} />
                    </audio>
                  </div>
                </div>
              )}
            </section>

            {/* --- SUMMARY & CAPITAL IMAGE --- */}
            <section className="space-y-3 md:space-y-4">
              {getMediaUrl('capital') && (
                <img 
                  src={getMediaUrl('capital')} 
                  alt={`${displayCountry.name} Capital`}
                  referrerPolicy="no-referrer"
                  className={`w-full max-h-48 md:max-h-64 lg:max-h-80 object-cover rounded-xl shadow-lg border hover:shadow-xl transition-all duration-300
                    ${dark ? 'border-slate-600' : 'border-slate-200'}`}
                />
              )}
              <div className={`rounded-xl p-4 md:p-5 border shadow-sm hover:shadow-md transition-all
                ${dark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}
              >
                <p dir={lang === "en" ? "ltr" : "rtl"} className={`text-sm md:text-base leading-relaxed text-justify font-medium italic pl-3 md:pl-4
                  ${dark
                    ? 'text-slate-300 border-l-4 border-slate-500'
                    : 'text-slate-700 border-l-4 border-slate-400'}`}
                >
                  {displayCountry.summary}
                </p>
              </div>
            </section>

            {/* --- GEOGRAPHY --- */}
            <section className="space-y-3 md:space-y-4">
              <h3 dir={lang === "en" ? "ltr" : "rtl"} className={`text-lg md:text-xl font-bold flex items-center gap-2
                ${dark ? 'text-slate-100' : 'text-slate-900'}`}
              >
                <FaGripLines className={`text-base md:text-lg ${dark ? 'text-slate-400' : 'text-slate-600'}`} />
                {lang === "en" ? "Geography" : "الجغرافيا"}
              </h3>
              <div className={`p-4 md:p-5 rounded-xl shadow-sm border hover:shadow-md transition-all
                ${dark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}
              >
                <p dir={lang === "en" ? "ltr" : "rtl"} className={`text-sm md:text-base leading-relaxed text-justify
                  ${dark ? 'text-slate-300' : 'text-slate-700'}`}
                >
                  {displayCountry.geography}
                </p>
              </div>
            </section>

            {/* --- LANDMARKS --- */}
            <section className="space-y-4 md:space-y-5">
              <h3 dir={lang === "en" ? "ltr" : "rtl"} className={`text-lg md:text-xl font-bold flex items-center gap-2
                ${dark ? 'text-slate-100' : 'text-slate-900'}`}
              >
                <FaBuildingColumns className={`text-base md:text-lg ${dark ? 'text-slate-400' : 'text-slate-600'}`} />
                {lang === "en" ? "Landmarks" : "المعالم السياحية"}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
                {displayCountry["Famous Landmarks"].map((site, i) => {
                  const landmarkUrl = getMediaUrl(`landmark-${i}`);
                  return (
                    <div key={i} className={`group rounded-xl overflow-hidden border shadow-sm hover:shadow-lg transition-all duration-300
                      ${dark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}
                    >
                      {landmarkUrl && (
                        <img 
                          src={landmarkUrl} 
                          alt={site.title}
                          referrerPolicy="no-referrer"
                          className="w-full max-h-40 md:max-h-52 lg:max-h-60 object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      )}
                      <div className="p-4 md:p-5">
                        <h4 dir={lang === "en" ? "ltr" : "rtl"} className={`font-bold text-base md:text-lg mb-2 transition-colors
                          ${dark ? 'text-slate-100 group-hover:text-slate-300' : 'text-slate-900 group-hover:text-slate-700'}`}
                        >{site.title}</h4>
                        <p dir={lang === "en" ? "ltr" : "rtl"} className={`text-xs md:text-sm leading-relaxed
                          ${dark ? 'text-slate-400' : 'text-slate-600'}`}
                        >{site.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* --- GOVERNANCE & ECONOMY --- */}
            <div>
              <section className={`p-4 md:p-6 rounded-xl shadow-sm border hover:shadow-md transition-all
                ${dark
                  ? 'bg-slate-800 border-slate-700'
                  : 'bg-gradient-to-br from-white to-slate-50 border-slate-200'}`}
              >
                <h3 dir={lang === "en" ? "ltr" : "rtl"} className={`text-lg md:text-xl font-bold mb-3 md:mb-4 flex items-center gap-2
                  ${dark ? 'text-slate-100' : 'text-slate-900'}`}
                >
                  <FaScaleBalanced className={`text-base md:text-lg ${dark ? 'text-slate-400' : 'text-slate-600'}`} />
                  {lang === "en" ? "Governance" : "السياسة"}
                </h3>
                <div className={`flex flex-row items-start gap-3 md:gap-4 mb-3 md:mb-4 p-3 md:p-4 rounded-lg border
                  ${dark
                    ? 'bg-slate-700 border-slate-600'
                    : 'bg-gradient-to-r from-slate-50 to-slate-100 border-slate-200'}`}
                >
                  {getMediaUrl('president') && (
                    <img 
                      src={getMediaUrl('president')} 
                      alt={displayCountry.president}
                      referrerPolicy="no-referrer"
                      className="w-20 h-20 md:w-24 md:h-24 rounded-full object-cover shadow-md border-2 border-white flex-shrink-0"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <p dir={lang === "en" ? "ltr" : "rtl"} className={`text-[10px] md:text-xs font-bold uppercase tracking-wider
                      ${dark ? 'text-slate-400' : 'text-slate-500'}`}
                    >{lang === "en" ? "President" : "الحاكم"}</p>
                    <p dir={lang === "en" ? "ltr" : "rtl"} className={`text-base md:text-lg font-black
                      ${dark ? 'text-slate-100' : 'text-slate-800'}`}
                    >{displayCountry.president}</p>
                  </div>
                </div>
                <p dir={lang === "en" ? "ltr" : "rtl"} className={`text-sm md:text-base leading-relaxed
                  ${dark ? 'text-slate-300' : 'text-slate-700'}`}
                >{displayCountry.politics}</p>
              </section>
            </div>

            <section className="bg-gradient-to-br from-slate-700 to-slate-600 text-white p-4 md:p-6 rounded-xl shadow-md hover:shadow-lg transition-all border border-slate-600">
              <h3 dir={lang === "en" ? "ltr" : "rtl"} className="text-lg md:text-xl font-bold mb-3 md:mb-4 flex items-center gap-2">
                <FaChartLine className="text-slate-300 text-base md:text-lg" />
                {lang === "en" ? "Economy" : "الاقتصاد"}
              </h3>
              <div className="mb-3 md:mb-5 flex items-center gap-3 bg-white/10 p-3 md:p-4 rounded-lg border border-white/20">
                <div className="flex-1 min-w-0">
                  <p dir={lang === "en" ? "ltr" : "rtl"} className="text-[10px] md:text-xs uppercase font-black text-slate-300">
                    {lang === "en" ? "Currency" : "العملة"}
                  </p>
                  <p dir={lang === "en" ? "ltr" : "rtl"} className="text-lg md:text-xl font-bold text-white truncate">
                    {displayCountry.currency.name} ({displayCountry.currency.iso})
                  </p>
                </div>
              </div>
              <p dir={lang === "en" ? "ltr" : "rtl"} className="text-sm md:text-base text-slate-100 leading-relaxed">
                {displayCountry.economy}
              </p>
            </section>

            {/* --- CULTURE IMAGE --- */}
            {getMediaUrl('culture') && (
              <img 
                src={getMediaUrl('culture')} 
                referrerPolicy="no-referrer"
                alt={`${displayCountry.name} Culture`}
                className={`w-full max-h-48 md:max-h-64 lg:max-h-80 object-cover rounded-xl shadow-lg border hover:shadow-xl transition-all duration-300 my-2
                  ${dark ? 'border-slate-600' : 'border-slate-200'}`}
              />
            )}

            {/* --- HISTORY TIMELINE --- */}
            <section className={`p-4 md:p-6 rounded-xl border shadow-sm
              ${dark
                ? 'bg-slate-800 border-slate-700'
                : 'bg-gradient-to-br from-slate-50 to-white border-slate-200'}`}
            >
              <div className="flex justify-between items-center mb-4 md:mb-6">
                <h3 dir={lang === "en" ? "ltr" : "rtl"} className={`text-xl md:text-2xl font-black tracking-tight
                  ${dark ? 'text-slate-100' : 'text-slate-900'}`}
                >{lang === "en" ? "History" : "التاريخ"}</h3>
                <button 
                  onClick={() => setShowAllHistory(!showAllHistory)}
                  className={`cursor-pointer text-[10px] md:text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm hover:shadow-md transition-all border touch-manipulation min-h-[36px]
                    ${dark
                      ? 'bg-slate-700 text-slate-200 border-slate-600 hover:bg-slate-600'
                      : 'bg-white text-slate-900 border-slate-200 hover:bg-slate-50'}`}
                >
                  {lang === "en"
                    ? showAllHistory ? 'Use Slider' : 'View All'
                    : showAllHistory ? 'واحد بواحد' : 'عرض الكل'}
                </button>
              </div>
              
              {!showAllHistory ? (
                <div className="space-y-3 md:space-y-4">
                  <div className="px-1">
                    <input 
                      type="range" min="0" max={Math.max(0, displayCountry.history.length - 1)} step="1" 
                      value={eraIndex} 
                      onChange={(e) => setEraIndex(parseInt(e.target.value))}
                      className="w-full h-2 md:h-3 bg-slate-300 rounded-full appearance-none cursor-pointer accent-blue-600 touch-manipulation"
                    />
                  </div>
                  {displayCountry.history.length > 0 && (
                    <div className={`rounded-xl overflow-hidden shadow-sm border flex flex-col hover:shadow-md transition-all
                      ${dark ? 'bg-slate-700 border-slate-600' : 'bg-white border-slate-200'}`}
                    >
                      <div className="p-4 md:p-5">
                        <span className={`font-black text-[10px] md:text-xs uppercase tracking-widest mb-2 block
                          ${dark ? 'text-slate-400' : 'text-slate-600'}`}
                        >Era {eraIndex + 1}</span>
                        <h4 dir={lang === "en" ? "ltr" : "rtl"} className={`font-black text-base md:text-lg mb-2 md:mb-3 leading-tight
                          ${dark ? 'text-slate-100' : 'text-slate-900'}`}
                        >
                          {displayCountry.history[eraIndex]?.title}
                        </h4>
                        <p dir={lang === "en" ? "ltr" : "rtl"} className={`text-xs md:text-sm leading-relaxed
                          ${dark ? 'text-slate-400' : 'text-slate-600'}`}
                        >
                          {displayCountry.history[eraIndex]?.description}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-3 md:space-y-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                  {displayCountry.history.map((era, index) => (
                    <div key={index} className={`flex flex-col rounded-xl overflow-hidden border shadow-sm hover:shadow-md transition-all
                      ${dark ? 'bg-slate-700 border-slate-600' : 'bg-white border-slate-200'}`}
                    >
                      <div className="p-3 md:p-4">
                        <h3 dir={lang === "en" ? "ltr" : "rtl"} className={`font-bold text-sm md:text-base mb-1 md:mb-2
                          ${dark ? 'text-slate-100' : 'text-slate-900'}`}
                        >{era.title}</h3>
                        <p dir={lang === "en" ? "ltr" : "rtl"} className={`text-xs md:text-sm leading-relaxed
                          ${dark ? 'text-slate-400' : 'text-slate-600'}`}
                        >{era.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* --- CUISINE --- */}
            <section className={`p-4 md:p-6 rounded-xl border shadow-sm hover:shadow-md transition-all
              ${dark
                ? 'bg-slate-800 border-slate-700'
                : 'bg-gradient-to-br from-slate-50 to-white border-slate-200'}`}
            >
              <h3 dir={lang === "en" ? "ltr" : "rtl"} className={`text-lg md:text-xl font-bold mb-3 md:mb-4 flex items-center gap-2
                ${dark ? 'text-slate-100' : 'text-slate-800'}`}
              >
                <FaUtensils className={`text-base md:text-lg ${dark ? 'text-slate-400' : 'text-slate-600'}`} />
                {lang === "en" ? "Cuisine" : "المطبخ"}
              </h3>
              <p dir={lang === "en" ? "ltr" : "rtl"} className={`mb-4 md:mb-5 text-sm md:text-base leading-relaxed
                ${dark ? 'text-slate-300' : 'text-slate-700'}`}
              >
                {displayCountry.culinary}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
                {displayCountry.dishes.map((dish, i) => {
                  const dishUrl = getMediaUrl(`dish-${i}`);
                  return (
                    <div key={i} className={`flex flex-col rounded-xl overflow-hidden shadow-sm border hover:shadow-md transition-all
                      ${dark ? 'bg-slate-700 border-slate-600' : 'bg-white border-slate-200'}`}
                    >
                      {dishUrl && (
                        <img 
                          src={dishUrl} 
                          alt={dish.title}
                          referrerPolicy="no-referrer"
                          className="w-full max-h-40 md:max-h-52 lg:max-h-60 object-cover hover:scale-105 transition-transform duration-300"
                        />
                      )}
                      <div className="p-4 md:p-5 flex-1">
                        <h4 dir={lang === "en" ? "ltr" : "rtl"} className={`font-black text-base md:text-lg mb-2
                          ${dark ? 'text-slate-100' : 'text-slate-800'}`}
                        >{dish.title}</h4>
                        <p dir={lang === "en" ? "ltr" : "rtl"} className={`text-xs md:text-sm leading-relaxed
                          ${dark ? 'text-slate-400' : 'text-slate-600'}`}
                        >{dish.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* --- ENTERTAINMENT --- */}
            <section className={`p-4 md:p-6 rounded-xl border shadow-sm hover:shadow-md transition-all
              ${dark
                ? 'bg-slate-800 border-slate-700'
                : 'bg-gradient-to-br from-slate-50 to-white border-slate-200'}`}
            >
              <h3 dir={lang === "en" ? "ltr" : "rtl"} className={`text-lg md:text-xl font-bold mb-3 md:mb-4 flex items-center gap-2
                ${dark ? 'text-slate-100' : 'text-slate-800'}`}
              >
                <FaMasksTheater className={`text-base md:text-lg ${dark ? 'text-slate-400' : 'text-slate-600'}`} />
                {lang === "en" ? "Entertainment" : "الترفيه"}
              </h3>
              <p dir={lang === "en" ? "ltr" : "rtl"} className={`text-sm md:text-base leading-relaxed text-justify
                ${dark ? 'text-slate-300' : 'text-slate-700'}`}
              >
                {displayCountry.entertainment}
              </p>
            </section>

            {/* --- SPORTS --- */}
            <section className="pb-4 md:pb-8 space-y-3 md:space-y-4">
              <h3 dir={lang === "en" ? "ltr" : "rtl"} className={`text-lg md:text-xl font-bold flex items-center gap-2
                ${dark ? 'text-slate-100' : 'text-slate-900'}`}
              >
                <FaFutbol className={`text-base md:text-lg ${dark ? 'text-slate-400' : 'text-slate-600'}`} />
                {lang === "en" ? "Sports" : "الرياضة"}
              </h3>
              <div dir={lang === "en" ? "ltr" : "rtl"} className="flex flex-wrap gap-2 md:gap-3 mb-3 md:mb-4">
                {displayCountry["Sport Teams"].map((team, i) => (
                  <span key={i} className="px-2 md:px-3 py-1.5 md:py-2 bg-gradient-to-r from-slate-700 to-slate-600 text-white rounded-lg font-bold text-[10px] md:text-xs uppercase tracking-wider shadow-md hover:shadow-lg transition-all hover:scale-105 touch-manipulation">
                    {team.team} <span className="text-slate-300 ml-1 font-medium opacity-70">| {team.sport}</span>
                  </span>
                ))}
              </div>
              <div className={`p-3 md:p-5 rounded-xl border shadow-sm
                ${dark
                  ? 'bg-slate-800 border-slate-700'
                  : 'bg-gradient-to-br from-slate-50 to-white border-slate-200'}`}
              >
                <p dir={lang === "en" ? "ltr" : "rtl"} className={`text-sm md:text-base leading-relaxed
                  ${dark ? 'text-slate-300' : 'text-slate-700'}`}
                >
                  {displayCountry.sport}
                </p>
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
};

export default SidePanel;
