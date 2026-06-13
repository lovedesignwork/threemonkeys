/**
 * Types for the Three Monkeys table allotment system.
 * See docs/ALLOTMENT_SPEC.md
 */

export type AllotmentSource = 'website' | 'phone' | 'email' | 'walk_in' | 'admin' | 'other' | 'live_chat';

export interface TmZone {
  id: string;
  name: string;
  package_id: string | null;
  time_slots: string[];
  block_minutes: number;
  display_order: number;
  is_active: boolean;
}

export interface TmTable {
  id: string;
  zone_id: string;
  table_code: string;
  display_order: number;
  is_active: boolean;
}

export interface TmAllotment {
  id: string;
  zone_id: string;
  table_code: string;
  start_at: string;          // ISO timestamp
  end_at: string;            // ISO timestamp
  source: AllotmentSource;
  booking_id: string | null;
  customer_name: string | null;
  guest_count: number | null;
  notes: string | null;
  created_by: string | null;
  deposit_amount: number | null;   // THB the customer paid (cash or Stripe)
  booking_ref: string | null;      // e.g. "3M-00001" — only for website bookings
  customer_phone: string | null;   // Optional phone for manual bookings
  customer_email: string | null;   // Optional email for manual bookings
  adult_count: number | null;      // Number of adult guests
  child_count: number | null;      // Number of child guests
  public_token: string | null;     // Unguessable token for the public e-ticket URL
  created_at: string;
  updated_at: string;
}

export interface ZoneAvailability {
  available_count: number;
  total_count: number;
  is_available: boolean;
}

export interface ZoneDaySlot {
  time_slot: string;         // 'HH:MM' Asia/Bangkok
  start_at: string;          // ISO timestamp UTC
  end_at: string;            // ISO timestamp UTC
  available_count: number;
  total_count: number;
  blocked_tables: string[];
}

export interface ClaimResult {
  allotment_id: string;
  table_code: string;
}

/**
 * Postgres exception names raised by our RPCs.
 * Caught via err.message.startsWith() — Supabase nests them in error.message.
 */
export const ALLOTMENT_ERRORS = {
  ZONE_NOT_FOUND: 'TM_ZONE_NOT_FOUND',
  ALLOTMENT_FULL: 'TM_ALLOTMENT_FULL',
  TABLE_NOT_FOUND: 'TM_TABLE_NOT_FOUND',
  TABLE_TAKEN: 'TM_TABLE_TAKEN',
  START_AT_REQUIRED: 'TM_START_AT_REQUIRED',
  INVALID_SOURCE: 'TM_INVALID_SOURCE',
} as const;

export function isAllotmentError(err: unknown, code: keyof typeof ALLOTMENT_ERRORS): boolean {
  if (!err || typeof err !== 'object') return false;
  const msg = (err as { message?: string }).message ?? '';
  return msg.includes(ALLOTMENT_ERRORS[code]);
}
