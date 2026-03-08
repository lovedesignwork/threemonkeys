import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { requireAdmin, isAuthError } from '@/lib/auth/api-auth';
import { pushBookingToOneBooking } from '@/lib/onebooking/sync';

export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (isAuthError(auth)) return auth;

  try {
    const { bookingId } = await request.json();

    if (!bookingId) {
      return NextResponse.json({ error: 'Booking ID is required' }, { status: 400 });
    }

    // Fetch complete booking data
    const { data: booking, error: fetchError } = await supabaseAdmin
      .from('bookings')
      .select(`
        *,
        packages (*),
        booking_customers (*),
        booking_addons (*, promo_addons (*)),
        booking_transport (*)
      `)
      .eq('id', bookingId)
      .single();

    if (fetchError || !booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    // Handle potential array returns from Supabase relations
    const rawCustomer = booking.booking_customers;
    const customer = Array.isArray(rawCustomer) ? rawCustomer[0] : rawCustomer;
    const rawTransport = booking.booking_transport;
    const transport = Array.isArray(rawTransport) ? rawTransport[0] : rawTransport;

    // Sync to OneBooking
    const syncResult = await pushBookingToOneBooking('booking.created', {
      id: booking.id,
      booking_ref: booking.booking_ref,
      activity_date: booking.activity_date,
      time_slot: booking.time_slot,
      guest_count: Number(booking.guest_count) || 0,
      total_amount: Number(booking.total_amount) || 0,
      discount_amount: Number(booking.discount_amount) || 0,
      currency: 'THB',
      status: booking.status,
      special_requests: booking.special_requests || null,
      stripe_payment_intent_id: booking.stripe_payment_intent_id,
      created_at: booking.created_at,
      packages: booking.packages ? {
        name: booking.packages.name,
        price: Number(booking.packages.price) || 0,
      } : null,
      customers: customer ? {
        name: `${customer.first_name} ${customer.last_name}`,
        email: customer.email,
        phone: customer.phone || null,
        country_code: customer.country_code || null,
      } : null,
      transport_type: transport?.transport_type || null,
      hotel_name: transport?.hotel_name || null,
      room_number: transport?.room_number || null,
      non_players: Number(transport?.non_players) || 0,
      private_passengers: Number(transport?.private_passengers) || 0,
      transport_cost: Number(transport?.transport_cost) || 0,
      booking_addons: booking.booking_addons || [],
    });

    if (syncResult.success) {
      return NextResponse.json({ 
        success: true, 
        message: `Booking ${booking.booking_ref} synced to OneBooking successfully`,
        booking_id: syncResult.booking_id 
      });
    } else {
      return NextResponse.json({ 
        success: false, 
        error: syncResult.error || 'Sync failed',
        code: syncResult.code 
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Error syncing booking to OneBooking:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Internal server error' 
    }, { status: 500 });
  }
}
