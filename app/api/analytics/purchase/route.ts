import { NextRequest, NextResponse } from 'next/server';
import { createHash } from 'node:crypto';
import { supabaseAdmin } from '@/lib/supabase/server';
import { stripe } from '@/lib/stripe/client';
import { getPackageById } from '@/lib/data/packages';
import { isVerifiedPurchase } from '@/lib/analytics';

const headers = { 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex, nofollow' };

export async function POST(request: NextRequest) {
  // The payment identifier is an existing confirmation capability, never sent to GA.
  // This endpoint only returns a sanitized receipt, not the booking/customer record.
  try {
    if (request.headers.get('origin') !== new URL(request.url).origin) {
      return NextResponse.json({ purchase: null }, { status: 403, headers });
    }
    const { bookingRef, paymentIntent } = await request.json();
    if (typeof bookingRef !== 'string' || !/^3M-[A-Z0-9-]{1,40}$/i.test(bookingRef)
      || typeof paymentIntent !== 'string' || !/^pi_[A-Za-z0-9]{10,100}$/.test(paymentIntent)) {
      return NextResponse.json({ purchase: null }, { status: 400, headers });
    }
    const { data: booking } = await supabaseAdmin.from('bookings')
      .select('id,status,total_amount,currency,stripe_payment_intent_id,package_id')
      .eq('booking_ref', bookingRef).eq('stripe_payment_intent_id', paymentIntent).single();
    if (!booking) return NextResponse.json({ purchase: null }, { status: 404, headers });
    const payment = await stripe.paymentIntents.retrieve(paymentIntent);
    if (!isVerifiedPurchase({
      bookingStatus: booking.status, bookingAmount: Number(booking.total_amount), bookingCurrency: booking.currency,
      bookingPaymentId: booking.stripe_payment_intent_id, bookingId: booking.id,
      paymentStatus: payment.status, paymentAmountReceived: payment.amount_received, paymentCurrency: payment.currency,
      paymentId: payment.id, paymentBookingId: payment.metadata.booking_id, consent: payment.metadata.analytics_consent,
    })) return NextResponse.json({ purchase: null }, { headers });
    const packageInfo = getPackageById(booking.package_id);
    const value = payment.amount_received / 100;
    return NextResponse.json({ purchase: {
      transaction_id: `tm_${createHash('sha256').update(payment.id).digest('hex').slice(0,32)}`,
      currency: payment.currency.toUpperCase(), value,
      // The charged amount is a reservation/deposit total, including paid extras
      // and discounts, not an assumed restaurant food bill or guest unit price.
      items: [{ item_id: booking.package_id, item_name: `${packageInfo?.name || 'Three Monkeys'} reservation`, price: value, quantity: 1 }],
    } }, { headers });
  } catch {
    // Reporting must never interfere with a successful customer checkout.
    return NextResponse.json({ purchase: null }, { status: 503, headers });
  }
}
