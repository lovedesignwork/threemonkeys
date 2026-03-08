'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';

interface CalendarPickerProps {
  value: string;
  onChange: (date: string) => void;
  minDate?: string;
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export function CalendarPicker({ value, onChange, minDate }: CalendarPickerProps) {
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
    <div ref={containerRef} className="relative">
      <div className="relative">
        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full h-11 pl-10 pr-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-none focus:border-[#b1b94c] text-left"
        >
          {value ? formatDisplayDate(value) : 'Select date'}
        </button>
      </div>

      {isOpen && (
        <div 
          className="absolute z-50 mt-2 bg-white rounded-xl p-6 shadow-xl"
          style={{ border: '3px solid #b1b94c', minWidth: '340px' }}
        >
          {/* Header */}
          <div className="mb-6 flex items-center justify-between">
            <button
              type="button"
              onClick={prevMonth}
              disabled={!canGoPrev}
              className="rounded-lg p-2 hover:bg-gray-100 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="h-5 w-5 text-gray-600" />
            </button>
            <h3 className="text-gray-900" style={{ fontSize: '22px', fontWeight: 400 }}>
              {MONTHS[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </h3>
            <button
              type="button"
              onClick={nextMonth}
              className="rounded-lg p-2 hover:bg-gray-100 transition-colors"
            >
              <ChevronRight className="h-5 w-5 text-gray-600" />
            </button>
          </div>

          {/* Weekday Headers */}
          <div className="mb-3 grid grid-cols-7 gap-2 text-center text-sm font-medium text-gray-500">
            {WEEKDAYS.map((day) => (
              <div key={day} className="py-2 w-10">{day}</div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-2">
            {/* Empty cells before month start */}
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`empty-${i}`} className="w-10 h-10" />
            ))}

            {/* Day buttons */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const disabled = isDateDisabled(day);
              const selected = isDateSelected(day);
              const todayDate = isToday(day);

              return (
                <div key={day} className="flex items-center justify-center">
                  <button
                    type="button"
                    onClick={() => handleDateSelect(day)}
                    disabled={disabled}
                    className={`
                      w-10 h-10 flex items-center justify-center rounded-full text-sm font-medium transition-all
                      ${selected 
                        ? 'text-white' 
                        : disabled 
                          ? 'text-gray-300 cursor-not-allowed' 
                          : 'bg-green-100 text-green-700 hover:bg-green-200 cursor-pointer'
                      }
                      ${todayDate && !selected ? 'ring-2 ring-offset-2 ring-blue-500' : ''}
                    `}
                    style={selected ? { backgroundColor: '#b1b94c', color: '#000' } : undefined}
                  >
                    {day}
                  </button>
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-center gap-8 text-sm">
            <div className="flex items-center gap-2">
              <span 
                className="h-3 w-3 rounded-full bg-green-100"
                style={{ border: '1px solid #BBF7D0' }}
              />
              <span className="text-gray-600">Available</span>
            </div>
            <div className="flex items-center gap-2">
              <span 
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: '#b1b94c' }}
              />
              <span className="text-gray-600">Selected</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
