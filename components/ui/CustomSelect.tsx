'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Check } from 'lucide-react';

interface Option {
  value: string;
  label: string;
  disabled?: boolean;
}

interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  placeholder?: string;
  className?: string;
  /** Visual density. `"sm"` makes the trigger button shorter and tighter. */
  size?: 'sm' | 'md';
}

export function CustomSelect({ 
  value, 
  onChange, 
  options, 
  placeholder = 'Select...', 
  className = '',
  size = 'md',
}: CustomSelectProps) {
  const triggerSize = size === 'sm' ? 'h-9 px-3 pr-9 text-xs' : 'h-12 px-4 pr-10 text-sm';
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find(opt => opt.value === value);

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`
          w-full ${triggerSize} bg-white/5 border-2 rounded-xl text-left
          transition-all duration-200 cursor-pointer
          ${isOpen 
            ? 'border-[#b1b94c] bg-white/10' 
            : 'border-white/10 hover:border-white/20'
          }
          ${selectedOption ? 'text-white' : 'text-white/50'}
        `}
      >
        {selectedOption ? selectedOption.label : placeholder}
        <ChevronDown 
          className={`
            absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40
            transition-transform duration-200
            ${isOpen ? 'rotate-180' : ''}
          `}
        />
      </button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute z-50 mt-2 w-full bg-[#1a1a1a] border-2 border-[#b1b94c]/40 rounded-xl shadow-2xl overflow-hidden"
          >
            <div className="max-h-[240px] overflow-y-auto custom-scrollbar py-1">
              {options.map((option) => {
                const isSelected = option.value === value;
                const isDisabled = option.disabled === true;
                return (
                  <button
                    key={option.value}
                    type="button"
                    disabled={isDisabled}
                    onClick={() => {
                      if (!isDisabled) {
                        onChange(option.value);
                        setIsOpen(false);
                      }
                    }}
                    className={`
                      w-full px-4 py-2.5 text-sm text-left flex items-center justify-between
                      transition-colors duration-150
                      ${isDisabled 
                        ? 'text-white/30 cursor-not-allowed bg-white/5' 
                        : isSelected 
                          ? 'bg-[#b1b94c]/20 text-[#b1b94c]' 
                          : 'text-white/70 hover:bg-white/10 hover:text-white'
                      }
                    `}
                  >
                    <span>{option.label}</span>
                    {isSelected && !isDisabled && (
                      <Check className="w-4 h-4 text-[#b1b94c]" />
                    )}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
