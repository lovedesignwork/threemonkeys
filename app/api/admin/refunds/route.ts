import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import Stripe from 'stripe';
import { requireAdmin, isAuthError } from '@/lib/auth/api-auth';

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2026-01-28.clover',
  });
}

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (isAuthError(auth)) return auth;

  try {
    const { searchParams } = new URL(request.url);
    const bookingId = searchParams.get('bookingId');

    if (!bookingId) {
      return NextResponse.json({ error: 'Booking ID is required' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('refund_history')
      .select('*')
      .eq('booking_id', bookingId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching refunds:', error);
      return NextResponse.json({ error: 'Failed to fetch refunds' }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Refunds fetch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (isAuthError(auth)) return auth;

  try {
    const body = await request.json();
    const { bookingId, amount, reason, adminUserId } = body;

    if (!bookingId || !amount) {
      return NextResponse.json({ error: 'Booking ID and amount are required' }, { status: 400 });
    }

    const { data: booking, error: bookingError } = await supabaseAdmin
      .from('bookings')
      .select('*, refund_history(*)')
      .eq('id', bookingId)
      .single();

    if (bookingError || !booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    if (!booking.stripe_payment_intent_id) {
      return NextResponse.json({ error: 'No payment found for this booking' }, { status: 400 });
    }

    const existingRefunds = booking.refund_history || [];
    const totalRefunded = existingRefunds.reduce((sum: number, r: { amount: number }) => sum + r.amount, 0);
    const maxRefundable = booking.total_amount - totalRefunded;

    if (amount > maxRefundable) {
      return NextResponse.json({ 
        error: `Maximum refundable amount is ฿${maxRefundable.toLocaleString()}` 
      }, { status: 400 });
    }

    let stripeRefund: Stripe.Refund;
    try {
      stripeRefund = await getStripe().refunds.create({
        payment_intent: booking.stripe_payment_intent_id,
        amount: Math.round(amount * 100),
        reason: reason === 'fraudulent' ? 'fraudulent' : 
                reason === 'duplicate' ? 'duplicate' : 'requested_by_customer',
        metadata: {
          booking_id: bookingId,
          booking_ref: booking.booking_ref,
          reason: reason,
        },
      });
    } catch (stripeError) {
      console.error('Stripe refund error:', stripeError);
      return NextResponse.json({ error: 'Failed to process refund with Stripe' }, { status: 500 });
    }

    const { error: refundHistoryError } = await supabaseAdmin
      .from('refund_history')
      .insert({
        booking_id: bookingId,
        stripe_refund_id: stripeRefund.id,
        amount: amount,
        reason: reason,
        refunded_by: adminUserId || null,
      });

    if (refundHistoryError) {
      console.error('Error saving refund history:', refundHistoryError);
    }

    const newTotalRefunded = totalRefunded + amount;
    const isFullRefund = newTotalRefunded >= booking.total_amount;

    await supabaseAdmin
      .from('bookings')
      .update({ 
        status: isFullRefund ? 'refunded' : 'partially_refunded' 
      })
      .eq('id', bookingId);

    return NextResponse.json({
      success: true,
      refund: {
        id: stripeRefund.id,
        amount: amount,
        status: stripeRefund.status,
      },
      bookingStatus: isFullRefund ? 'refunded' : 'partially_refunded',
      totalRefunded: newTotalRefunded,
    });
  } catch (error) {
    console.error('Refund processing error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
