import { supabaseAdmin } from '@/lib/supabase/server';
import { getPackageById } from '@/lib/data/packages';
import { getAddonById, isFixedPricePackage } from '@/lib/data/addons';
import { fetchPackageControls } from '@/lib/data/package-controls-server';
import { getEffectivePrice, isPackageDisabled, isPackageDateBlocked } from '@/lib/data/package-controls';
import { checkZoneAvailability } from '@/lib/allotment/server';
import { buildBangkokTimestamp, getZoneForPackage } from '@/lib/allotment/zones';
import { NON_PLAYER_PRICE, PRIVATE_TRANSFER_PRICE } from '@/lib/stripe/client';
import { CheckoutValidationError, type BookingData } from './validation';
import { calculatePromoDiscount } from './promo';

/** All reads and validation complete before either route creates a booking. */
export async function createCheckoutQuote(data: BookingData) {
  const packageData = getPackageById(data.packageId)!;
  const controls = await fetchPackageControls();
  if (isPackageDisabled(data.packageId, controls)) throw new CheckoutValidationError('This package is currently unavailable for booking.', 409);
  if (isPackageDateBlocked(data.packageId, data.date, controls)) throw new CheckoutValidationError('This package is not available on the selected date. Please choose another date.', 409);
  const packagePrice = getEffectivePrice(data.packageId, packageData.price, controls);
  const requestedAddons = Object.entries(data.promoAddons).filter(([, quantity]) => quantity > 0).map(([id, quantity]) => ({ ...getAddonById(id)!, quantity }));
  if (requestedAddons.length) {
    const { data: setting, error } = await supabaseAdmin.from('site_settings').select('value').eq('key', 'disabled_addons').maybeSingle();
    if (error && error.code !== 'PGRST116') throw new Error('Unable to verify add-on availability.');
    const disabled: unknown[] = Array.isArray(setting?.value) ? setting.value : [];
    if (requestedAddons.some(addon => disabled.includes(addon.id))) throw new CheckoutValidationError('An add-on is currently unavailable. Please review your selection.', 409);
  }
  const packageQuantity = isFixedPricePackage(data.packageId) ? 1 : data.guests;
  const transferCost = data.privateTransfer ? PRIVATE_TRANSFER_PRICE : 0;
  const transportCost = transferCost + data.nonPlayers * NON_PLAYER_PRICE;
  const transportType = data.privateTransfer || packageData.includesTransfer ? 'private' : data.pickup ? 'hotel_pickup' : 'self_arrange';
  const totalAmount = packagePrice * packageQuantity + requestedAddons.reduce((sum, addon) => sum + addon.price * addon.quantity, 0) + transportCost;
  let discountAmount = 0;
  let promoCodeId: string | null = null;
  if (data.promoCodeId) {
    const { data: promoCode, error } = await supabaseAdmin.from('promo_codes').select('*').eq('id', data.promoCodeId).single();
    if (error && error.code !== 'PGRST116') throw new Error('Unable to verify promo code.');
    if (!promoCode) throw new CheckoutValidationError('Invalid promo code.');
    const result = calculatePromoDiscount(promoCode, totalAmount);
    discountAmount = result.discountAmount;
    promoCodeId = result.promo.id;
  }
  // Client discountAmount is never read. Persist and charge the same total.
  const amountSatang = Math.round((totalAmount - discountAmount) * 100);
  if (!Number.isSafeInteger(amountSatang) || amountSatang <= 0 || amountSatang > 99999999) throw new CheckoutValidationError('This total cannot be paid online. Please contact the restaurant.');
  const zone = getZoneForPackage(data.packageId);
  if (zone) {
    const availability = await checkZoneAvailability(zone.zoneId, buildBangkokTimestamp(data.date, data.time));
    if (!availability.is_available) throw new CheckoutValidationError('This time slot is fully booked. Please choose another time.', 409);
  }
  return { packageData, packagePrice, packageQuantity, requestedAddons, transportType, transferCost, transportCost, totalAmount, discountAmount, promoCodeId, amountSatang, finalAmount: amountSatang / 100, zone };
}

export type CheckoutQuote = Awaited<ReturnType<typeof createCheckoutQuote>>;
