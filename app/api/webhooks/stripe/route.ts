import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe/client';
import { supabaseAdmin } from '@/lib/supabase/server';
import Stripe from 'stripe';
import { sendBookingConfirmationEmail } from '@/lib/email/send-booking-confirmation';
import { sendBookingNotificationEmail } from '@/lib/email/send-booking-notification';
import { pushBookingToOneBooking } from '@/lib/onebooking/sync';
import { waitUntil } from '@vercel/functions';
import { claimTable, releaseTable } from '@/lib/allotment/server';
import { buildBangkokTimestamp, getZoneForPackage } from '@/lib/allotment/zones';
import { getCountryName } from '@/lib/geo/ip-lookup';

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      const bookingId = session.metadata?.booking_id;

      if (bookingId) {
        await supabaseAdmin
          .from('bookings')
          .update({
            status: 'confirmed',
            stripe_payment_intent_id: session.payment_intent as string,
          })
          .eq('id', bookingId);

        const { data: booking } = await supabaseAdmin
          .from('bookings')
          .select(`
            *,
            booking_customers (*),
            packages (*)
          `)
          .eq('id', bookingId)
          .single();

        if (booking) {
          await supabaseAdmin.rpc('increment_slot_bookings', {
            p_date: booking.activity_date,
            p_time: booking.time_slot,
            p_guests: booking.guest_count,
          });

          console.log(`Booking ${booking.booking_ref} confirmed!`);
        }
      }
      break;
    }

    case 'payment_intent.succeeded': {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      const bookingId = paymentIntent.metadata?.booking_id;

      if (bookingId) {
        // Retrieve card country (payment origin) from the payment method.
        // Non-blocking — if it fails we still confirm the booking.
        let paymentOriginCountryCode: string | null = null;
        let paymentOriginCountryName: string | null = null;
        try {
          if (paymentIntent.payment_method) {
            const pm = await stripe.paymentMethods.retrieve(
              paymentIntent.payment_method as string
            );
            if (pm.card?.country) {
              paymentOriginCountryCode = pm.card.country;
              paymentOriginCountryName = getCountryName(pm.card.country);
              console.log('[Payment Origin] Card country:', paymentOriginCountryCode, paymentOriginCountryName);
            }
          }
        } catch (pmErr) {
          console.error('[Payment Origin] Failed to retrieve payment method:', pmErr);
        }

        const updateData: Record<string, unknown> = {
          status: 'confirmed',
          stripe_payment_intent_id: paymentIntent.id,
        };
        if (paymentOriginCountryCode) {
          updateData.payment_origin_country_code = paymentOriginCountryCode;
          updateData.payment_origin_country_name = paymentOriginCountryName;
        }

        await supabaseAdmin
          .from('bookings')
          .update(updateData)
          .eq('id', bookingId);

        // Fetch complete booking data for email
        const { data: booking } = await supabaseAdmin
          .from('bookings')
          .select(`
            *,
            packages (*),
            booking_customers (*),
            booking_addons (*, promo_addons (*)),
            booking_transport (*)
          `)
          .eq('id', bookingId)
          .single();

        // ── Allotment: atomically claim a table if this package consumes one ──
        // If full, auto-cancel + refund and bail before sending confirmation emails.
        let claimedTableCode: string | null = null;
        let allotmentFailed = false;
        if (booking) {
          const zone = getZoneForPackage(booking.package_id) ?? (booking.zone_id ? { zoneId: booking.zone_id, zoneName: '', blockMinutes: 180 } : null);
          if (zone) {
            try {
              const rawCust = booking.booking_customers;
              const cust = Array.isArray(rawCust) ? rawCust[0] : rawCust;
              const fullName = cust ? `${cust.first_name ?? ''} ${cust.last_name ?? ''}`.trim() : null;
              const result = await claimTable({
                zoneId: zone.zoneId,
                bookingId: booking.id,
                startAtIso: buildBangkokTimestamp(booking.activity_date, booking.time_slot),
                source: 'website',
                customerName: fullName,
                guestCount: booking.guest_count,
                notes: `Auto-claimed from website payment (ref ${booking.booking_ref})`,
                // The RPC will also auto-pull these from bookings if we don't
                // pass them, but passing them explicitly avoids an extra query.
                depositAmount: Number(booking.total_amount) || null,
                bookingRef: booking.booking_ref ?? null,
              });
              claimedTableCode = result.table_code;
              console.log(`[Allotment] Claimed ${result.table_code} for booking ${booking.booking_ref}`);
            } catch (err) {
              const msg = err instanceof Error ? err.message : String(err);
              if (msg.includes('TM_ALLOTMENT_FULL')) {
                allotmentFailed = true;
                console.error(`[Allotment] FULL for ${booking.booking_ref} — auto-cancelling + refunding`);
                // Mark cancelled and append a note for admin
                await supabaseAdmin
                  .from('bookings')
                  .update({
                    status: 'cancelled',
                    admin_notes: `[AUTO] No tables available at booking time. Refunded automatically. Original payment intent: ${paymentIntent.id}`,
                  })
                  .eq('id', booking.id);
                // Issue refund
                try {
                  await stripe.refunds.create({
                    payment_intent: paymentIntent.id,
                    reason: 'requested_by_customer',
                    metadata: { reason_code: 'allotment_full', booking_ref: booking.booking_ref },
                  });
                  console.log(`[Allotment] Refund issued for ${booking.booking_ref}`);
                } catch (refundErr) {
                  console.error(`[Allotment] Refund FAILED for ${booking.booking_ref}:`, refundErr);
                }
              } else {
                // Non-fatal: log but proceed with confirmation. Admin can assign manually.
                console.error(`[Allotment] Unexpected claim error for ${booking.booking_ref}:`, err);
              }
            }
          }
        }

        if (booking && booking.booking_customers && !allotmentFailed) {
          // Handle potential array returns from Supabase relations
          const rawCustomer = booking.booking_customers;
          const customer = Array.isArray(rawCustomer) ? rawCustomer[0] : rawCustomer;
          const rawTransport = booking.booking_transport;
          const transport = Array.isArray(rawTransport) ? rawTransport[0] : rawTransport;
          
          // Format date for display
          const activityDate = new Date(booking.activity_date).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          });

          // Format time slot
          const formatTime = (time: string) => {
            const [hours] = time.split(':');
            const hour = parseInt(hours);
            const period = hour >= 12 ? 'PM' : 'AM';
            const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
            return `${displayHour}:00 ${period}`;
          };

          // Prepare addons data
          const addons = booking.booking_addons?.map((addon: { promo_addons: { name: string }, quantity: number, unit_price: number }) => ({
            name: addon.promo_addons?.name || 'Add-on',
            quantity: addon.quantity,
            price: addon.unit_price,
          })) || [];

          // Look up the zone display name for emails + sync payload
          const zoneMapping = getZoneForPackage(booking.package_id);
          const zoneName = zoneMapping?.zoneName ?? null;

          // Emails: AWAIT these (don't background) so any failure surfaces
          // in the webhook response and we don't lose deliveries when the
          // Vercel function container is recycled between the response and
          // the trailing waitUntil flush.
          try {
            await sendBookingConfirmationEmail({
              customerEmail: customer.email,
              customerName: customer.first_name,
              bookingRef: booking.booking_ref,
              packageName: booking.packages?.name || 'Adventure Package',
              activityDate,
              timeSlot: formatTime(booking.time_slot),
              guestCount: booking.guest_count,
              totalAmount: booking.total_amount,
              hotelName: transport?.hotel_name,
              roomNumber: transport?.room_number,
              hasTransfer: !!transport,
              isPrivateTransfer: transport?.transport_type === 'private',
              addons,
              zoneName: zoneName,
            });
            console.log(`[Email] Customer confirmation sent for ${booking.booking_ref}`);
          } catch (err) {
            console.error(`[Email] Customer confirmation FAILED for ${booking.booking_ref}:`, err);
          }

          try {
            await sendBookingNotificationEmail({
              bookingRef: booking.booking_ref,
              customerName: `${customer.first_name} ${customer.last_name}`,
              customerEmail: customer.email,
              customerPhone: customer.phone || '',
              packageName: booking.packages?.name || 'Dining Package',
              playDate: activityDate,
              timeSlot: formatTime(booking.time_slot),
              guests: booking.guest_count,
              additionalGuests: transport?.non_players || undefined,
              transportType: transport?.transport_type || 'none',
              hotelName: transport?.hotel_name || undefined,
              roomNumber: transport?.room_number || undefined,
              privatePassengers: transport?.private_passengers || undefined,
              addons,
              totalAmount: booking.total_amount,
              paymentStatus: 'confirmed',
            });
            console.log(`[Email] Admin notification sent for ${booking.booking_ref}`);
          } catch (err) {
            console.error(`[Email] Admin notification FAILED for ${booking.booking_ref}:`, err);
          }

          // OneBooking sync can stay in waitUntil — it's idempotent and a
          // failure here doesn't lose customer-visible state.
          const onebookingSync = async () => {
            try {
              const bookingOrigin = booking.booking_origin_ip ? {
                ip: booking.booking_origin_ip,
                country_code: booking.booking_origin_country_code || '',
                country_name: booking.booking_origin_country_name || '',
              } : null;
              const paymentOrigin = paymentOriginCountryCode ? {
                country_code: paymentOriginCountryCode,
                country_name: paymentOriginCountryName || '',
              } : (booking.payment_origin_country_code ? {
                country_code: booking.payment_origin_country_code,
                country_name: booking.payment_origin_country_name || '',
              } : null);

              const syncResult = await pushBookingToOneBooking('booking.created', {
                id: booking.id,
                booking_ref: booking.booking_ref,
                activity_date: booking.activity_date,
                time_slot: booking.time_slot,
                guest_count: Number(booking.guest_count) || 0,
                total_amount: Number(booking.total_amount) || 0,
                discount_amount: Number(booking.discount_amount) || 0,
                currency: 'THB',
                status: 'confirmed',
                special_requests: booking.special_requests || null,
                stripe_payment_intent_id: paymentIntent.id,
                created_at: booking.created_at,
                packages: booking.packages ? {
                  name: booking.packages.name,
                  price: Number(booking.packages.price) || 0,
                } : null,
                customers: customer ? {
                  name: `${customer.first_name} ${customer.last_name}`,
                  email: customer.email,
                  phone: customer.phone || null,
                  country_code: customer.country_code || null,
                } : null,
                transport_type: transport?.transport_type || null,
                hotel_name: transport?.hotel_name || null,
                room_number: transport?.room_number || null,
                non_players: Number(transport?.non_players) || 0,
                private_passengers: Number(transport?.private_passengers) || 0,
                transport_cost: Number(transport?.transport_cost) || 0,
                booking_addons: booking.booking_addons || [],
                promo_code: booking.promo_code || null,
                admin_notes: booking.admin_notes || null,
                zone_id: booking.zone_id || null,
                zone_name: zoneName,
                table_code: claimedTableCode,
                booking_origin: bookingOrigin,
                payment_origin: paymentOrigin,
              });
              if (syncResult.success) {
                console.log(`[OneBooking] Synced ${booking.booking_ref} to central dashboard`);
              } else {
                console.warn(`[OneBooking] Sync skipped/failed for ${booking.booking_ref}:`, syncResult.error);
              }
            } catch (syncError) {
              console.error(`[OneBooking] Sync error for ${booking.booking_ref}:`, syncError);
            }
          };
          waitUntil(onebookingSync());

          console.log(`Booking ${booking.booking_ref} confirmed`);
        }
      }
      break;
    }

    case 'payment_intent.payment_failed': {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      const bookingId = paymentIntent.metadata?.booking_id;

      if (bookingId) {
        await supabaseAdmin
          .from('bookings')
          .update({ status: 'cancelled' })
          .eq('id', bookingId);
      }
      break;
    }

    case 'charge.refunded': {
      const charge = event.data.object as Stripe.Charge;
      const paymentIntentId = charge.payment_intent as string;

      if (paymentIntentId) {
        // Find the booking, update status, then release any allotment block.
        const { data: refundedBooking } = await supabaseAdmin
          .from('bookings')
          .update({ status: 'refunded' })
          .eq('stripe_payment_intent_id', paymentIntentId)
          .select('id, booking_ref')
          .single();

        if (refundedBooking?.id) {
          try {
            const freed = await releaseTable(refundedBooking.id);
            if (freed > 0) {
              console.log(`[Allotment] Released ${freed} allotment(s) for refunded booking ${refundedBooking.booking_ref}`);
            }
          } catch (err) {
            console.error(`[Allotment] Failed to release allotment for refunded booking ${refundedBooking.booking_ref}:`, err);
          }
        }
      }
      break;
    }

    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  return NextResponse.json({ received: true });
}
