# 6. Checkout Success Page

The thank you / confirmation page shown after successful payment.

## File Location

Create this file at: `/app/(public)/checkout/success/page.tsx`

## Design Overview

The success page uses a card-based layout with:
- **Yellow gradient header** with booking reference
- **White booking details card** with package, date, time, players
- **Transport and add-ons sections**
- **Important information card** (dynamic based on transfer type)
- **Location card**
- **Back to home button**

## Complete Implementation

```typescript
'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { 
  CheckCircle, Calendar, Clock, Users, MapPin, 
  Mail, Phone, Car, UserMinus, ChevronRight 
} from 'lucide-react';

interface BookingAddon {
  id: string;
  quantity: number;
  unit_price: number;
  promo_addons: {
    id: string;
    name: string;
  };
}

interface BookingData {
  id: string;
  booking_ref: string;
  activity_date: string;
  time_slot: string;
  guest_count: number;
  total_amount: number;
  currency: string;
  packages: {
    name: string;
    slug: string;
  };
  booking_customers: {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
  } | {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
  }[];
  booking_addons: BookingAddon[];
  booking_transport: {
    transport_type: string;
    hotel_name: string | null;
    room_number: string | null;
    non_players: number;
    private_passengers: number;
  } | {
    transport_type: string;
    hotel_name: string | null;
    room_number: string | null;
    non_players: number;
    private_passengers: number;
  }[] | null;
}

function SuccessContent() {
  const searchParams = useSearchParams();
  const bookingRef = searchParams.get('booking_ref');
  const paymentIntent = searchParams.get('payment_intent');
  
  const [booking, setBooking] = useState<BookingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBookingDetails = async () => {
      if (!bookingRef || !paymentIntent) {
        setError('Invalid booking link');
        setLoading(false);
        return;
      }
      
      try {
        const response = await fetch(`/api/bookings/${bookingRef}?payment_intent=${paymentIntent}`);
        if (response.ok) {
          const data = await response.json();
          setBooking(data);
        } else if (response.status === 401) {
          setError('This booking confirmation link is not valid or has expired.');
        } else {
          setError('Booking not found');
        }
      } catch (err) {
        console.error('Error fetching booking:', err);
        setError('Failed to load booking details');
      }
      setLoading(false);
    };

    fetchBookingDetails();
  }, [bookingRef, paymentIntent]);

  const formatCurrency = (amount: number) => {
    if (isNaN(amount) || amount === null || amount === undefined) return '฿0';
    return `฿${amount.toLocaleString()}`;
  };

  // Helper to get customer data (handle array or object)
  const getCustomer = () => {
    if (!booking?.booking_customers) return null;
    return Array.isArray(booking.booking_customers) 
      ? booking.booking_customers[0] 
      : booking.booking_customers;
  };

  // Helper to get transport data (handle array or object)
  const getTransport = () => {
    if (!booking?.booking_transport) return null;
    return Array.isArray(booking.booking_transport) 
      ? booking.booking_transport[0] 
      : booking.booking_transport;
  };

  const customer = getCustomer();
  const transport = getTransport();
  const hasTransfer = transport && transport.transport_type !== 'self_arrange';
  const nonPlayers = transport?.non_players || 0;

  // Error state
  if (error) {
    return (
      <main className="min-h-screen bg-[#0f0f0f] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full text-center"
        >
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail className="w-8 h-8 text-red-500" />
          </div>
          <h1 className="text-xl font-bold text-slate-800 mb-2">Access Denied</h1>
          <p className="text-sm text-slate-500 mb-6">{error}</p>
          <Link href="/">
            <button className="w-full py-3 bg-[#f2e421] hover:bg-[#d4c91e] text-black font-bold rounded-xl transition-all">
              Back to Home
            </button>
          </Link>
        </motion.div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0f0f0f]">
      <div className="max-w-lg mx-auto px-4 py-8">
        {/* Success Header Card */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-[#f2e421] to-[#d4c91e] rounded-2xl p-6 text-center mb-4 shadow-lg"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
            className="w-16 h-16 bg-black rounded-full flex items-center justify-center mx-auto mb-3"
          >
            <CheckCircle className="w-9 h-9 text-[#f2e421]" />
          </motion.div>
          <h1 className="text-2xl font-bold text-black font-[family-name:var(--font-trade-winds)] mb-1">
            BOOKING CONFIRMED!
          </h1>
          {customer && (
            <p className="text-black/70 text-sm">
              Thank you, <span className="font-bold text-black">{customer.first_name}</span>!
            </p>
          )}
          <div className="mt-4 bg-black/10 rounded-xl px-4 py-2 inline-block">
            <span className="text-xs text-black/60 block">Booking Reference</span>
            <span className="text-xl font-bold text-black tracking-wide">{bookingRef}</span>
          </div>
          {customer?.email && (
            <p className="text-xs text-black/60 mt-3">
              Confirmation sent to <span className="font-medium text-black/80">{customer.email}</span>
            </p>
          )}
        </motion.div>

        {!loading && booking && (
          <>
            {/* Booking Details Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl shadow-lg overflow-hidden mb-4"
            >
              {/* Package Header */}
              <div className="bg-[#1a1a1a] px-5 py-4">
                <p className="text-[#f2e421] text-xs font-medium uppercase tracking-wider mb-1">Package</p>
                <h2 className="text-white text-lg font-bold">{booking.packages?.name || 'Adventure Package'}</h2>
              </div>

              {/* Details Grid */}
              <div className="p-5">
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="text-center">
                    <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-2">
                      <Calendar className="w-5 h-5 text-slate-600" />
                    </div>
                    <p className="text-[10px] text-slate-400 uppercase">Date</p>
                    <p className="text-sm font-semibold text-slate-800">
                      {new Date(booking.activity_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-2">
                      <Clock className="w-5 h-5 text-slate-600" />
                    </div>
                    <p className="text-[10px] text-slate-400 uppercase">Time</p>
                    <p className="text-sm font-semibold text-slate-800">
                      {booking.time_slot === 'flexible' ? 'Flexible' : booking.time_slot}
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-2">
                      <Users className="w-5 h-5 text-slate-600" />
                    </div>
                    <p className="text-[10px] text-slate-400 uppercase">Players</p>
                    <p className="text-sm font-semibold text-slate-800">{booking.guest_count}</p>
                  </div>
                </div>

                {/* Non-Players & Transport */}
                {(nonPlayers > 0 || hasTransfer) && (
                  <div className="border-t border-slate-100 pt-4 space-y-3">
                    {nonPlayers > 0 && (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <UserMinus className="w-4 h-4 text-slate-400" />
                          <span className="text-sm text-slate-600">Non-Players</span>
                        </div>
                        <span className="text-sm font-semibold text-slate-800">{nonPlayers} person(s)</span>
                      </div>
                    )}
                    {hasTransfer && (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Car className="w-4 h-4 text-slate-400" />
                          <span className="text-sm text-slate-600">
                            {transport?.transport_type === 'hotel_pickup' ? 'Hotel Pickup' : 'Private Transfer'}
                          </span>
                        </div>
                        {transport?.hotel_name && (
                          <span className="text-sm font-semibold text-slate-800">
                            {transport.hotel_name}{transport.room_number ? ` #${transport.room_number}` : ''}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Add-ons */}
                {booking.booking_addons && booking.booking_addons.length > 0 && (
                  <div className="border-t border-slate-100 pt-4 mt-4">
                    <p className="text-xs text-slate-400 uppercase mb-2">Add-ons</p>
                    {booking.booking_addons.map((addon, index) => (
                      <div key={index} className="flex items-center justify-between py-1">
                        <span className="text-sm text-slate-600">{addon.promo_addons?.name} × {addon.quantity}</span>
                        <span className="text-sm font-semibold text-green-600">
                          {formatCurrency((addon.unit_price || 0) * (addon.quantity || 1))}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Total */}
                <div className="border-t border-slate-100 pt-4 mt-4 flex items-center justify-between">
                  <span className="text-slate-600 font-medium">Total Paid</span>
                  <span className="text-2xl font-bold text-[#1a1a1a]">{formatCurrency(booking.total_amount)}</span>
                </div>
              </div>
            </motion.div>

            {/* Important Info Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-4"
            >
              <h3 className="text-amber-800 font-bold text-sm mb-2">📋 Important Information</h3>
              <ul className="text-amber-700 text-sm space-y-1">
                <li className="flex items-start gap-2">
                  <ChevronRight className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>
                    {hasTransfer 
                      ? 'Be at your hotel lobby 15 minutes before pick-up time' 
                      : 'Arrive at least 30 minutes before your scheduled time'}
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <ChevronRight className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>Bring your booking confirmation</span>
                </li>
                <li className="flex items-start gap-2">
                  <ChevronRight className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>Wear comfortable clothes and closed-toe shoes</span>
                </li>
                <li className="flex items-start gap-2">
                  <ChevronRight className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>Weight limit: 120kg maximum for zipline</span>
                </li>
              </ul>
            </motion.div>

            {/* Location Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-2xl shadow-lg p-4 mb-4"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-[#f2e421] rounded-xl flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-6 h-6 text-black" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800">[Your Business Name]</h3>
                  <p className="text-sm text-slate-500">[Your Address]</p>
                </div>
              </div>
            </motion.div>
          </>
        )}

        {/* Action Button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <Link href="/">
            <button className="w-full py-4 bg-[#f2e421] hover:bg-[#d4c91e] text-black font-bold rounded-2xl transition-all text-lg shadow-lg hover:shadow-xl">
              Back to Home
            </button>
          </Link>
        </motion.div>

        {/* Help Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-6 text-center"
        >
          <p className="text-slate-500 text-xs mb-2">Need help with your booking?</p>
          <div className="flex justify-center gap-4">
            <a href="mailto:support@yourdomain.com" className="flex items-center gap-1 text-white/80 hover:text-white text-sm transition-colors">
              <Mail className="w-4 h-4" /> Email
            </a>
            <a href="tel:+66XXXXXXXXX" className="flex items-center gap-1 text-white/80 hover:text-white text-sm transition-colors">
              <Phone className="w-4 h-4" /> Call
            </a>
          </div>
        </motion.div>
      </div>
    </main>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-[#0f0f0f] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#f2e421] border-t-transparent rounded-full animate-spin" />
      </main>
    }>
      <SuccessContent />
    </Suspense>
  );
}
```

---

## Customization Points

Update these for your brand:

1. **Colors:** Replace `#f2e421` with your brand color
2. **Font:** Replace `font-[family-name:var(--font-trade-winds)]` with your heading font
3. **Business Name:** Update in Location Card
4. **Address:** Update in Location Card
5. **Contact Info:** Update email and phone in Help Footer
6. **Important Information:** Customize bullet points for your activity
