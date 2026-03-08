import { NextRequest, NextResponse } from 'next/server';
import { stripe, PRIVATE_TRANSFER_PRICE, NON_PLAYER_PRICE } from '@/lib/stripe/client';
import { supabaseAdmin } from '@/lib/supabase/server';
import Stripe from 'stripe';

interface BookingData {
  packageId: string;
  date: string;
  time: string;
  guests: number;
  pickup: boolean;
  hotel?: string;
  room?: string;
  privateTransfer: boolean;
  privatePassengers: number;
  nonPlayers: number;
  promoAddons: Record<string, number>;
  customer: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    countryCode: string;
    specialRequests?: string;
  };
}

export async function POST(request: NextRequest) {
  try {
    const body: BookingData = await request.json();

    const {
      packageId,
      date,
      time,
      guests,
      pickup,
      hotel,
      room,
      privateTransfer,
      privatePassengers,
      nonPlayers,
      promoAddons,
      customer,
    } = body;

    const { data: packageData, error: packageError } = await supabaseAdmin
      .from('packages')
      .select('*')
      .eq('id', packageId)
      .single();

    if (packageError || !packageData) {
      return NextResponse.json({ error: 'Package not found' }, { status: 404 });
    }

    const { data: addonsData } = await supabaseAdmin
      .from('promo_addons')
      .select('*')
      .in('id', Object.keys(promoAddons));

    let totalAmount = packageData.price * guests;

    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [
      {
        price_data: {
          currency: 'thb',
          product_data: {
            name: packageData.name,
            description: `${packageData.duration} - ${date} at ${time}`,
          },
          unit_amount: packageData.price * 100,
        },
        quantity: guests,
      },
    ];

    if (addonsData) {
      for (const addon of addonsData) {
        const qty = promoAddons[addon.id] || 0;
        if (qty > 0) {
          totalAmount += addon.price * qty;
          lineItems.push({
            price_data: {
              currency: 'thb',
              product_data: {
                name: addon.name,
              },
              unit_amount: addon.price * 100,
            },
            quantity: qty,
          });
        }
      }
    }

    let transportCost = 0;
    let transportType: 'hotel_pickup' | 'self_arrange' | 'private' = 'self_arrange';

    if (privateTransfer) {
      transportType = 'private';
      transportCost = PRIVATE_TRANSFER_PRICE;
      totalAmount += PRIVATE_TRANSFER_PRICE;
      lineItems.push({
        price_data: {
          currency: 'thb',
          product_data: {
            name: 'Private Transfer',
            description: `Up to ${privatePassengers} passengers`,
          },
          unit_amount: PRIVATE_TRANSFER_PRICE * 100,
        },
        quantity: 1,
      });
    } else if (pickup) {
      transportType = 'hotel_pickup';
    }

    if (nonPlayers > 0) {
      const nonPlayerCost = NON_PLAYER_PRICE * nonPlayers;
      transportCost += nonPlayerCost;
      totalAmount += nonPlayerCost;
      lineItems.push({
        price_data: {
          currency: 'thb',
          product_data: {
            name: 'Non-Player Fee',
            description: `${nonPlayers} accompanying guest(s)`,
          },
          unit_amount: NON_PLAYER_PRICE * 100,
        },
        quantity: nonPlayers,
      });
    }

    const { data: booking, error: bookingError } = await supabaseAdmin
      .from('bookings')
      .insert({
        package_id: packageId,
        activity_date: date,
        time_slot: time,
        guest_count: guests,
        status: 'pending',
        total_amount: totalAmount,
        currency: 'THB',
      })
      .select()
      .single();

    if (bookingError || !booking) {
      console.error('Booking creation error:', bookingError);
      return NextResponse.json({ error: 'Failed to create booking' }, { status: 500 });
    }

    await supabaseAdmin.from('booking_customers').insert({
      booking_id: booking.id,
      first_name: customer.firstName,
      last_name: customer.lastName,
      email: customer.email,
      phone: customer.phone,
      country_code: customer.countryCode,
      special_requests: customer.specialRequests || null,
    });

    await supabaseAdmin.from('booking_transport').insert({
      booking_id: booking.id,
      transport_type: transportType,
      hotel_name: hotel || null,
      room_number: room || null,
      private_passengers: privatePassengers,
      non_players: nonPlayers,
      transport_cost: transportCost,
    });

    if (addonsData) {
      const addonInserts = addonsData
        .filter((addon) => promoAddons[addon.id] > 0)
        .map((addon) => ({
          booking_id: booking.id,
          addon_id: addon.id,
          quantity: promoAddons[addon.id],
          unit_price: addon.price,
        }));

      if (addonInserts.length > 0) {
        await supabaseAdmin.from('booking_addons').insert(addonInserts);
      }
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${appUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}&booking_ref=${booking.booking_ref}`,
      cancel_url: `${appUrl}/checkout/cancel?booking_id=${booking.id}`,
      customer_email: customer.email,
      metadata: {
        booking_id: booking.id,
        booking_ref: booking.booking_ref,
      },
      payment_intent_data: {
        metadata: {
          booking_id: booking.id,
          booking_ref: booking.booking_ref,
        },
      },
    });

    await supabaseAdmin
      .from('bookings')
      .update({ stripe_checkout_session_id: session.id })
      .eq('id', booking.id);

    return NextResponse.json({
      sessionId: session.id,
      sessionUrl: session.url,
      bookingRef: booking.booking_ref,
    });
  } catch (error) {
    console.error('Checkout session creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
