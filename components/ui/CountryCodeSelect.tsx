'use client';

import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, Search, Check, Globe } from 'lucide-react';
import { getCountryCallingCode } from 'react-phone-number-input';
import type { Country } from 'react-phone-number-input';
import flags from 'react-phone-number-input/flags';

interface CountryData {
  code: Country;
  name: string;
}

const COUNTRIES_UNSORTED: CountryData[] = [
  { code: 'TH', name: 'Thailand' },
  { code: 'US', name: 'United States' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'AU', name: 'Australia' },
  { code: 'CN', name: 'China' },
  { code: 'JP', name: 'Japan' },
  { code: 'KR', name: 'South Korea' },
  { code: 'IN', name: 'India' },
  { code: 'SG', name: 'Singapore' },
  { code: 'MY', name: 'Malaysia' },
  { code: 'ID', name: 'Indonesia' },
  { code: 'PH', name: 'Philippines' },
  { code: 'VN', name: 'Vietnam' },
  { code: 'HK', name: 'Hong Kong' },
  { code: 'TW', name: 'Taiwan' },
  { code: 'DE', name: 'Germany' },
  { code: 'FR', name: 'France' },
  { code: 'IT', name: 'Italy' },
  { code: 'ES', name: 'Spain' },
  { code: 'NL', name: 'Netherlands' },
  { code: 'BE', name: 'Belgium' },
  { code: 'CH', name: 'Switzerland' },
  { code: 'AT', name: 'Austria' },
  { code: 'SE', name: 'Sweden' },
  { code: 'NO', name: 'Norway' },
  { code: 'DK', name: 'Denmark' },
  { code: 'FI', name: 'Finland' },
  { code: 'PL', name: 'Poland' },
  { code: 'PT', name: 'Portugal' },
  { code: 'GR', name: 'Greece' },
  { code: 'IE', name: 'Ireland' },
  { code: 'RU', name: 'Russia' },
  { code: 'UA', name: 'Ukraine' },
  { code: 'TR', name: 'Turkey' },
  { code: 'IL', name: 'Israel' },
  { code: 'AE', name: 'UAE' },
  { code: 'SA', name: 'Saudi Arabia' },
  { code: 'QA', name: 'Qatar' },
  { code: 'KW', name: 'Kuwait' },
  { code: 'BH', name: 'Bahrain' },
  { code: 'OM', name: 'Oman' },
  { code: 'EG', name: 'Egypt' },
  { code: 'ZA', name: 'South Africa' },
  { code: 'NG', name: 'Nigeria' },
  { code: 'KE', name: 'Kenya' },
  { code: 'MA', name: 'Morocco' },
  { code: 'CA', name: 'Canada' },
  { code: 'MX', name: 'Mexico' },
  { code: 'BR', name: 'Brazil' },
  { code: 'AR', name: 'Argentina' },
  { code: 'CL', name: 'Chile' },
  { code: 'CO', name: 'Colombia' },
  { code: 'PE', name: 'Peru' },
  { code: 'NZ', name: 'New Zealand' },
  { code: 'BD', name: 'Bangladesh' },
  { code: 'PK', name: 'Pakistan' },
  { code: 'LK', name: 'Sri Lanka' },
  { code: 'NP', name: 'Nepal' },
  { code: 'MM', name: 'Myanmar' },
  { code: 'KH', name: 'Cambodia' },
  { code: 'LA', name: 'Laos' },
  { code: 'BN', name: 'Brunei' },
  { code: 'MV', name: 'Maldives' },
  { code: 'CZ', name: 'Czech Republic' },
  { code: 'HU', name: 'Hungary' },
  { code: 'RO', name: 'Romania' },
  { code: 'BG', name: 'Bulgaria' },
  { code: 'HR', name: 'Croatia' },
  { code: 'SK', name: 'Slovakia' },
  { code: 'SI', name: 'Slovenia' },
  { code: 'RS', name: 'Serbia' },
  { code: 'LU', name: 'Luxembourg' },
  { code: 'MT', name: 'Malta' },
  { code: 'CY', name: 'Cyprus' },
  { code: 'EE', name: 'Estonia' },
  { code: 'LV', name: 'Latvia' },
  { code: 'LT', name: 'Lithuania' },
  { code: 'IS', name: 'Iceland' },
  { code: 'MO', name: 'Macau' },
  { code: 'MN', name: 'Mongolia' },
];

const COUNTRIES: CountryData[] = COUNTRIES_UNSORTED.sort((a, b) => 
  a.name.localeCompare(b.name)
);

interface CountryCodeSelectProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  placeholder?: string;
}

export function CountryCodeSelect({ value, onChange, className = '', placeholder = 'Code' }: CountryCodeSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [mounted, setMounted] = useState(false);

  const selectedCountry = value ? COUNTRIES.find(c => {
    try {
      return `+${getCountryCallingCode(c.code)}` === value;
    } catch {
      return false;
    }
  }) : undefined;

  const filteredCountries = COUNTRIES.filter(country => {
    const dialCode = `+${getCountryCallingCode(country.code)}`;
    return country.name.toLowerCase().includes(search.toLowerCase()) ||
      dialCode.includes(search) ||
      country.code.toLowerCase().includes(search.toLowerCase());
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        buttonRef.current && 
        !buttonRef.current.contains(event.target as Node) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
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
    if (isOpen && buttonRef.current) {
      const updatePosition = () => {
        if (buttonRef.current) {
          const rect = buttonRef.current.getBoundingClientRect();
          setDropdownPosition({
            top: rect.bottom + 4,
            left: rect.left,
          });
        }
      };
      
      updatePosition();
      
      window.addEventListener('scroll', updatePosition, true);
      window.addEventListener('resize', updatePosition);
      
      return () => {
        window.removeEventListener('scroll', updatePosition, true);
        window.removeEventListener('resize', updatePosition);
      };
    }
  }, [isOpen]);

  const handleSelect = (country: CountryData) => {
    const dialCode = `+${getCountryCallingCode(country.code)}`;
    onChange(dialCode);
    setIsOpen(false);
    setSearch('');
  };

  const FlagComponent = selectedCountry ? flags[selectedCountry.code] : null;
  const selectedDialCode = selectedCountry ? `+${getCountryCallingCode(selectedCountry.code)}` : '';

  const dropdown = isOpen && mounted ? createPortal(
    <div 
      ref={dropdownRef}
      className="fixed rounded-xl shadow-2xl overflow-hidden bg-[#1a1a1a] border border-white/10"
      style={{ 
        top: dropdownPosition.top,
        left: dropdownPosition.left,
        width: 280,
        zIndex: 99999,
      }}
    >
      {/* Search */}
      <div className="p-3 border-b border-white/10 bg-[#111]">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <input
            ref={searchInputRef}
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search country..."
            className="w-full h-11 pl-9 pr-3 rounded-lg text-sm bg-[#0a0a0a] border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:border-[#b1b94c] focus:ring-1 focus:ring-[#b1b94c]/20"
          />
        </div>
      </div>
      
      {/* Country List */}
      <div className="max-h-64 overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-white/10 [&::-webkit-scrollbar-thumb]:rounded-full">
        {filteredCountries.length === 0 ? (
          <div className="px-4 py-6 text-sm text-center text-white/50">
            No countries found
          </div>
        ) : (
          filteredCountries.map((country) => {
            const Flag = flags[country.code];
            const dialCode = `+${getCountryCallingCode(country.code)}`;
            const isSelected = dialCode === value;
            
            return (
              <button
                key={country.code}
                type="button"
                onClick={() => handleSelect(country)}
                className={`w-full px-4 py-3 min-h-[48px] flex items-center gap-3 transition-colors text-left ${
                  isSelected ? 'bg-[#b1b94c]/10' : 'hover:bg-white/5'
                }`}
              >
                {/* Flag */}
                {Flag && (
                  <span className="w-6 h-4 flex-shrink-0 overflow-hidden rounded-sm shadow-sm">
                    <Flag title={country.name} />
                  </span>
                )}
                {/* Country Name */}
                <span className="flex-grow text-sm font-medium truncate text-white">
                  {country.name}
                </span>
                {/* Dial Code */}
                <span className="text-sm font-semibold flex-shrink-0 text-[#b1b94c]">
                  {dialCode}
                </span>
                {/* Checkmark */}
                {isSelected && (
                  <Check className="w-4 h-4 flex-shrink-0 text-[#b1b94c]" />
                )}
              </button>
            );
          })
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
        className="w-full h-[57px] px-4 rounded-xl text-sm focus:outline-none flex items-center justify-between gap-2 transition-all bg-[#0a0a0a] border border-white/10 text-white hover:border-white/20 focus:border-[#b1b94c]/50"
      >
        {selectedCountry ? (
          <span className="flex items-center gap-2">
            {FlagComponent && (
              <span className="w-6 h-4 flex-shrink-0 overflow-hidden rounded-sm shadow-sm">
                <FlagComponent title={selectedCountry.name} />
              </span>
            )}
            <span className="font-medium text-white">{selectedDialCode}</span>
          </span>
        ) : (
          <span className="flex items-center gap-2 text-white/30">
            <Globe className="w-4 h-4" />
            <span>{placeholder}</span>
          </span>
        )}
        <ChevronDown className={`w-4 h-4 transition-transform text-white/40 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {dropdown}
    </div>
  );
}
