import { z } from 'zod';
import { CheckoutValidationError } from './validation';

const promoSchema = z.object({
  id: z.string(), code: z.string(), description: z.string().nullable().optional(),
  is_active: z.literal(true), discount_type: z.enum(['percentage', 'fixed']),
  discount_value: z.coerce.number().finite().positive(),
  min_order_amount: z.coerce.number().finite().nonnegative().nullable().optional(),
  max_uses: z.number().int().nonnegative().nullable().optional(),
  current_uses: z.number().int().nonnegative().nullable().optional(),
  valid_from: z.string().nullable().optional(), valid_until: z.string().nullable().optional(),
  stripe_coupon_id: z.string().nullable().optional(),
});

/** The preview and payment routes must apply exactly the same promo rules. */
export function calculatePromoDiscount(raw: unknown, orderTotal: number, now = new Date()) {
  const parsed = promoSchema.safeParse(raw);
  if (!parsed.success || !Number.isFinite(orderTotal) || orderTotal <= 0) throw new CheckoutValidationError('Invalid promo code or order total.');
  const promo = parsed.data;
  if (promo.discount_type === 'percentage' && promo.discount_value > 100) throw new CheckoutValidationError('Invalid promo code.');
  if (promo.valid_from) {
    const from = new Date(promo.valid_from).getTime();
    if (!Number.isFinite(from) || from > now.getTime()) throw new CheckoutValidationError('This promo code is not yet active.');
  }
  if (promo.valid_until) {
    const until = new Date(promo.valid_until).getTime();
    if (!Number.isFinite(until) || until < now.getTime()) throw new CheckoutValidationError('This promo code has expired.');
  }
  if (promo.max_uses != null && (promo.current_uses ?? 0) >= promo.max_uses) throw new CheckoutValidationError('This promo code has reached its usage limit.');
  if (orderTotal < (promo.min_order_amount ?? 0)) throw new CheckoutValidationError(`Minimum order of ฿${promo.min_order_amount?.toLocaleString()} required.`);
  // Preserve the advertised whole-baht rounding for percentage promotions.
  const discount = promo.discount_type === 'percentage' ? Math.round(orderTotal * promo.discount_value / 100) : Math.min(promo.discount_value, orderTotal);
  const discountAmount = Math.min(orderTotal, Math.round(discount * 100) / 100);
  return { promo, discountAmount };
}
