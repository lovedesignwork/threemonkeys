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
    const { data, error } = await supabaseAdmin
      .from('promo_codes')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching promo codes:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Error in promo codes GET:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (isAuthError(auth)) return auth;

  try {
    const body = await request.json();
    const {
      code,
      description,
      discount_type,
      discount_value,
      min_order_amount,
      max_uses,
      valid_from,
      valid_until,
    } = body;

    if (!code || !discount_type || !discount_value) {
      return NextResponse.json({ error: 'Code, discount type, and value are required' }, { status: 400 });
    }

    let stripeCouponId: string | null = null;

    try {
      const couponParams: Stripe.CouponCreateParams = {
        name: code,
        duration: 'once',
      };

      if (discount_type === 'percentage') {
        couponParams.percent_off = discount_value;
      } else {
        couponParams.amount_off = Math.round(discount_value * 100);
        couponParams.currency = 'thb';
      }

      const stripeCoupon = await getStripe().coupons.create(couponParams);
      stripeCouponId = stripeCoupon.id;
    } catch (stripeError) {
      console.error('Stripe coupon creation error:', stripeError);
    }

    const { data, error } = await supabaseAdmin
      .from('promo_codes')
      .insert({
        code: code.toUpperCase(),
        description,
        discount_type,
        discount_value,
        min_order_amount: min_order_amount || 0,
        max_uses: max_uses || null,
        valid_from: valid_from || null,
        valid_until: valid_until || null,
        stripe_coupon_id: stripeCouponId,
        is_active: true,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating promo code:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Error in promo codes POST:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (isAuthError(auth)) return auth;

  try {
    const body = await request.json();
    const {
      id,
      code,
      description,
      discount_type,
      discount_value,
      min_order_amount,
      max_uses,
      valid_from,
      valid_until,
      is_active,
    } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from('promo_codes')
      .update({
        code: code?.toUpperCase(),
        description,
        discount_type,
        discount_value,
        min_order_amount,
        max_uses,
        valid_from,
        valid_until,
        is_active,
      })
      .eq('id', id);

    if (error) {
      console.error('Error updating promo code:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in promo codes PUT:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (isAuthError(auth)) return auth;

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    const { data: promoCode } = await supabaseAdmin
      .from('promo_codes')
      .select('stripe_coupon_id')
      .eq('id', id)
      .single();

    if (promoCode?.stripe_coupon_id) {
      try {
        await getStripe().coupons.del(promoCode.stripe_coupon_id);
      } catch (stripeError) {
        console.error('Stripe coupon deletion error:', stripeError);
      }
    }

    const { error } = await supabaseAdmin
      .from('promo_codes')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting promo code:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in promo codes DELETE:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
