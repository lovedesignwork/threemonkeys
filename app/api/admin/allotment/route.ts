import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, isAuthError } from '@/lib/auth/api-auth';
import {
  createManualBlock,
  getZoneDayAvailability,
  getZonesWithTables,
  listAllotments,
} from '@/lib/allotment/server';
import type { AllotmentSource } from '@/lib/allotment/types';
import { ALL_ALLOTMENT_SOURCES } from '@/lib/allotment/zones';

/**
 * GET /api/admin/allotment
 *
 * Query params:
 *   zone   - optional zone_id filter
 *   day    - YYYY-MM-DD (when set together with `zone`, returns per-slot day view)
 *   from   - ISO timestamp (lower bound on start_at)
 *   to     - ISO timestamp (upper bound on start_at)
 *   source - filter by source
 *
 * If `day` is provided, returns { day_view: ZoneDaySlot[], zones, allotments }
 * Otherwise returns { allotments, zones }.
 */
export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (isAuthError(auth)) return auth;

  const { searchParams } = new URL(request.url);
  const zone = searchParams.get('zone') ?? undefined;
  const day = searchParams.get('day') ?? undefined;
  const from = searchParams.get('from') ?? undefined;
  const to = searchParams.get('to') ?? undefined;
  const sourceParam = searchParams.get('source') ?? undefined;
  const source = sourceParam && (ALL_ALLOTMENT_SOURCES as readonly string[]).includes(sourceParam)
    ? (sourceParam as AllotmentSource)
    : undefined;

  try {
    const [zones, allotments] = await Promise.all([
      getZonesWithTables(),
      listAllotments({ zoneId: zone, fromIso: from, toIso: to, source, limit: 500 }),
    ]);

    let dayView = null;
    if (day && zone) {
      dayView = await getZoneDayAvailability(zone, day);
    }

    return NextResponse.json({ zones, allotments, day_view: dayView });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[admin/allotment GET] error:', err);
    return NextResponse.json({ error: 'Failed to load allotments', detail: message }, { status: 500 });
  }
}

/**
 * POST /api/admin/allotment
 *
 * Body:
 *   {
 *     zone_id:       string,
 *     date:          string (YYYY-MM-DD),
 *     time:          string (HH:MM),
 *     table_code?:   string | null,  // omit for auto-pick
 *     source:        AllotmentSource,
 *     customer_name?: string,
 *     guest_count?:   number,
 *     notes?:         string
 *   }
 *
 * Returns the created allotment id.
 */
export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (isAuthError(auth)) return auth;

  try {
    const body = await request.json();
    const {
      zone_id,
      date,
      time,
      table_code,
      source,
      customer_name,
      guest_count,
      notes,
      deposit_amount,
    } = body ?? {};

    if (!zone_id || !date || !time || !source) {
      return NextResponse.json(
        { error: 'Missing required fields: zone_id, date, time, source' },
        { status: 400 }
      );
    }
    if (!(ALL_ALLOTMENT_SOURCES as readonly string[]).includes(source)) {
      return NextResponse.json({ error: `Invalid source: ${source}` }, { status: 400 });
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return NextResponse.json({ error: 'date must be YYYY-MM-DD' }, { status: 400 });
    }
    if (!/^\d{2}:\d{2}$/.test(time)) {
      return NextResponse.json({ error: 'time must be HH:MM' }, { status: 400 });
    }

    const startAtIso = `${date}T${time}:00+07:00`;  // Asia/Bangkok

    const allotmentId = await createManualBlock({
      zoneId: zone_id,
      tableCode: table_code || null,
      startAtIso,
      source: source as AllotmentSource,
      customerName: customer_name || null,
      guestCount: typeof guest_count === 'number' ? guest_count : null,
      notes: notes || null,
      createdBy: auth.user?.id ?? null,
      depositAmount: typeof deposit_amount === 'number' ? deposit_amount : null,
    });

    return NextResponse.json({ id: allotmentId }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    if (message.includes('TM_ALLOTMENT_FULL')) {
      return NextResponse.json({ error: 'No tables available for this zone at the requested time', code: 'ALLOTMENT_FULL' }, { status: 409 });
    }
    if (message.includes('TM_TABLE_TAKEN')) {
      return NextResponse.json({ error: 'That specific table is already blocked at this time', code: 'TABLE_TAKEN' }, { status: 409 });
    }
    if (message.includes('TM_TABLE_NOT_FOUND')) {
      return NextResponse.json({ error: 'Table not found in this zone', code: 'TABLE_NOT_FOUND' }, { status: 404 });
    }
    if (message.includes('TM_ZONE_NOT_FOUND')) {
      return NextResponse.json({ error: 'Zone not found', code: 'ZONE_NOT_FOUND' }, { status: 404 });
    }
    console.error('[admin/allotment POST] error:', err);
    return NextResponse.json({ error: 'Failed to create block', detail: message }, { status: 500 });
  }
}
