import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { requireAdmin, isAuthError } from '@/lib/auth/api-auth';

// Bangkok is UTC+7 (no DST). Convert a UTC ISO timestamp to its local
// date (YYYY-MM-DD) and time (HH:MM) for display parity with online bookings.
const BKK_OFFSET_MS = 7 * 60 * 60 * 1000;
function bkkParts(iso: string): { date: string; time: string } {
  const local = new Date(new Date(iso).getTime() + BKK_OFFSET_MS);
  const s = local.toISOString();
  return { date: s.slice(0, 10), time: s.slice(11, 16) };
}

interface ManualAllotmentRow {
  id: string;
  zone_id: string | null;
  table_code: string | null;
  start_at: string;
  source: string;
  booking_id: string | null;
  customer_name: string | null;
  guest_count: number | null;
  adult_count: number | null;
  child_count: number | null;
  customer_phone: string | null;
  customer_email: string | null;
  notes: string | null;
  deposit_amount: number | null;
  booking_ref: string | null;
  public_token: string | null;
  created_at: string;
}

// Extract the trailing running number from a manual booking ref
// (e.g. "3M-S-000236" -> "000236"). Falls back to empty string.
function refSeq(ref: string | null): string {
  if (!ref) return '';
  const m = ref.match(/(\d+)\s*$/);
  return m ? m[1] : '';
}

// Normalize a manual allotment into the same shape the bookings list expects.
function allotmentToBooking(a: ManualAllotmentRow) {
  const { date, time } = bkkParts(a.start_at);
  const guests = a.guest_count ?? ((a.adult_count || 0) + (a.child_count || 0));
  return {
    id: a.id,
    booking_ref: a.booking_ref || `TM-${a.id.slice(0, 8).toUpperCase()}`,
    activity_date: date,
    time_slot: time,
    guest_count: guests || 0,
    total_amount: a.deposit_amount || 0,
    discount_amount: 0,
    status: 'confirmed',
    created_at: a.created_at,
    admin_notes: a.notes,
    zone_id: a.zone_id,
    table_code: a.table_code,
    packages: { name: 'Manual Booking' },
    promo_codes: null,
    booking_customers: [
      {
        first_name: a.customer_name || 'Walk-in Guest',
        last_name: '',
        email: a.customer_email || '',
        phone: a.customer_phone || '',
        country_code: null,
        special_requests: a.notes || null,
      },
    ],
    booking_transport: [],
    booking_addons: [],
    booking_origin_country_code: null,
    booking_origin_country_name: null,
    booking_origin_ip: null,
    payment_origin_country_code: null,
    payment_origin_country_name: null,
    // Manual-booking markers consumed by the UI
    is_manual: true,
    source: a.source,
    adult_count: a.adult_count,
    child_count: a.child_count,
    public_token: a.public_token,
    reservation_seq: refSeq(a.booking_ref),
  };
}

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (isAuthError(auth)) return auth;

  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '10');
    const status = searchParams.get('status') || 'all';
    const sortField = searchParams.get('sortField') || 'created_at';
    const sortDirection = searchParams.get('sortDirection') || 'desc';
    const dateFilterType = searchParams.get('dateFilterType') || 'play';
    const dateFrom = searchParams.get('dateFrom') || '';
    const dateTo = searchParams.get('dateTo') || '';

    // ---- Online bookings (no DB-level pagination: we merge with manual bookings) ----
    let query = supabaseAdmin
      .from('bookings')
      .select(`
        *,
        packages (name),
        promo_codes (code, discount_type, discount_value),
        booking_customers (first_name, last_name, email, phone, country_code, special_requests),
        booking_transport (id, transport_type, hotel_name, room_number, private_passengers, non_players),
        booking_addons (quantity, unit_price, promo_addons (name))
      `);

    if (status !== 'all') {
      query = query.eq('status', status);
    }

    if (dateFrom || dateTo) {
      const dateField = dateFilterType === 'booking' ? 'created_at' : 'activity_date';
      if (dateFrom && dateTo) {
        if (dateFilterType === 'booking') {
          query = query.gte(dateField, `${dateFrom}T00:00:00`).lte(dateField, `${dateTo}T23:59:59`);
        } else {
          query = query.gte(dateField, dateFrom).lte(dateField, dateTo);
        }
      } else if (dateFrom) {
        query = dateFilterType === 'booking'
          ? query.gte(dateField, `${dateFrom}T00:00:00`)
          : query.gte(dateField, dateFrom);
      } else if (dateTo) {
        query = dateFilterType === 'booking'
          ? query.lte(dateField, `${dateTo}T23:59:59`)
          : query.lte(dateField, dateTo);
      }
    }

    const { data: bookingsData, error } = await query;

    if (error) {
      console.error('Error fetching bookings:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // ---- Manual bookings (genuine manual allotments only: booking_id IS NULL) ----
    // Only included when the status filter allows confirmed records.
    let manualBookings: ReturnType<typeof allotmentToBooking>[] = [];
    if (status === 'all' || status === 'confirmed') {
      let allotQuery = supabaseAdmin
        .from('tm_allotments')
        .select('id, zone_id, table_code, start_at, source, booking_id, customer_name, guest_count, adult_count, child_count, customer_phone, customer_email, notes, deposit_amount, booking_ref, public_token, created_at')
        .is('booking_id', null);

      if (dateFrom || dateTo) {
        // 'play' → filter by start_at date; 'booking' → filter by created_at
        const field = dateFilterType === 'booking' ? 'created_at' : 'start_at';
        if (dateFrom) allotQuery = allotQuery.gte(field, `${dateFrom}T00:00:00`);
        if (dateTo) allotQuery = allotQuery.lte(field, `${dateTo}T23:59:59`);
      }

      const { data: allotData, error: allotError } = await allotQuery;
      if (allotError) {
        console.error('Error fetching manual allotments:', allotError);
      } else {
        manualBookings = (allotData as ManualAllotmentRow[]).map(allotmentToBooking);
      }
    }

    // ---- Merge, sort, paginate in memory ----
    const merged = [...(bookingsData || []), ...manualBookings];

    const dir = sortDirection === 'asc' ? 1 : -1;
    merged.sort((a, b) => {
      const av = (a as Record<string, unknown>)[sortField];
      const bv = (b as Record<string, unknown>)[sortField];
      if (av == null && bv == null) return 0;
      if (av == null) return 1;
      if (bv == null) return -1;
      if (typeof av === 'number' && typeof bv === 'number') return (av - bv) * dir;
      return String(av).localeCompare(String(bv)) * dir;
    });

    const count = merged.length;
    const start = (page - 1) * pageSize;
    const data = merged.slice(start, start + pageSize);

    return NextResponse.json({ data, count });
  } catch (error) {
    console.error('Error in admin bookings API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT() {
  return NextResponse.json(
    { 
      error: 'Editing disabled. Please use OneBooking Dashboard to edit bookings.',
      redirectUrl: 'https://onebooking-dashboard.vercel.app/bookings'
    }, 
    { status: 403 }
  );
}
