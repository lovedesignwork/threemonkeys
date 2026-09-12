import { isSpecialPackage } from '@/lib/data/addons';
import { buildBangkokTimestamp } from '@/lib/allotment/zones';

/** Existing guest limits shared by booking, checkout and payment validation. */
export function getMaxGuestsForPackage(packageId: string | null): number {
  if (packageId === 'monkey-dome' || packageId === 'bamboo-pavilion' || packageId === 'exclusive-romantic-zone-7') return 4;
  if (packageId === 'monkey-nest') return 6;
  if (packageId === 'zone-6') return 50;
  if (packageId === 'zone-7') return 10;
  if (packageId === 'rooftop-romantic') return 40;
  if (packageId === 'indoor-seat' || packageId === 'outdoor-seat') return 100;
  if (packageId === 'will-you-marry-me') return 2;
  if (isSpecialPackage(packageId)) return 10;
  return 20;
}

export function getAvailableTimeSlots(packageId: string | null): string[] {
  if (packageId === 'monkey-dome' || packageId === 'monkey-nest') return ['16:00', '19:00', '22:00'];
  if (packageId === 'monkey-hilltop' || packageId === 'bamboo-pavilion') return ['19:00', '22:00'];
  const startHour = isSpecialPackage(packageId) ? 17 : 10;
  return Array.from({ length: 23 - startHour }, (_, i) => `${i + startHour}:00`);
}

export function isValidBookingDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

/** Calendar dates are wall-calendar values, never UTC instants to localize. */
export function parseCalendarDate(value: string | null | undefined): Date | null {
  if (!value || !isValidBookingDate(value)) return null;
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(0);
  date.setFullYear(year, month - 1, day);
  date.setHours(0, 0, 0, 0);
  return date;
}

/** Bangkok uses UTC+7 throughout the year. Ignore the visitor's timezone. */
export function getBangkokDate(now = new Date()): string {
  return new Date(now.getTime() + 7 * 60 * 60 * 1000).toISOString().slice(0, 10);
}

export function getMinimumBookingDate(packageId: string | null, now = new Date()): string {
  return getBangkokDate(new Date(now.getTime() + (isSpecialPackage(packageId) ? 24 * 60 * 60 * 1000 : 0)));
}

export function isAdvanceBooking(selectedDate: string | null | undefined, now = new Date()): boolean {
  return !!selectedDate && isValidBookingDate(selectedDate) && selectedDate > getBangkokDate(now);
}

export function isTimeSlotBookable(timeSlot: string, selectedDate: string, now = new Date()): boolean {
  if (!selectedDate) return true; // Show slots before the visitor picks a date.
  if (!isValidBookingDate(selectedDate) || !/^([01]\d|2[0-3]):[0-5]\d$/.test(timeSlot)) return false;
  const startsAt = new Date(buildBangkokTimestamp(selectedDate, timeSlot));
  return startsAt.getTime() > now.getTime() + 2 * 60 * 60 * 1000;
}
