'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar, AlertTriangle } from 'lucide-react';

interface CalendarPickerProps {
  value: string;
  onChange: (date: string) => void;
  minDate?: string;
  restrictedDates?: string[];
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export function CalendarPicker({ value, onChange, minDate, restrictedDates = [] }: CalendarPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(() => {
    if (value) {
      const date = new Date(value);
      return new Date(date.getFullYear(), date.getMonth(), 1);
    }
    return new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  });
  
  const containerRef = useRef<HTMLDivElement>(null);
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const minDateObj = minDate ? new Date(minDate) : today;
  minDateObj.setHours(0, 0, 0, 0);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const isDateDisabled = (day: number) => {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    return date < minDateObj;
  };

  const isDateSelected = (day: number) => {
    if (!value) return false;
    const [year, month, dayNum] = value.split('-').map(Number);
    return (
      year === currentMonth.getFullYear() &&
      month - 1 === currentMonth.getMonth() &&
      dayNum === day
    );
  };

  const isToday = (day: number) => {
    return (
      today.getFullYear() === currentMonth.getFullYear() &&
      today.getMonth() === currentMonth.getMonth() &&
      today.getDate() === day
    );
  };

  const isDateRestricted = (day: number) => {
    const year = currentMonth.getFullYear();
    const month = String(currentMonth.getMonth() + 1).padStart(2, '0');
    const dayStr = String(day).padStart(2, '0');
    const dateString = `${year}-${month}-${dayStr}`;
    return restrictedDates.includes(dateString);
  };

  const handleDateSelect = (day: number) => {
    if (isDateDisabled(day)) return;
    const year = currentMonth.getFullYear();
    const month = String(currentMonth.getMonth() + 1).padStart(2, '0');
    const dayStr = String(day).padStart(2, '0');
    const dateString = `${year}-${month}-${dayStr}`;
    onChange(dateString);
    setIsOpen(false);
  };

  const formatDisplayDate = (dateString: string) => {
    if (!dateString) return '';
    const [year, month, day] = dateString.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const daysInMonth = getDaysInMonth(currentMonth);
  const firstDay = getFirstDayOfMonth(currentMonth);
  const canGoPrev = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1) > minDateObj;

  return (
    <div ref={containerRef} className="relative z-30">
      <div className="relative">
        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full h-12 pl-12 pr-4 bg-white/5 border-2 border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-[#b1b94c] text-left hover:border-white/20 transition-all"
        >
          {value ? formatDisplayDate(value) : 'Select date'}
        </button>
      </div>

      {isOpen && (
        <div className="absolute z-50 mt-2 bg-[#1a1a1a] rounded-2xl p-5 shadow-2xl border-2 border-[#b1b94c]/40" style={{ minWidth: '320px' }}>
          {/* Header */}
          <div className="mb-4 flex items-center justify-between">
            <button
              type="button"
              onClick={prevMonth}
              disabled={!canGoPrev}
              className="rounded-lg p-2 hover:bg-white/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="h-5 w-5 text-white/60" />
            </button>
            <h3 className="text-white font-medium text-lg">
              {MONTHS[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </h3>
            <button
              type="button"
              onClick={nextMonth}
              className="rounded-lg p-2 hover:bg-white/10 transition-colors"
            >
              <ChevronRight className="h-5 w-5 text-white/60" />
            </button>
          </div>

          {/* Weekday Headers */}
          <div className="mb-2 grid grid-cols-7 gap-1 text-center text-xs font-medium text-white/40">
            {WEEKDAYS.map((day) => (
              <div key={day} className="py-2 w-9">{day}</div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1">
            {/* Empty cells before month start */}
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`empty-${i}`} className="w-9 h-9" />
            ))}

            {/* Day buttons */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const disabled = isDateDisabled(day);
              const selected = isDateSelected(day);
              const todayDate = isToday(day);
              const restricted = isDateRestricted(day);

              return (
                <div key={day} className="relative flex items-center justify-center">
                  <button
                    type="button"
                    onClick={() => handleDateSelect(day)}
                    disabled={disabled}
                    className={`
                      w-9 h-9 flex items-center justify-center rounded-lg text-sm font-medium transition-all
                      ${selected 
                        ? restricted
                          ? 'bg-amber-500 text-black font-semibold'
                          : 'bg-[#b1b94c] text-black font-semibold' 
                        : disabled 
                          ? 'text-white/20 cursor-not-allowed' 
                          : restricted
                            ? 'text-amber-400 hover:bg-amber-500/20 hover:text-amber-300 cursor-pointer'
                            : 'text-white/70 hover:bg-[#b1b94c]/20 hover:text-[#b1b94c] cursor-pointer'
                      }
                      ${todayDate && !selected ? 'ring-2 ring-[#b1b94c]/50' : ''}
                    `}
                    title={restricted ? 'Alcohol restricted date' : undefined}
                  >
                    {day}
                  </button>
                  {restricted && !disabled && (
                    <AlertTriangle className="absolute -top-0.5 -right-0.5 w-3 h-3 text-amber-400" />
                  )}
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-center gap-4 text-xs flex-wrap">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-white/20 ring-2 ring-[#b1b94c]/50" />
              <span className="text-white/50">Today</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-[#b1b94c]" />
              <span className="text-white/50">Selected</span>
            </div>
            {restrictedDates.length > 0 && (
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-3 w-3 text-amber-400" />
                <span className="text-white/50">Alcohol Restricted</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
