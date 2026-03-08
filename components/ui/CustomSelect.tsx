'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
  description?: string;
  color?: string;
  bgColor?: string;
}

interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showIcons?: boolean;
}

export function CustomSelect({
  value,
  onChange,
  options,
  placeholder = 'Select...',
  className = '',
  size = 'md',
  showIcons = false,
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(opt => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-4 py-3 text-base',
  };

  const optionSizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-4 py-3 text-base',
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between ${sizeClasses[size]} border-2 rounded-xl transition-all duration-200 ${
          isOpen
            ? 'border-[#1a237e] ring-2 ring-[#1a237e]/20'
            : 'border-slate-200 hover:border-slate-300'
        } bg-white text-left`}
      >
        <div className="flex items-center gap-2 min-w-0">
          {showIcons && selectedOption?.icon && (
            <span className={selectedOption.color || 'text-slate-600'}>
              {selectedOption.icon}
            </span>
          )}
          <span className={`truncate ${selectedOption ? 'text-slate-800' : 'text-slate-400'}`}>
            {selectedOption?.label || placeholder}
          </span>
        </div>
        <ChevronDown
          className={`w-4 h-4 text-slate-400 flex-shrink-0 ml-2 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden max-h-60 overflow-y-auto">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
              className={`w-full flex items-center gap-2 ${optionSizeClasses[size]} transition-colors text-left ${
                value === option.value
                  ? 'bg-[#1a237e]/5 text-[#1a237e]'
                  : 'hover:bg-slate-50 text-slate-700'
              }`}
            >
              {showIcons && option.icon && (
                <span className={value === option.value ? 'text-[#1a237e]' : option.color || 'text-slate-500'}>
                  {option.icon}
                </span>
              )}
              <span className="flex-1 truncate">{option.label}</span>
              {value === option.value && (
                <Check className="w-4 h-4 text-[#1a237e] flex-shrink-0" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default CustomSelect;
