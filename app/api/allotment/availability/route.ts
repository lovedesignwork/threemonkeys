import { NextRequest, NextResponse } from 'next/server';
import { checkZoneAvailability } from '@/lib/allotment/server';

/**
 * Public availability check used by the customer booking page.
 *
 * GET /api/allotment/availability?zone=monkey-dome&start=2026-06-01T19:00:00%2B07:00
 *
 * Returns:
 *   { is_available: boolean, available_count: number, total_count: number }
 *
 * (We don't expose available_count to the customer per spec decision B, but we
 *  return it here for use by admin/internal callers. The booking page only
 *  reads is_available.)
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const zoneId = searchParams.get('zone');
  const startAt = searchParams.get('start');

  if (!zoneId) {
    return NextResponse.json({ error: 'Missing required query param: zone' }, { status: 400 });
  }
  if (!startAt) {
    return NextResponse.json({ error: 'Missing required query param: start' }, { status: 400 });
  }

  try {
    const availability = await checkZoneAvailability(zoneId, startAt);
    return NextResponse.json(availability, {
      headers: {
        'Cache-Control': 'no-store',
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    if (message.includes('TM_ZONE_NOT_FOUND')) {
      return NextResponse.json({ error: 'Zone not found', detail: message }, { status: 404 });
    }
    console.error('[allotment/availability] error:', err);
    return NextResponse.json({ error: 'Failed to check availability', detail: message }, { status: 500 });
  }
}
