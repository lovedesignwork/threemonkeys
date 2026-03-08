import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-01-28.clover',
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ ref: string }> }
) {
  try {
    const { ref } = await params;
    const bookingRef = ref;
    
    const { searchParams } = new URL(request.url);
    const paymentIntentId = searchParams.get('payment_intent');

    if (!paymentIntentId) {
      return NextResponse.json(
        { error: 'Unauthorized - payment verification required' },
        { status: 401 }
      );
    }

    const { data: booking, error } = await supabaseAdmin
      .from('bookings')
      .select(`
        *,
        packages (*),
        booking_customers (*),
        booking_addons (*, promo_addons (*)),
        booking_transport (*)
      `)
      .eq('booking_ref', bookingRef)
      .single();

    if (error || !booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    // Verify the payment_intent matches the booking's stripe_payment_intent_id
    if (booking.stripe_payment_intent_id !== paymentIntentId) {
      // As a fallback, verify with Stripe that this payment intent exists and matches
      try {
        const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
        
        // Check if the payment intent's metadata matches this booking
        if (paymentIntent.metadata?.booking_ref !== bookingRef) {
          return NextResponse.json(
            { error: 'Unauthorized - payment does not match booking' },
            { status: 401 }
          );
        }
      } catch {
        return NextResponse.json(
          { error: 'Unauthorized - invalid payment' },
          { status: 401 }
        );
      }
    }

    return NextResponse.json(booking);
  } catch (error) {
    console.error('Error fetching booking:', error);
    return NextResponse.json(
      { error: 'Failed to fetch booking' },
      { status: 500 }
    );
  }
}
