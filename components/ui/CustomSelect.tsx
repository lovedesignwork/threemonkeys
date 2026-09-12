'use client';

import { useState, useRef, useEffect, useId } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Check } from 'lucide-react';

interface Option {
  value: string;
  label: string;
  disabled?: boolean;
}

interface CustomSelectProps extends Pick<React.AriaAttributes, 'aria-label' | 'aria-labelledby' | 'aria-describedby' | 'aria-invalid' | 'aria-required'> {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  placeholder?: string;
  className?: string;
  /** Visual density. `"sm"` makes the trigger button shorter and tighter. */
  size?: 'sm' | 'md';
  /**
   * Color theme. `"dark"` (default) suits dark backgrounds (public site).
   * `"light"` suits white containers (admin panels) so the text stays visible.
   */
  variant?: 'dark' | 'light';
}

export function CustomSelect({ 
  id,
  value, 
  onChange, 
  options, 
  placeholder = 'Select...', 
  className = '',
  size = 'md',
  variant = 'dark',
  ...ariaProps
}: CustomSelectProps) {
  const triggerSize = size === 'sm' ? 'h-9 px-3 pr-9 text-xs' : 'h-12 px-4 pr-10 text-sm';
  const isLight = variant === 'light';
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const optionRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const generatedId = useId();
  const triggerId = id ?? generatedId;
  const listboxId = `${triggerId}-listbox`;
  const enabledIndices = options.flatMap((option, index) => option.disabled ? [] : [index]);

  const openDropdown = (fromEnd = false) => {
    const selectedIndex = options.findIndex(option => option.value === value && !option.disabled);
    setActiveIndex(selectedIndex >= 0 ? selectedIndex : enabledIndices[fromEnd ? enabledIndices.length - 1 : 0] ?? -1);
    setIsOpen(true);
  };

  const selectOption = (index: number) => {
    const option = options[index];
    if (!option || option.disabled) return;
    onChange(option.value);
    setIsOpen(false);
    triggerRef.current?.focus();
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      const direction = event.key === 'ArrowDown' ? 1 : -1;
      if (!isOpen) {
        openDropdown(direction === -1);
      } else if (enabledIndices.length) {
        const position = enabledIndices.indexOf(activeIndex);
        const nextPosition = position === -1
          ? (direction === 1 ? 0 : enabledIndices.length - 1)
          : (position + direction + enabledIndices.length) % enabledIndices.length;
        setActiveIndex(enabledIndices[nextPosition]);
      }
    } else if (event.key === 'Home' || event.key === 'End') {
      event.preventDefault();
      setIsOpen(true);
      setActiveIndex(enabledIndices[event.key === 'Home' ? 0 : enabledIndices.length - 1] ?? -1);
    } else if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      if (isOpen) selectOption(activeIndex);
      else openDropdown();
    } else if (event.key === 'Escape' && isOpen) {
      event.preventDefault();
      event.stopPropagation();
      setIsOpen(false);
    } else if (event.key === 'Tab') {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    if (isOpen && activeIndex >= 0) {
      optionRefs.current[activeIndex]?.scrollIntoView({ block: 'nearest' });
    }
  }, [isOpen, activeIndex]);

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
    <div
      ref={containerRef}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setIsOpen(false);
      }}
      className={`relative ${className}`}
    >
      {/* Trigger Button */}
      <button
        {...ariaProps}
        id={triggerId}
        ref={triggerRef}
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={isOpen ? listboxId : undefined}
        aria-activedescendant={isOpen && options[activeIndex] && !options[activeIndex].disabled ? `${listboxId}-option-${activeIndex}` : undefined}
        onKeyDown={handleKeyDown}
        onClick={() => isOpen ? setIsOpen(false) : openDropdown()}
        className={`
          w-full ${triggerSize} border-2 rounded-xl text-left
          transition-all duration-200 cursor-pointer
          ${isLight
            ? `bg-white ${isOpen ? 'border-[#b1b94c] bg-slate-50' : 'border-slate-200 hover:border-slate-300'} ${selectedOption ? 'text-slate-900' : 'text-slate-400'}`
            : `bg-white/5 ${isOpen ? 'border-[#b1b94c] bg-white/10' : 'border-white/10 hover:border-white/20'} ${selectedOption ? 'text-white' : 'text-white/50'}`
          }
        `}
      >
        {selectedOption ? selectedOption.label : placeholder}
        <ChevronDown 
          className={`
            absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4
            ${isLight ? 'text-slate-400' : 'text-white/40'}
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
            className={`absolute z-50 mt-2 w-full border-2 rounded-xl shadow-2xl overflow-hidden ${
              isLight
                ? 'bg-white border-slate-200'
                : 'bg-[#1a1a1a] border-[#b1b94c]/40'
            }`}
          >
            <div id={listboxId} role="listbox" aria-labelledby={ariaProps['aria-labelledby'] ?? triggerId} className="max-h-[240px] overflow-y-auto custom-scrollbar py-1">
              {options.map((option, index) => {
                const isSelected = option.value === value;
                const isDisabled = option.disabled === true;
                const isActive = index === activeIndex;
                return (
                  <button
                    key={option.value}
                    id={`${listboxId}-option-${index}`}
                    ref={(element) => { optionRefs.current[index] = element; }}
                    type="button"
                    role="option"
                    tabIndex={-1}
                    aria-selected={isSelected}
                    aria-disabled={isDisabled}
                    disabled={isDisabled}
                    onMouseDown={(event) => event.preventDefault()}
                    onMouseEnter={() => { if (!isDisabled) setActiveIndex(index); }}
                    onClick={() => selectOption(index)}
                    className={`
                      w-full px-4 py-2.5 text-sm text-left flex items-center justify-between
                      transition-colors duration-150
                      ${isActive && !isDisabled ? 'ring-2 ring-inset ring-[#b1b94c]/60' : ''}
                      ${isLight
                        ? (isDisabled
                            ? 'text-slate-300 cursor-not-allowed bg-slate-50'
                            : isSelected
                              ? 'bg-[#b1b94c]/15 text-[#6f7717]'
                              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900')
                        : (isDisabled
                            ? 'text-white/30 cursor-not-allowed bg-white/5'
                            : isSelected
                              ? 'bg-[#b1b94c]/20 text-[#b1b94c]'
                              : 'text-white/70 hover:bg-white/10 hover:text-white')
                      }
                    `}
                  >
                    <span>{option.label}</span>
                    {isSelected && !isDisabled && (
                      <Check className={`w-4 h-4 ${isLight ? 'text-[#6f7717]' : 'text-[#b1b94c]'}`} />
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
