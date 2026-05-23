import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { requireAdmin, isAuthError } from '@/lib/auth/api-auth';
import { checkZoneAvailability, claimTable, releaseTable } from '@/lib/allotment/server';
import { buildBangkokTimestamp, getZoneForPackage } from '@/lib/allotment/zones';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin(request);
  if (isAuthError(auth)) return auth;

  try {
    const { id } = await params;
    
    const { data, error } = await supabaseAdmin
      .from('bookings')
      .select(`
        *,
        packages (*),
        booking_customers (*),
        booking_transport (*),
        booking_addons (*, promo_addons (*)),
        promo_codes (*)
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching booking:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Error in booking detail API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin(request);
  if (isAuthError(auth)) return auth;

  try {
    const { id } = await params;
    const body = await request.json();
    const { status, admin_notes, activity_date, time_slot } = body;

    // Load existing booking so we can detect what's changing.
    const { data: existing, error: loadErr } = await supabaseAdmin
      .from('bookings')
      .select('id, status, activity_date, time_slot, package_id, zone_id, table_code, guest_count, booking_ref, booking_customers (first_name, last_name)')
      .eq('id', id)
      .single();
    if (loadErr || !existing) {
      return NextResponse.json({ error: loadErr?.message ?? 'Booking not found' }, { status: 404 });
    }

    const updateData: Record<string, unknown> = {};
    if (status !== undefined)        updateData.status = status;
    if (admin_notes !== undefined)   updateData.admin_notes = admin_notes;
    if (activity_date !== undefined) updateData.activity_date = activity_date;
    if (time_slot !== undefined)     updateData.time_slot = time_slot;

    // ── Detect date/time change and validate allotment BEFORE writing ──
    const dateChanged = activity_date !== undefined && activity_date !== existing.activity_date;
    const timeChanged = time_slot !== undefined && time_slot !== existing.time_slot;
    const movingSlot  = dateChanged || timeChanged;

    const zone = getZoneForPackage(existing.package_id) ?? (existing.zone_id ? { zoneId: existing.zone_id, zoneName: '', blockMinutes: 180 } : null);
    const newDate = activity_date ?? existing.activity_date;
    const newTime = time_slot     ?? existing.time_slot;

    // Fail loudly if moving to a full slot. Skip if this package doesn't consume allotment.
    if (movingSlot && zone && existing.status === 'confirmed') {
      const newStartIso = buildBangkokTimestamp(newDate, newTime);
      try {
        const avail = await checkZoneAvailability(zone.zoneId, newStartIso);
        // We need to free up the current table before we count availability, otherwise
        // we'd see N-1. But to be safe, allow the move if available_count >= 1 OR
        // the move is within the same overlapping window for our own booking.
        if (avail.available_count < 1) {
          return NextResponse.json({
            error: `Cannot move booking — ${zone.zoneId} is fully booked at ${newDate} ${newTime}. Free up a table first or pick a different time.`,
            code: 'ALLOTMENT_FULL',
          }, { status: 409 });
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        if (!msg.includes('TM_ZONE_NOT_FOUND')) {
          // For zone not found, just skip the check (package doesn't have allotment).
          console.error('[admin/bookings PUT] availability check failed:', err);
        }
      }
    }

    // ── Apply the update ──
    const { error } = await supabaseAdmin
      .from('bookings')
      .update(updateData)
      .eq('id', id);
    if (error) {
      console.error('Error updating booking:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // ── Post-update: handle allotment side effects ──
    const newStatus: string | undefined = status;
    const isReleasingStatus = newStatus === 'cancelled' || newStatus === 'refunded';

    if (isReleasingStatus && existing.status !== newStatus) {
      // Status flipped to cancelled/refunded → release any allotment.
      try {
        const freed = await releaseTable(id);
        if (freed > 0) {
          console.log(`[Allotment] Released ${freed} block(s) for ${existing.booking_ref} due to status=${newStatus}`);
        }
      } catch (err) {
        console.error(`[Allotment] release failed on cancel for ${existing.booking_ref}:`, err);
      }
    } else if (movingSlot && zone && (newStatus ?? existing.status) === 'confirmed') {
      // Confirmed booking moved to a new slot → release old, claim new.
      try {
        await releaseTable(id);
      } catch (err) {
        console.error(`[Allotment] release on move failed for ${existing.booking_ref}:`, err);
      }
      try {
        const cust = Array.isArray(existing.booking_customers) ? existing.booking_customers[0] : existing.booking_customers;
        const fullName = cust ? `${cust.first_name ?? ''} ${cust.last_name ?? ''}`.trim() : null;
        const claim = await claimTable({
          zoneId: zone.zoneId,
          bookingId: id,
          startAtIso: buildBangkokTimestamp(newDate, newTime),
          source: 'website',
          customerName: fullName,
          guestCount: existing.guest_count,
          notes: `Re-claimed by admin (booking moved from ${existing.activity_date} ${existing.time_slot})`,
          createdBy: auth.user?.id ?? null,
        });
        console.log(`[Allotment] Re-claimed ${claim.table_code} for ${existing.booking_ref} at new slot`);
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        // The booking row is already updated. Surface the error so admin can resolve manually.
        return NextResponse.json({
          success: true,
          warning: `Booking time updated, but failed to claim a new table: ${msg}. Please assign manually from the Allotment page.`,
          code: msg.includes('TM_ALLOTMENT_FULL') ? 'ALLOTMENT_FULL' : 'CLAIM_FAILED',
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in booking detail PUT:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
