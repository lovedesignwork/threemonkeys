import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { requireSuperAdmin, isAuthError } from '@/lib/auth/api-auth';
import { pushBookingToOneBooking } from '@/lib/onebooking/sync';

export const maxDuration = 60; // 60 seconds - works on Pro plan, hobby plan has 10s limit

// Hobby plan has 10s limit, each sync to OneBooking takes ~3-5s
// Process only 1 booking per request to guarantee completion
const CONCURRENCY_LIMIT = 1;
const MAX_BOOKINGS_PER_REQUEST = 1;

interface SyncDetail {
  booking_ref: string;
  status: string;
  error?: string;
}

interface BookingAddon {
  quantity: number;
  unit_price: number;
  promo_addons?: { name: string } | null;
}

async function syncBooking(booking: Record<string, unknown>): Promise<SyncDetail> {
  // Handle booking_customers - could be array or object depending on Supabase relation
  const rawCustomer = booking.booking_customers;
  const customer = Array.isArray(rawCustomer) ? rawCustomer[0] as Record<string, unknown> | undefined : rawCustomer as Record<string, unknown> | null;
  
  // Handle booking_transport - could be array or object
  const rawTransport = booking.booking_transport;
  const transport = Array.isArray(rawTransport) ? rawTransport[0] as Record<string, unknown> | undefined : rawTransport as Record<string, unknown> | null;
  
  const packages = booking.packages as Record<string, unknown> | null;
  const rawAddons = booking.booking_addons as Record<string, unknown>[] || [];
  
  // Map to properly typed addons
  const bookingAddons: BookingAddon[] = rawAddons.map(addon => ({
    quantity: Number(addon.quantity) || 0,
    unit_price: Number(addon.unit_price) || 0,
    promo_addons: addon.promo_addons as { name: string } | null,
  }));

  try {
    const syncResult = await pushBookingToOneBooking('booking.created', {
      id: booking.id as string,
      booking_ref: booking.booking_ref as string,
      activity_date: booking.activity_date as string,
      time_slot: booking.time_slot as string,
      guest_count: Number(booking.guest_count) || 0,
      total_amount: Number(booking.total_amount) || 0,
      discount_amount: Number(booking.discount_amount) || 0,
      currency: 'THB',
      status: booking.status as string,
      special_requests: (booking.special_requests as string) || null,
      stripe_payment_intent_id: booking.stripe_payment_intent_id as string,
      created_at: booking.created_at as string,
      packages: packages ? {
        name: packages.name as string,
        price: Number(packages.price) || 0,
      } : null,
      customers: customer ? {
        name: `${customer.first_name} ${customer.last_name}`,
        email: customer.email as string,
        phone: (customer.phone as string) || null,
        country_code: (customer.country_code as string) || null,
      } : null,
      transport_type: (transport?.transport_type as string) || null,
      hotel_name: (transport?.hotel_name as string) || null,
      room_number: (transport?.room_number as string) || null,
      non_players: Number(transport?.non_players) || 0,
      private_passengers: Number(transport?.private_passengers) || 0,
      transport_cost: Number(transport?.transport_cost) || 0,
      booking_addons: bookingAddons,
    });

    if (syncResult.success) {
      return { booking_ref: booking.booking_ref as string, status: 'synced' };
    } else if (syncResult.code === 'DUPLICATE_BOOKING') {
      return { booking_ref: booking.booking_ref as string, status: 'skipped', error: 'Already exists' };
    } else {
      return { booking_ref: booking.booking_ref as string, status: 'failed', error: syncResult.error };
    }
  } catch (error) {
    return { 
      booking_ref: booking.booking_ref as string, 
      status: 'failed', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

async function processInBatches(
  bookings: Record<string, unknown>[],
  batchSize: number
): Promise<SyncDetail[]> {
  const results: SyncDetail[] = [];
  
  for (let i = 0; i < bookings.length; i += batchSize) {
    const batch = bookings.slice(i, i + batchSize);
    const batchResults = await Promise.all(batch.map(syncBooking));
    results.push(...batchResults);
  }
  
  return results;
}

export async function POST(request: NextRequest) {
  const auth = await requireSuperAdmin(request);
  if (isAuthError(auth)) return auth;

  try {
    const { bookingIds, syncAll } = await request.json();

    let bookingsToSync;
    
    if (syncAll) {
      const { data, error } = await supabaseAdmin
        .from('bookings')
        .select(`
          *,
          packages (*),
          booking_customers (*),
          booking_addons (*, promo_addons (*)),
          booking_transport (*)
        `)
        .in('status', ['confirmed', 'completed'])
        .order('created_at', { ascending: false })
        .limit(MAX_BOOKINGS_PER_REQUEST); // Limit per sync to avoid timeout

      if (error) throw error;
      bookingsToSync = data || [];
    } else if (bookingIds && Array.isArray(bookingIds)) {
      const limitedIds = bookingIds.slice(0, MAX_BOOKINGS_PER_REQUEST);
      const { data, error } = await supabaseAdmin
        .from('bookings')
        .select(`
          *,
          packages (*),
          booking_customers (*),
          booking_addons (*, promo_addons (*)),
          booking_transport (*)
        `)
        .in('id', limitedIds);

      if (error) throw error;
      bookingsToSync = data || [];
    } else {
      return NextResponse.json({ error: 'Provide bookingIds array or syncAll: true' }, { status: 400 });
    }

    // Process bookings in parallel batches
    const details = await processInBatches(bookingsToSync, CONCURRENCY_LIMIT);

    const results = {
      total: bookingsToSync.length,
      synced: details.filter(d => d.status === 'synced').length,
      skipped: details.filter(d => d.status === 'skipped').length,
      failed: details.filter(d => d.status === 'failed').length,
      details,
    };

    return NextResponse.json({
      success: true,
      message: `Bulk sync completed: ${results.synced} synced, ${results.skipped} skipped, ${results.failed} failed`,
      results,
    });
  } catch (error) {
    console.error('Bulk sync error:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Internal server error' 
    }, { status: 500 });
  }
}
