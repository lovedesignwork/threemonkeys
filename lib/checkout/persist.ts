import { supabaseAdmin } from '@/lib/supabase/server';
import type { BookingData } from './validation';
import type { CheckoutQuote } from './quote';

/** Do not issue a payment when a required part of the booking failed to save. */
export async function createPendingBooking(data: BookingData, quote: CheckoutQuote, origin: Record<string, string | null> = {}) {
  const { data: booking, error } = await supabaseAdmin.from('bookings').insert({
    package_id: data.packageId, activity_date: data.date, time_slot: data.time,
    guest_count: data.guests, status: 'pending', total_amount: quote.finalAmount,
    discount_amount: quote.discountAmount, promo_code_id: quote.promoCodeId,
    currency: 'THB', zone_id: quote.zone?.zoneId ?? null, ...origin,
  }).select('id, booking_ref').single();
  if (error || !booking) throw new Error('Failed to create booking.');
  try {
    const { error: customerError } = await supabaseAdmin.from('booking_customers').insert({
      booking_id: booking.id, first_name: data.customer.firstName, last_name: data.customer.lastName,
      email: data.customer.email, phone: data.customer.phone, country_code: data.customer.countryCode,
      special_requests: data.customer.specialRequests || null,
    });
    if (customerError) throw new Error('Failed to save customer details.');
    const { error: transportError } = await supabaseAdmin.from('booking_transport').insert({
      booking_id: booking.id, transport_type: quote.transportType, hotel_name: data.hotel || null,
      room_number: data.room || null, private_passengers: data.privatePassengers,
      non_players: data.nonPlayers, transport_cost: quote.transportCost,
    });
    if (transportError) throw new Error('Failed to save transport details.');
    if (quote.requestedAddons.length) {
      const { error: addonsError } = await supabaseAdmin.from('booking_addons').insert(quote.requestedAddons.map(addon => ({
        booking_id: booking.id, addon_id: addon.id, quantity: addon.quantity, unit_price: addon.price,
      })));
      if (addonsError) throw new Error('Failed to save add-on details.');
    }
    return booking;
  } catch (error) {
    await supabaseAdmin.from('bookings').update({ status: 'cancelled' }).eq('id', booking.id);
    throw error;
  }
}
