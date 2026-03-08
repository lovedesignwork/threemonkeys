import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code, orderTotal } = body;

    if (!code) {
      return NextResponse.json({ error: 'Promo code is required' }, { status: 400 });
    }

    const { data: promoCode, error } = await supabaseAdmin
      .from('promo_codes')
      .select('*')
      .eq('code', code.toUpperCase())
      .eq('is_active', true)
      .single();

    if (error || !promoCode) {
      return NextResponse.json({ valid: false, error: 'Invalid promo code' }, { status: 200 });
    }

    const now = new Date();
    if (promoCode.valid_from && new Date(promoCode.valid_from) > now) {
      return NextResponse.json({ valid: false, error: 'This promo code is not yet active' }, { status: 200 });
    }

    if (promoCode.valid_until && new Date(promoCode.valid_until) < now) {
      return NextResponse.json({ valid: false, error: 'This promo code has expired' }, { status: 200 });
    }

    if (promoCode.max_uses && promoCode.current_uses >= promoCode.max_uses) {
      return NextResponse.json({ valid: false, error: 'This promo code has reached its usage limit' }, { status: 200 });
    }

    if (promoCode.min_order_amount && orderTotal < promoCode.min_order_amount) {
      return NextResponse.json({ 
        valid: false, 
        error: `Minimum order of ฿${promoCode.min_order_amount.toLocaleString()} required` 
      }, { status: 200 });
    }

    let discountAmount = 0;
    if (promoCode.discount_type === 'percentage') {
      discountAmount = Math.round(orderTotal * (promoCode.discount_value / 100));
    } else {
      discountAmount = Math.min(promoCode.discount_value, orderTotal);
    }

    return NextResponse.json({
      valid: true,
      promoCode: {
        id: promoCode.id,
        code: promoCode.code,
        description: promoCode.description,
        discount_type: promoCode.discount_type,
        discount_value: promoCode.discount_value,
        stripe_coupon_id: promoCode.stripe_coupon_id,
      },
      discountAmount,
    });
  } catch (error) {
    console.error('Error validating promo code:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
