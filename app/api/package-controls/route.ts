import { NextResponse } from 'next/server';
import { fetchPackageControls } from '@/lib/data/package-controls-server';

export const dynamic = 'force-dynamic';

// Public endpoint: the booking/checkout/listing pages read this to know which
// packages are disabled, which dates are blocked, and the current sale prices.
export async function GET() {
  const controls = await fetchPackageControls();
  return NextResponse.json(controls, {
    headers: { 'Cache-Control': 'no-store' },
  });
}
