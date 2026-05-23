'use client';

import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, Search } from 'lucide-react';

interface Country {
  code: string;
  name: string;
  dial: string;
}

const countries: Country[] = [
  { code: 'TH', name: 'Thailand', dial: '+66' },
  { code: 'US', name: 'United States', dial: '+1' },
  { code: 'GB', name: 'United Kingdom', dial: '+44' },
  { code: 'AU', name: 'Australia', dial: '+61' },
  { code: 'CN', name: 'China', dial: '+86' },
  { code: 'JP', name: 'Japan', dial: '+81' },
  { code: 'KR', name: 'South Korea', dial: '+82' },
  { code: 'IN', name: 'India', dial: '+91' },
  { code: 'SG', name: 'Singapore', dial: '+65' },
  { code: 'MY', name: 'Malaysia', dial: '+60' },
  { code: 'ID', name: 'Indonesia', dial: '+62' },
  { code: 'PH', name: 'Philippines', dial: '+63' },
  { code: 'VN', name: 'Vietnam', dial: '+84' },
  { code: 'HK', name: 'Hong Kong', dial: '+852' },
  { code: 'TW', name: 'Taiwan', dial: '+886' },
  { code: 'DE', name: 'Germany', dial: '+49' },
  { code: 'FR', name: 'France', dial: '+33' },
  { code: 'IT', name: 'Italy', dial: '+39' },
  { code: 'ES', name: 'Spain', dial: '+34' },
  { code: 'NL', name: 'Netherlands', dial: '+31' },
  { code: 'BE', name: 'Belgium', dial: '+32' },
  { code: 'CH', name: 'Switzerland', dial: '+41' },
  { code: 'AT', name: 'Austria', dial: '+43' },
  { code: 'SE', name: 'Sweden', dial: '+46' },
  { code: 'NO', name: 'Norway', dial: '+47' },
  { code: 'DK', name: 'Denmark', dial: '+45' },
  { code: 'FI', name: 'Finland', dial: '+358' },
  { code: 'PL', name: 'Poland', dial: '+48' },
  { code: 'RU', name: 'Russia', dial: '+7' },
  { code: 'UA', name: 'Ukraine', dial: '+380' },
  { code: 'TR', name: 'Turkey', dial: '+90' },
  { code: 'GR', name: 'Greece', dial: '+30' },
  { code: 'PT', name: 'Portugal', dial: '+351' },
  { code: 'IE', name: 'Ireland', dial: '+353' },
  { code: 'CZ', name: 'Czech Republic', dial: '+420' },
  { code: 'HU', name: 'Hungary', dial: '+36' },
  { code: 'RO', name: 'Romania', dial: '+40' },
  { code: 'CA', name: 'Canada', dial: '+1' },
  { code: 'MX', name: 'Mexico', dial: '+52' },
  { code: 'BR', name: 'Brazil', dial: '+55' },
  { code: 'AR', name: 'Argentina', dial: '+54' },
  { code: 'CL', name: 'Chile', dial: '+56' },
  { code: 'CO', name: 'Colombia', dial: '+57' },
  { code: 'PE', name: 'Peru', dial: '+51' },
  { code: 'ZA', name: 'South Africa', dial: '+27' },
  { code: 'EG', name: 'Egypt', dial: '+20' },
  { code: 'NG', name: 'Nigeria', dial: '+234' },
  { code: 'KE', name: 'Kenya', dial: '+254' },
  { code: 'MA', name: 'Morocco', dial: '+212' },
  { code: 'AE', name: 'United Arab Emirates', dial: '+971' },
  { code: 'SA', name: 'Saudi Arabia', dial: '+966' },
  { code: 'IL', name: 'Israel', dial: '+972' },
  { code: 'QA', name: 'Qatar', dial: '+974' },
  { code: 'KW', name: 'Kuwait', dial: '+965' },
  { code: 'BH', name: 'Bahrain', dial: '+973' },
  { code: 'OM', name: 'Oman', dial: '+968' },
  { code: 'NZ', name: 'New Zealand', dial: '+64' },
  { code: 'PK', name: 'Pakistan', dial: '+92' },
  { code: 'BD', name: 'Bangladesh', dial: '+880' },
  { code: 'LK', name: 'Sri Lanka', dial: '+94' },
  { code: 'NP', name: 'Nepal', dial: '+977' },
  { code: 'MM', name: 'Myanmar', dial: '+95' },
  { code: 'KH', name: 'Cambodia', dial: '+855' },
  { code: 'LA', name: 'Laos', dial: '+856' },
  { code: 'BN', name: 'Brunei', dial: '+673' },
  { code: 'MO', name: 'Macau', dial: '+853' },
  { code: 'MV', name: 'Maldives', dial: '+960' },
];

function getFlagUrl(countryCode: string): string {
  return `https://flagcdn.com/w40/${countryCode.toLowerCase()}.png`;
}

interface CountryPhoneSelectorProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  variant?: 'light' | 'dark';
}

export default function CountryPhoneSelector({ 
  value, 
  onChange,
  className = '',
  variant = 'light'
}: CountryPhoneSelectorProps) {
  const isDark = variant === 'dark';
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [mounted, setMounted] = useState(false);

  const selectedCountry = countries.find(c => c.dial === value) || countries[0];

  const filteredCountries = countries.filter(country => 
    country.name.toLowerCase().includes(search.toLowerCase()) ||
    country.dial.includes(search) ||
    country.code.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSearch('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    const updatePosition = () => {
      if (isOpen && buttonRef.current) {
        const rect = buttonRef.current.getBoundingClientRect();
        setDropdownPosition({
          top: rect.bottom + 4,
          left: rect.left,
        });
      }
    };

    updatePosition();

    if (isOpen) {
      window.addEventListener('scroll', updatePosition, true);
      window.addEventListener('resize', updatePosition);
      return () => {
        window.removeEventListener('scroll', updatePosition, true);
        window.removeEventListener('resize', updatePosition);
      };
    }
  }, [isOpen]);

  const handleSelect = (country: Country) => {
    onChange(country.dial);
    setIsOpen(false);
    setSearch('');
  };

  const dropdown = isOpen && mounted ? createPortal(
    <div 
      ref={dropdownRef}
      className={`fixed z-[9999] w-72 rounded-xl shadow-2xl overflow-hidden ${
        isDark 
          ? 'bg-[#1a1a1a] border border-white/10' 
          : 'bg-white border border-slate-200'
      }`}
      style={{ 
        top: dropdownPosition.top,
        left: dropdownPosition.left,
      }}
    >
      <div className={`p-2 border-b ${isDark ? 'border-white/10' : 'border-slate-100'}`}>
        <div className="relative">
          <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? 'text-white/40' : 'text-slate-400'}`} />
          <input
            ref={searchInputRef}
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search country..."
            className={`w-full h-9 pl-9 pr-3 rounded-lg text-sm focus:outline-none focus:border-[#b1b94c] ${
              isDark 
                ? 'bg-white/5 border border-white/10 text-white placeholder:text-white/30' 
                : 'bg-slate-50 border border-slate-200 text-slate-800'
            }`}
          />
        </div>
      </div>
      
      <div className="max-h-72 overflow-y-auto">
        {filteredCountries.length === 0 ? (
          <div className={`px-4 py-3 text-sm text-center ${isDark ? 'text-white/50' : 'text-slate-500'}`}>
            No countries found
          </div>
        ) : (
          filteredCountries.map((country) => (
            <button
              key={country.code}
              type="button"
              onClick={() => handleSelect(country)}
              className={`w-full px-4 py-2.5 flex items-center gap-3 transition-colors text-left ${
                country.dial === value 
                  ? 'bg-[#b1b94c]/10' 
                  : isDark ? 'hover:bg-white/5' : 'hover:bg-slate-50'
              }`}
            >
              <img 
                src={getFlagUrl(country.code)} 
                alt={country.name}
                className="w-6 h-4 object-cover rounded-sm"
              />
              <div className="flex-grow min-w-0">
                <span className={`text-sm truncate block ${isDark ? 'text-white' : 'text-slate-800'}`}>{country.name}</span>
              </div>
              <span className={`text-sm font-medium ${isDark ? 'text-white/60' : 'text-slate-500'}`}>{country.dial}</span>
            </button>
          ))
        )}
      </div>
    </div>,
    document.body
  ) : null;

  return (
    <div className={`relative ${className}`}>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full h-[46px] px-3 rounded-xl text-sm focus:outline-none focus:border-[#b1b94c] flex items-center justify-between gap-1 ${
          isDark 
            ? 'bg-white/5 border border-[#b1b94c]/30 text-white hover:border-[#b1b94c]/50' 
            : 'bg-slate-50 border border-slate-400 text-slate-800'
        }`}
      >
        <span className="flex items-center gap-2">
          <img 
            src={getFlagUrl(selectedCountry.code)} 
            alt={selectedCountry.name}
            className="w-5 h-4 object-cover rounded-sm"
          />
          <span className="text-sm font-medium">{selectedCountry.dial}</span>
        </span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''} ${isDark ? 'text-white/40' : 'text-slate-400'}`} />
      </button>
      {dropdown}
    </div>
  );
}
