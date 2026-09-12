import { NextRequest, NextResponse } from 'next/server';
import type Stripe from 'stripe';
import { stripe, NON_PLAYER_PRICE } from '@/lib/stripe/client';
import { supabaseAdmin } from '@/lib/supabase/server';
import { CheckoutValidationError, parseBookingData } from '@/lib/checkout/validation';
import { createCheckoutQuote } from '@/lib/checkout/quote';
import { createPendingBooking } from '@/lib/checkout/persist';

export async function POST(request: NextRequest) {
  try {
    const body = parseBookingData(await request.json());
    const quote = await createCheckoutQuote(body);
    const lineItem = (name: string, price: number, quantity: number, description?: string): Stripe.Checkout.SessionCreateParams.LineItem => ({
      price_data: { currency: 'thb', product_data: { name, ...(description ? { description } : {}) }, unit_amount: Math.round(price * 100) },
      quantity,
    });
    const description = `${body.guests} guest(s) on ${body.date} at ${body.time}`;
    const lineItems = [lineItem(quote.packageData.name, quote.packagePrice, quote.packageQuantity, description)];
    for (const addon of quote.requestedAddons) lineItems.push(lineItem(addon.name, addon.price, addon.quantity));
    if (body.privateTransfer) lineItems.push(lineItem('Private Transfer', quote.transferCost, 1));
    if (body.nonPlayers) lineItems.push(lineItem('Non-Player Fee', NON_PLAYER_PRICE, body.nonPlayers));
    // A combined discounted line keeps the session amount equal to the quote
    // without creating a separate remote Stripe coupon.
    const payableItems = quote.discountAmount > 0
      ? [lineItem(`${quote.packageData.name} booking (promotion applied)`, quote.finalAmount, 1, description)]
      : lineItems;
    const booking = await createPendingBooking(body, quote);
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const metadata = { booking_id: booking.id, booking_ref: booking.booking_ref, promo_code_id: quote.promoCodeId || '', discount_amount: quote.discountAmount.toString() };
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'], line_items: payableItems, mode: 'payment',
      success_url: `${appUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}&booking_ref=${booking.booking_ref}`,
      cancel_url: `${appUrl}/checkout/cancel?booking_id=${booking.id}`,
      customer_email: body.customer.email, metadata, payment_intent_data: { metadata },
    });
    const { error } = await supabaseAdmin.from('bookings').update({ stripe_checkout_session_id: session.id }).eq('id', booking.id);
    if (error) throw new Error('Failed to save checkout session reference.');
    return NextResponse.json({ sessionId: session.id, sessionUrl: session.url, bookingRef: booking.booking_ref });
  } catch (error) {
    if (error instanceof CheckoutValidationError) return NextResponse.json({ error: error.message }, { status: error.status });
    if (error instanceof SyntaxError) return NextResponse.json({ error: 'Invalid JSON request body.' }, { status: 400 });
    console.error('Checkout session creation error:', error);
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 });
  }
}
