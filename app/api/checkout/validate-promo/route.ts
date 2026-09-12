import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { supabaseAdmin } from '@/lib/supabase/server';
import { calculatePromoDiscount } from '@/lib/checkout/promo';
import { CheckoutValidationError } from '@/lib/checkout/validation';

const previewSchema = z.object({ code: z.string().trim().min(1).max(100), orderTotal: z.number().finite().positive().max(999999.99) });

export async function POST(request: NextRequest) {
  try {
    const parsed = previewSchema.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ valid: false, error: 'A promo code and valid order total are required.' }, { status: 400 });
    const { code, orderTotal } = parsed.data;
    const { data: promoCode, error } = await supabaseAdmin.from('promo_codes').select('*').eq('code', code.toUpperCase()).eq('is_active', true).single();
    if (error && error.code !== 'PGRST116') throw new Error('Unable to verify promo code.');
    if (!promoCode) return NextResponse.json({ valid: false, error: 'Invalid promo code' });
    // Preview only: payment creation revalidates its catalog-derived subtotal.
    const { promo, discountAmount } = calculatePromoDiscount(promoCode, orderTotal);
    return NextResponse.json({
      valid: true, discountAmount,
      promoCode: { id: promo.id, code: promo.code, description: promo.description, discount_type: promo.discount_type, discount_value: promo.discount_value, stripe_coupon_id: promo.stripe_coupon_id },
    });
  } catch (error) {
    if (error instanceof CheckoutValidationError) return NextResponse.json({ valid: false, error: error.message });
    if (error instanceof SyntaxError) return NextResponse.json({ valid: false, error: 'Invalid JSON request body.' }, { status: 400 });
    console.error('Error validating promo code:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
