import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, isAuthError } from '@/lib/auth/api-auth';
import { deleteAllotment, moveAllotment, updateAllotmentMeta, getAllotmentById, getZonesWithTables } from '@/lib/allotment/server';
import type { AllotmentSource } from '@/lib/allotment/types';
import { ALL_ALLOTMENT_SOURCES } from '@/lib/allotment/zones';
import { pushManualAllotmentToOneBooking } from '@/lib/onebooking/sync';
import { waitUntil } from '@vercel/functions';

/**
 * DELETE /api/admin/allotment/[id]
 *
 * Removes a manual block (or any allotment row). For cancelling a paid booking,
 * prefer cancelling via /admin/bookings/[id] PUT which will release the
 * allotment automatically.
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin(request);
  if (isAuthError(auth)) return auth;

  try {
    const { id } = await params;
    
    // Fetch allotment details before deletion for OneBooking sync
    const allotment = await getAllotmentById(id);
    
    const deleted = await deleteAllotment(id);
    if (!deleted) {
      return NextResponse.json({ error: 'Allotment not found' }, { status: 404 });
    }
    
    // Sync cancellation to OneBooking in the background
    if (allotment) {
      const zones = await getZonesWithTables();
      const zone = zones.find(z => z.id === allotment.zone_id);
      waitUntil(
        pushManualAllotmentToOneBooking('booking.cancelled', {
          id: allotment.id,
          booking_ref: allotment.booking_ref,
          zone_id: allotment.zone_id,
          zone_name: zone?.name || null,
          table_code: allotment.table_code,
          start_at: allotment.start_at,
          source: allotment.source,
          customer_name: allotment.customer_name,
          customer_phone: allotment.customer_phone,
          customer_email: allotment.customer_email,
          guest_count: allotment.guest_count,
          adult_count: allotment.adult_count,
          child_count: allotment.child_count,
          notes: allotment.notes,
          deposit_amount: allotment.deposit_amount,
          created_at: allotment.created_at,
        }).then(result => {
          if (result.success) {
            console.log(`[admin/allotment DELETE] Synced cancellation to OneBooking: ${id}`);
          } else {
            console.warn(`[admin/allotment DELETE] OneBooking sync failed: ${result.error}`);
          }
        }).catch(err => {
          console.error(`[admin/allotment DELETE] OneBooking sync error:`, err);
        })
      );
    }
    
    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[admin/allotment DELETE] error:', err);
    return NextResponse.json({ error: 'Failed to delete allotment', detail: message }, { status: 500 });
  }
}

/**
 * PATCH /api/admin/allotment/[id]
 *
 * Two modes (auto-detected from body):
 *
 * 1. Edit metadata only — body has any of:
 *      { source?, customer_name?, guest_count?, notes? }
 *
 * 2. Move (and optionally edit metadata) — body must include:
 *      { zone_id, date, time, table_code? }
 *    Optionally combined with the edit-mode fields above (applied after move).
 *
 * Returns: { success, allotment? (when moved), warning? }
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin(request);
  if (isAuthError(auth)) return auth;

  try {
    const { id } = await params;
    const body = await request.json();

    const wantsMove = body.zone_id && body.date && body.time;

    let movedTableCode: string | null = null;

    // 1) Move if requested
    if (wantsMove) {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(body.date)) {
        return NextResponse.json({ error: 'date must be YYYY-MM-DD' }, { status: 400 });
      }
      if (!/^\d{2}:\d{2}$/.test(body.time)) {
        return NextResponse.json({ error: 'time must be HH:MM' }, { status: 400 });
      }
      const startAtIso = `${body.date}T${body.time}:00+07:00`;

      try {
        const result = await moveAllotment({
          allotmentId: id,
          newZoneId: body.zone_id,
          newStartAtIso: startAtIso,
          newTableCode: body.table_code || null,
        });
        movedTableCode = result.table_code;
        // After move, the row id changed — patch should target the NEW id
        // for any metadata updates.
        const hasMetaChanges = body.source || body.customer_name !== undefined || body.guest_count !== undefined || 
          body.adult_count !== undefined || body.child_count !== undefined ||
          body.customer_phone !== undefined || body.customer_email !== undefined ||
          body.notes !== undefined || body.deposit_amount !== undefined;
        
        if (hasMetaChanges) {
          const src = body.source;
          if (src && !(ALL_ALLOTMENT_SOURCES as readonly string[]).includes(src)) {
            return NextResponse.json({ error: `Invalid source: ${src}` }, { status: 400 });
          }
          // Calculate total guest count from adult + child if provided
          let guestCount = body.guest_count;
          if (body.adult_count !== undefined || body.child_count !== undefined) {
            guestCount = (body.adult_count || 0) + (body.child_count || 0);
          }
          await updateAllotmentMeta(result.allotment_id, {
            source: src as AllotmentSource | undefined,
            customer_name: body.customer_name,
            guest_count: guestCount,
            adult_count: body.adult_count,
            child_count: body.child_count,
            customer_phone: body.customer_phone,
            customer_email: body.customer_email,
            notes: body.notes,
            deposit_amount: body.deposit_amount,
          });
        }
        return NextResponse.json({
          success: true,
          moved: true,
          allotment_id: result.allotment_id,
          table_code: movedTableCode,
        });
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        if (message.includes('TM_ALLOTMENT_NOT_FOUND')) {
          return NextResponse.json({ error: 'Block not found (may have been deleted already)', code: 'NOT_FOUND' }, { status: 404 });
        }
        if (message.includes('TM_ALLOTMENT_FULL')) {
          return NextResponse.json({ error: 'No tables available at that new time', code: 'ALLOTMENT_FULL' }, { status: 409 });
        }
        if (message.includes('TM_TABLE_TAKEN')) {
          return NextResponse.json({ error: 'That specific table is taken at the new time', code: 'TABLE_TAKEN' }, { status: 409 });
        }
        if (message.includes('TM_TABLE_NOT_FOUND')) {
          return NextResponse.json({ error: 'Table not found in this zone', code: 'TABLE_NOT_FOUND' }, { status: 404 });
        }
        if (message.includes('TM_ZONE_NOT_FOUND')) {
          return NextResponse.json({ error: 'Zone not found', code: 'ZONE_NOT_FOUND' }, { status: 404 });
        }
        console.error('[admin/allotment PATCH move] error:', err);
        return NextResponse.json({ error: 'Failed to move block', detail: message }, { status: 500 });
      }
    }

    // 2) Edit metadata only
    if (body.source && !(ALL_ALLOTMENT_SOURCES as readonly string[]).includes(body.source)) {
      return NextResponse.json({ error: `Invalid source: ${body.source}` }, { status: 400 });
    }
    // Calculate total guest count from adult + child if provided
    let guestCount = body.guest_count;
    if (body.adult_count !== undefined || body.child_count !== undefined) {
      guestCount = (body.adult_count || 0) + (body.child_count || 0);
    }
    const updated = await updateAllotmentMeta(id, {
      source: body.source,
      customer_name: body.customer_name,
      guest_count: guestCount,
      adult_count: body.adult_count,
      child_count: body.child_count,
      customer_phone: body.customer_phone,
      customer_email: body.customer_email,
      notes: body.notes,
      deposit_amount: body.deposit_amount,
    });
    if (!updated) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }

    // Sync update to OneBooking in the background
    const allotment = await getAllotmentById(id);
    if (allotment) {
      const zones = await getZonesWithTables();
      const zone = zones.find(z => z.id === allotment.zone_id);
      waitUntil(
        pushManualAllotmentToOneBooking('booking.updated', {
          id: allotment.id,
          booking_ref: allotment.booking_ref,
          zone_id: allotment.zone_id,
          zone_name: zone?.name || null,
          table_code: allotment.table_code,
          start_at: allotment.start_at,
          source: allotment.source,
          customer_name: allotment.customer_name,
          customer_phone: allotment.customer_phone,
          customer_email: allotment.customer_email,
          guest_count: allotment.guest_count,
          adult_count: allotment.adult_count,
          child_count: allotment.child_count,
          notes: allotment.notes,
          deposit_amount: allotment.deposit_amount,
          created_at: allotment.created_at,
        }).then(result => {
          if (result.success) {
            console.log(`[admin/allotment PATCH] Synced to OneBooking: ${id}`);
          } else {
            console.warn(`[admin/allotment PATCH] OneBooking sync failed: ${result.error}`);
          }
        }).catch(err => {
          console.error(`[admin/allotment PATCH] OneBooking sync error:`, err);
        })
      );
    }

    return NextResponse.json({ success: true, allotment: updated });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[admin/allotment PATCH] error:', err);
    return NextResponse.json({ error: 'Failed to update block', detail: message }, { status: 500 });
  }
}
