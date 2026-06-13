/**
 * Server-side wrappers around the tm_* Postgres RPCs.
 * Uses the service-role Supabase client (`supabaseAdmin`).
 *
 * See docs/ALLOTMENT_SPEC.md sections 5 (RPCs) and 7-8 (flows).
 */

import { supabaseAdmin } from '@/lib/supabase/server';
import type {
  AllotmentSource,
  ClaimResult,
  TmAllotment,
  ZoneAvailability,
  ZoneDaySlot,
} from './types';

/**
 * Check whether at least one table is free for the given zone + start time.
 */
export async function checkZoneAvailability(
  zoneId: string,
  startAtIso: string
): Promise<ZoneAvailability> {
  const { data, error } = await supabaseAdmin.rpc('tm_check_zone_availability', {
    p_zone_id: zoneId,
    p_start_at: startAtIso,
  });
  if (error) throw error;
  const row = Array.isArray(data) ? data[0] : data;
  return {
    available_count: Number(row?.available_count ?? 0),
    total_count: Number(row?.total_count ?? 0),
    is_available: Boolean(row?.is_available),
  };
}

/**
 * Atomic claim of one free table in the zone. Raises Postgres exception
 * `TM_ALLOTMENT_FULL` if no table is free.
 *
 * On success, also denormalises zone_id + table_code onto the bookings row.
 */
export async function claimTable(opts: {
  zoneId: string;
  bookingId: string | null;
  startAtIso: string;
  source?: AllotmentSource;
  customerName?: string | null;
  guestCount?: number | null;
  notes?: string | null;
  createdBy?: string | null;
  /** Override the deposit amount (defaults to bookings.total_amount when bookingId is set). */
  depositAmount?: number | null;
  /** Override the booking ref (defaults to bookings.booking_ref when bookingId is set). */
  bookingRef?: string | null;
}): Promise<ClaimResult> {
  const { data, error } = await supabaseAdmin.rpc('tm_claim_table', {
    p_zone_id: opts.zoneId,
    p_booking_id: opts.bookingId,
    p_start_at: opts.startAtIso,
    p_source: opts.source ?? 'website',
    p_customer_name: opts.customerName ?? null,
    p_guest_count: opts.guestCount ?? null,
    p_notes: opts.notes ?? null,
    p_created_by: opts.createdBy ?? null,
    p_deposit_amount: opts.depositAmount ?? null,
    p_booking_ref: opts.bookingRef ?? null,
  });
  if (error) throw error;
  const row = Array.isArray(data) ? data[0] : data;
  return {
    allotment_id: row?.allotment_id,
    table_code: row?.table_code,
  };
}

/**
 * Release any allotments tied to this booking. Idempotent.
 */
export async function releaseTable(bookingId: string): Promise<number> {
  const { data, error } = await supabaseAdmin.rpc('tm_release_table', {
    p_booking_id: bookingId,
  });
  if (error) throw error;
  return Number(data ?? 0);
}

/**
 * Admin manual block. If `tableCode` is null, picks the first free table.
 */
export async function createManualBlock(opts: {
  zoneId: string;
  tableCode?: string | null;
  startAtIso: string;
  source: AllotmentSource;
  customerName?: string | null;
  guestCount?: number | null;
  notes?: string | null;
  createdBy?: string | null;
  depositAmount?: number | null;
  customerPhone?: string | null;
  customerEmail?: string | null;
  adultCount?: number | null;
  childCount?: number | null;
}): Promise<string> {
  const { data, error } = await supabaseAdmin.rpc('tm_block_table_manual', {
    p_zone_id: opts.zoneId,
    p_table_code: opts.tableCode ?? null,
    p_start_at: opts.startAtIso,
    p_source: opts.source,
    p_customer_name: opts.customerName ?? null,
    p_guest_count: opts.guestCount ?? null,
    p_notes: opts.notes ?? null,
    p_created_by: opts.createdBy ?? null,
    p_deposit_amount: opts.depositAmount ?? null,
    p_customer_phone: opts.customerPhone ?? null,
    p_customer_email: opts.customerEmail ?? null,
    p_adult_count: opts.adultCount ?? null,
    p_child_count: opts.childCount ?? null,
  });
  if (error) throw error;
  return String(data);
}

/**
 * Per-time-slot availability for a given zone + date (admin view).
 */
export async function getZoneDayAvailability(
  zoneId: string,
  day: string  // YYYY-MM-DD
): Promise<ZoneDaySlot[]> {
  const { data, error } = await supabaseAdmin.rpc('tm_get_zone_day_availability', {
    p_zone_id: zoneId,
    p_day: day,
  });
  if (error) throw error;
  return (data ?? []) as ZoneDaySlot[];
}

/**
 * List allotments with optional filters. Used by admin UI.
 */
export async function listAllotments(opts: {
  zoneId?: string;
  fromIso?: string;
  toIso?: string;
  source?: AllotmentSource;
  limit?: number;
}): Promise<TmAllotment[]> {
  let q = supabaseAdmin
    .from('tm_allotments')
    .select('*')
    .order('start_at', { ascending: true });
  if (opts.zoneId) q = q.eq('zone_id', opts.zoneId);
  if (opts.source) q = q.eq('source', opts.source);
  if (opts.fromIso) q = q.gte('start_at', opts.fromIso);
  if (opts.toIso) q = q.lt('start_at', opts.toIso);
  if (opts.limit) q = q.limit(opts.limit);
  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []) as TmAllotment[];
}

/**
 * Get a single allotment by id.
 */
export async function getAllotmentById(id: string): Promise<TmAllotment | null> {
  const { data, error } = await supabaseAdmin
    .from('tm_allotments')
    .select('*')
    .eq('id', id)
    .single();
  if (error) {
    if (error.code === 'PGRST116') return null; // Not found
    throw error;
  }
  return data as TmAllotment;
}

/**
 * Delete an allotment by id. Returns true if a row was removed.
 */
export async function deleteAllotment(id: string): Promise<boolean> {
  const { error, count } = await supabaseAdmin
    .from('tm_allotments')
    .delete({ count: 'exact' })
    .eq('id', id);
  if (error) throw error;
  return (count ?? 0) > 0;
}

/**
 * Update mutable metadata on an allotment (does NOT move it).
 * Only `source`, `customer_name`, `guest_count`, `notes`, contact info, and guest breakdown are mutable.
 */
export async function updateAllotmentMeta(
  id: string,
  patch: {
    source?: AllotmentSource;
    customer_name?: string | null;
    guest_count?: number | null;
    notes?: string | null;
    deposit_amount?: number | null;
    customer_phone?: string | null;
    customer_email?: string | null;
    adult_count?: number | null;
    child_count?: number | null;
  }
): Promise<TmAllotment | null> {
  const update: Record<string, unknown> = {};
  if (patch.source !== undefined)         update.source = patch.source;
  if (patch.customer_name !== undefined)  update.customer_name = patch.customer_name;
  if (patch.guest_count !== undefined)    update.guest_count = patch.guest_count;
  if (patch.notes !== undefined)          update.notes = patch.notes;
  if (patch.deposit_amount !== undefined) update.deposit_amount = patch.deposit_amount;
  if (patch.customer_phone !== undefined) update.customer_phone = patch.customer_phone;
  if (patch.customer_email !== undefined) update.customer_email = patch.customer_email;
  if (patch.adult_count !== undefined)    update.adult_count = patch.adult_count;
  if (patch.child_count !== undefined)    update.child_count = patch.child_count;
  if (Object.keys(update).length === 0) return null;
  const { data, error } = await supabaseAdmin
    .from('tm_allotments')
    .update(update)
    .eq('id', id)
    .select('*')
    .single();
  if (error) throw error;
  return data as TmAllotment;
}

/**
 * Atomically move an allotment to a new zone/time(/table).
 * Postgres function tm_move_allotment runs the delete+claim in a single
 * transaction — if the new slot is taken, the original block is preserved.
 */
export async function moveAllotment(opts: {
  allotmentId: string;
  newZoneId: string;
  newStartAtIso: string;
  newTableCode?: string | null;
}): Promise<ClaimResult> {
  const { data, error } = await supabaseAdmin.rpc('tm_move_allotment', {
    p_allotment_id: opts.allotmentId,
    p_new_zone_id: opts.newZoneId,
    p_new_start_at: opts.newStartAtIso,
    p_new_table_code: opts.newTableCode ?? null,
  });
  if (error) throw error;
  const row = Array.isArray(data) ? data[0] : data;
  return { allotment_id: row?.allotment_id, table_code: row?.table_code };
}

/** Fetch all active zones with their tables. Cached in-process. */
let _zonesCache: Array<{ id: string; name: string; time_slots: string[]; block_minutes: number; display_order: number; tables: string[] }> | null = null;

export async function getZonesWithTables(force = false) {
  if (_zonesCache && !force) return _zonesCache;
  const { data: zones, error: zonesErr } = await supabaseAdmin
    .from('tm_zones')
    .select('id, name, time_slots, block_minutes, display_order')
    .eq('is_active', true)
    .order('display_order', { ascending: true });
  if (zonesErr) throw zonesErr;
  const { data: tables, error: tablesErr } = await supabaseAdmin
    .from('tm_tables')
    .select('zone_id, table_code, display_order')
    .eq('is_active', true)
    .order('display_order', { ascending: true });
  if (tablesErr) throw tablesErr;
  const byZone = new Map<string, string[]>();
  for (const t of tables ?? []) {
    const arr = byZone.get(t.zone_id) ?? [];
    arr.push(t.table_code);
    byZone.set(t.zone_id, arr);
  }
  _zonesCache = (zones ?? []).map(z => ({
    id: z.id,
    name: z.name,
    time_slots: z.time_slots,
    block_minutes: z.block_minutes,
    display_order: z.display_order,
    tables: byZone.get(z.id) ?? [],
  }));
  return _zonesCache;
}
