import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FaMagnifyingGlass, FaMoon, FaSun, FaXmark } from 'react-icons/fa6';
import { useFuzzySearch } from '../services/SearchService';
import type { MapMode } from '../types/MapMode';
import { useLang } from '../contexts/lang';
import arMap from '../countries/countriesARMap.json'
import enMap from '../countries/countriesENMap.json'
import { useTheme } from '../contexts/theme';

const Searchbar = ({ isVisible, mapMode }: { isVisible: boolean; mapMode: MapMode }) => {
  const MAX_HISTORY_ITEMS = 5;
  const SEARCH_HISTORY_KEY = 'country-search-history';
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [, setFocusVersion] = useState(0);
  const [history, setHistory] = useState<string[]>([]);
  const { lang, toggleLang } = useLang();
  const { country } = useParams<{ country: string }>();
  const { theme, toggleTheme } = useTheme();

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const navigate = useNavigate();

  const dark = theme === 'dark';

  // eslint-disable-next-line react-hooks/refs
  const isInputActive = inputRef.current === document.activeElement;
  const results = useFuzzySearch(query, 5, lang) as string[];
  const showHistory = isInputActive && query.length === 0 && history.length > 0;
  const dropdownItems = showHistory ? history : results;

  useEffect(() => {
    setSelectedIndex(-1);
  }, [results, history, query]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(SEARCH_HISTORY_KEY);
      if (!saved) return;
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        setHistory(parsed.filter((item) => typeof item === 'string'));
      }
    } catch {
      setHistory([]);
    }
  }, []);

  const persistHistory = useCallback((items: string[]) => {
    setHistory(items);
    localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(items));
  }, []);

  const addToHistory = useCallback((name: string) => {
    const next = [name, ...history.filter((item) => item !== name)].slice(0, MAX_HISTORY_ITEMS);
    persistHistory(next);
  }, [history, persistHistory]);

  useEffect(() => {
    if (listRef.current && selectedIndex >= 0) {
      const selectedEl = listRef.current.children[selectedIndex] as HTMLElement;
      selectedEl?.scrollIntoView({ block: 'nearest' });
    }
  }, [selectedIndex]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setQuery('');
        setSelectedIndex(-1);
        inputRef.current?.blur();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = useCallback((name: string) => {
    addToHistory(name);
    const urlFriendly = name.replace(/\s+/g, '-');
    navigate(`/${urlFriendly}`);
    setQuery('');
    setSelectedIndex(-1);
    inputRef.current?.blur();
  }, [addToHistory, navigate]);

  const changeLang = () => {
    toggleLang();
    if (!country) return;
    if (lang === "ar") {
      navigate(`/${enMap[country.replaceAll("-", " ") as keyof typeof enMap].replaceAll(" ", "-")}`);
    } else {
      handleSelect(arMap[country.replaceAll("-", " ").replaceAll(" ", "-") as keyof typeof arMap]);
    }
  };

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (dropdownItems.length === 0) return;
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => (prev < dropdownItems.length - 1 ? prev + 1 : 0));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => (prev > 0 ? prev - 1 : dropdownItems.length - 1));
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < dropdownItems.length) {
          handleSelect(dropdownItems[selectedIndex]);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setQuery('');
        setSelectedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  }, [dropdownItems, selectedIndex, handleSelect]);

  const clearText = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setQuery('');
    setSelectedIndex(-1);
    inputRef.current?.focus();
  }, []);

  const removeHistoryItem = useCallback((e: React.MouseEvent, name: string) => {
    e.stopPropagation();
    const next = history.filter((item) => item !== name);
    persistHistory(next);
  }, [history, persistHistory]);

  if (!isVisible) return null;

  const positionClass =
    mapMode === 'sidebar'
      ? 'fixed top-3 left-3 right-3 md:top-4 md:left-[70vw] md:right-auto md:-translate-x-1/2'
      : 'fixed top-3 left-3 right-3 md:top-4 md:left-10 md:right-auto md:translate-x-0';

  return (
    <div ref={containerRef} className={`${positionClass} z-[45] flex items-center gap-2 w-fit`}>

      {/* Search Input Container */}
      <div className={`relative flex items-center h-12 rounded-full border shadow-xl w-[calc(100vw-8rem)] sm:w-72 md:w-80 lg:w-96 shrink-0
        ${dark ? 'bg-slate-800 border-slate-600' : 'bg-white border-slate-200'}`}
      >
        {/* Search Icon */}
        <div className="absolute left-3 top-0 h-full w-10 flex items-center justify-center pointer-events-none">
          <FaMagnifyingGlass className={dark ? 'text-slate-400' : 'text-gray-400'} size={16} />
        </div>

        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setFocusVersion((v) => v + 1)}
          onBlur={() => requestAnimationFrame(() => setFocusVersion((v) => v + 1))}
          onKeyDown={handleKeyDown}
          placeholder={lang === "en" ? "Search Countries..." : "ابحث عن الدول"}
          className={`w-full bg-transparent border-none outline-none focus:ring-0 text-sm md:text-base pl-15 pr-8
            ${dark ? 'text-slate-100 placeholder:text-slate-500' : 'text-gray-800 placeholder:text-gray-400'}`}
          role="combobox"
          aria-expanded={dropdownItems.length > 0}
          aria-controls="search-dropdown"
          aria-autocomplete="list"
          aria-activedescendant={selectedIndex >= 0 ? `option-${selectedIndex}` : undefined}
        />

        {query.length > 0 && (
          <button
            onClick={clearText}
            className={`absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full shrink-0
              ${dark ? 'hover:bg-slate-700' : 'hover:bg-gray-100'}`}
            aria-label="Clear search"
          >
            <FaXmark size={14} className={dark ? 'text-slate-400' : 'text-gray-400'} />
          </button>
        )}
      </div>

      {/* Dropdown */}
      {dropdownItems.filter((name: string) => {
        const isArabic = /[\u0600-\u06FF]/.test(name);
        return lang === "ar" ? isArabic : !isArabic;
      }).length > 0 && (query.length > 0 || showHistory) && (
        <ul
          id="search-dropdown"
          ref={listRef}
          onMouseDown={(e) => e.preventDefault()}
          className={`absolute top-full left-0 w-full mt-2 rounded-xl shadow-2xl py-2 z-[100] max-h-60 overflow-y-auto overscroll-contain animate-in fade-in slide-in-from-top-2 border
            ${dark ? 'bg-slate-800 border-slate-600' : 'bg-white border-slate-200'}`}
          role="listbox"
          aria-label={showHistory ? 'Recent searches' : 'Search results'}
        >
          {dropdownItems
            .filter((name: string) => {
              const isArabic = /[\u0600-\u06FF]/.test(name);
              return lang === "ar" ? isArabic : !isArabic;
            })
            .map((name: string, index: number) => (
              <li
                key={name}
                id={`option-${index}`}
                onClick={() => handleSelect(name)}
                onMouseEnter={() => setSelectedIndex(index)}
                className={`px-4 py-2 cursor-pointer text-sm md:text-base font-medium transition-colors truncate flex items-center justify-between gap-2
                  ${index === selectedIndex
                    ? dark ? 'bg-blue-900 text-blue-300 font-bold' : 'bg-blue-50 text-blue-700 font-bold'
                    : dark ? 'text-slate-300 hover:bg-slate-700' : 'text-gray-700 hover:bg-slate-50'
                  }`}
                role="option"
                aria-selected={index === selectedIndex}
                tabIndex={-1}
              >
                <span className="truncate">{name}</span>
                {showHistory && (
                  <button
                    type="button"
                    onClick={(e) => removeHistoryItem(e, name)}
                    className={`p-1 rounded-full cursor-pointer
                      ${dark ? 'text-slate-500 hover:text-slate-300 hover:bg-slate-600' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'}`}
                    aria-label={`Remove ${name} from search history`}
                  >
                    <FaXmark size={12} />
                  </button>
                )}
              </li>
            ))}
        </ul>
      )}

      {/* Action Buttons */}
      <div className="flex items-center gap-1">
        <button
          className={`cursor-pointer w-10 h-10 flex items-center justify-center rounded-full backdrop-blur-sm transition-all shadow-xl border
            ${dark
              ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-slate-100 border-slate-600 hover:border-slate-500'
              : 'bg-white hover:bg-white/20 text-gray-600 hover:text-gray-900 border-transparent hover:border-slate-200'
            }`}
          aria-label="Change Language"
          onClick={() => changeLang()}
        >
          <img className="w-6 h-6" src={`/${lang}.png`} alt="flag" />
        </button>
        <button
          className={`cursor-pointer w-10 h-10 flex items-center justify-center rounded-full backdrop-blur-sm transition-all shadow-xl border
            ${dark
              ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-slate-100 border-slate-600 hover:border-slate-500'
              : 'bg-white hover:bg-white/20 text-gray-600 hover:text-gray-900 border-transparent hover:border-slate-200'
            }`}
          aria-label="Toggle Theme"
          onClick={() => toggleTheme()}
        >
          {dark ? <FaMoon size={18} /> : <FaSun size={18} />}
        </button>
      </div>

    </div>
  );
};

export default Searchbar;