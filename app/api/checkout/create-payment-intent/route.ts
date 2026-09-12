import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe/client';
import { supabaseAdmin } from '@/lib/supabase/server';
import { getClientIP, getGeoFromIP } from '@/lib/geo/ip-lookup';
import { CheckoutValidationError, parseBookingData } from '@/lib/checkout/validation';
import { createCheckoutQuote } from '@/lib/checkout/quote';
import { createPendingBooking } from '@/lib/checkout/persist';

export async function POST(request: NextRequest) {
  try {
    const body = parseBookingData(await request.json());
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY === 'your_service_role_key_here') {
      return NextResponse.json({ error: 'Server configuration error. Please contact support.' }, { status: 500 });
    }
    const quote = await createCheckoutQuote(body);
    const clientIp = getClientIP(request);
    const geo = await getGeoFromIP(clientIp);
    const booking = await createPendingBooking(body, quote, {
      booking_origin_ip: geo?.ip ?? clientIp,
      booking_origin_country_code: geo?.country_code ?? null,
      booking_origin_country_name: geo?.country_name ?? null,
    });

    const paymentIntent = await stripe.paymentIntents.create({
      amount: quote.amountSatang,
      currency: 'thb',
      payment_method_types: ['card'],
      description: `${quote.packageData.name} - ${body.guests} guest(s) on ${body.date} at ${body.time}`,
      metadata: {
        booking_id: booking.id, booking_ref: booking.booking_ref,
        package_name: quote.packageData.name, customer_email: body.customer.email,
        discount_amount: quote.discountAmount.toString(), promo_code_id: quote.promoCodeId || '',
        zone_id: quote.zone?.zoneId ?? '',
      },
      receipt_email: body.customer.email,
      statement_descriptor_suffix: 'ONEBOOKING',
    });
    const { error } = await supabaseAdmin.from('bookings').update({ stripe_payment_intent_id: paymentIntent.id }).eq('id', booking.id);
    if (error) throw new Error('Failed to save payment reference.');
    return NextResponse.json({
      clientSecret: paymentIntent.client_secret, bookingId: booking.id,
      bookingRef: booking.booking_ref, amount: quote.finalAmount,
    });
  } catch (error) {
    if (error instanceof CheckoutValidationError) return NextResponse.json({ error: error.message }, { status: error.status });
    if (error instanceof SyntaxError) return NextResponse.json({ error: 'Invalid JSON request body.' }, { status: 400 });
    console.error('Payment intent creation error:', error);
    return NextResponse.json({ error: 'Failed to create payment intent' }, { status: 500 });
  }
}
