import { z } from 'zod';
import { getPackageById } from '@/lib/data/packages';
import { getAddonById, isSpecialPackage } from '@/lib/data/addons';
import { getAvailableTimeSlots, getMaxGuestsForPackage, isAdvanceBooking, isTimeSlotBookable, isValidBookingDate } from './booking-rules';
export { getAvailableTimeSlots, getMaxGuestsForPackage, getBangkokDate, getMinimumBookingDate, isAdvanceBooking, isTimeSlotBookable, parseCalendarDate } from './booking-rules';

export class CheckoutValidationError extends Error {
  constructor(message: string, public readonly status = 400) {
    super(message);
    this.name = 'CheckoutValidationError';
  }
}

const count = z.number().int().min(0).max(100);
const optionalText = (max: number) => z.string().trim().max(max).optional();
const bookingSchema = z.object({
  packageId: z.string().min(1).max(100),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  time: z.string().regex(/^\d{2}:\d{2}$/),
  guests: count.min(1),
  pickup: z.boolean().default(false),
  hotel: optionalText(500), room: optionalText(100),
  privateTransfer: z.boolean().default(false),
  privatePassengers: count.default(0),
  nonPlayers: count.optional(),
  // Current checkout uses this name; older callers use nonPlayers.
  additionalGuests: count.optional(),
  promoAddons: z.record(z.string().max(100), count).default({}),
  promoCodeId: z.string().uuid().nullable().optional(),
  customer: z.object({
    firstName: z.string().trim().min(1).max(100),
    lastName: z.string().trim().min(1).max(100),
    email: z.string().trim().max(254).regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/),
    // Match the UI: a contact/LINE ID is acceptable, not only phone digits.
    phone: z.string().trim().min(1).max(100),
    countryCode: z.string().trim().max(10).default(''),
    specialRequests: optionalText(5000),
  }),
});

export function parseBookingSelection(input: unknown, now = new Date()) {
  const parsed = bookingSchema.omit({ customer: true }).safeParse(input);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    throw new CheckoutValidationError(`Invalid ${issue.path.join('.') || 'booking details'}. Please review your booking.`);
  }
  const data = parsed.data;
  const packageData = getPackageById(data.packageId);
  if (!packageData) throw new CheckoutValidationError('Package not found', 404);
  if (packageData.suspended) throw new CheckoutValidationError('This zone is currently unavailable for booking.', 409);
  if (!isValidBookingDate(data.date)) throw new CheckoutValidationError('Please choose a valid booking date.');
  if (!getAvailableTimeSlots(data.packageId).includes(data.time)) throw new CheckoutValidationError('This time slot is not available for the selected package.');
  if (!isTimeSlotBookable(data.time, data.date, now)) throw new CheckoutValidationError('Bookings must be made at least 2 hours in advance (Phuket time).');
  const advanceBooking = isAdvanceBooking(data.date, now);
  if (isSpecialPackage(data.packageId) && !advanceBooking) throw new CheckoutValidationError('Special packages require at least 1 day advance booking.');

  const nonPlayers = data.nonPlayers ?? data.additionalGuests ?? 0;
  if (data.nonPlayers !== undefined && data.additionalGuests !== undefined && data.nonPlayers !== data.additionalGuests) throw new CheckoutValidationError('Additional guest counts do not match.');
  const maxGuests = getMaxGuestsForPackage(data.packageId);
  if (data.guests + nonPlayers > maxGuests) throw new CheckoutValidationError(`This package allows a maximum of ${maxGuests} guests.`);
  if (data.privateTransfer) {
    if (!advanceBooking) throw new CheckoutValidationError('Private transfers require at least 1 day advance booking.');
    if (packageData.includesTransfer || isSpecialPackage(data.packageId)) throw new CheckoutValidationError('A private transfer is already included in this package.');
    if (!data.hotel) throw new CheckoutValidationError('Please provide your pickup hotel or address.');
    if (data.privatePassengers < 1 || data.privatePassengers > 10 || data.guests + nonPlayers > 10) throw new CheckoutValidationError('Private transfers allow a maximum of 10 passengers.');
  } else if (data.pickup && !packageData.includesTransfer) {
    throw new CheckoutValidationError('Please select the paid private transfer option for hotel pickup.');
  }
  if (nonPlayers > 0 && !data.pickup && !data.privateTransfer && !packageData.includesTransfer) throw new CheckoutValidationError('Additional transport guests require a transfer.');
  for (const [id, quantity] of Object.entries(data.promoAddons)) {
    if (!getAddonById(id)) throw new CheckoutValidationError('An add-on is no longer available. Please review your selection.');
    if (quantity > 0 && !advanceBooking) throw new CheckoutValidationError('Add-ons require at least 1 day advance booking.');
  }
  return { ...data, nonPlayers, privatePassengers: data.privateTransfer ? data.privatePassengers : packageData.includesTransfer ? data.guests : 0 };
}

export function parseBookingData(input: unknown, now = new Date()) {
  const parsed = bookingSchema.safeParse(input);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    throw new CheckoutValidationError(`Invalid ${issue.path.join('.') || 'booking details'}. Please review your booking.`);
  }
  return { ...parseBookingSelection(parsed.data, now), customer: parsed.data.customer };
}

/** Parse the public checkout URL without silently truncating numeric input. */
export function parseCheckoutSelection(params: { get(name: string): string | null }, now = new Date()) {
  const transfer = params.get('transfer');
  if (transfer !== null && transfer !== 'true' && transfer !== 'false') throw new CheckoutValidationError('Invalid transfer selection.');
  const promoAddons: Record<string, number> = {};
  const addons = params.get('addons');
  if (addons) {
    for (const entry of addons.split(',')) {
      const parts = entry.split(':');
      if (parts.length !== 2 || !parts[0] || !parts[1] || Object.hasOwn(promoAddons, parts[0])) throw new CheckoutValidationError('Invalid add-on selection.');
      promoAddons[parts[0]] = Number(parts[1]);
    }
  }
  const guests = Number(params.get('guests') ?? '2');
  return parseBookingSelection({
    packageId: params.get('package'), date: params.get('date'), time: params.get('time'), guests,
    privateTransfer: transfer === 'true', pickup: transfer === 'true', privatePassengers: guests,
    hotel: params.get('hotel') || '', promoAddons,
  }, now);
}

export type BookingData = ReturnType<typeof parseBookingData>;
