'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { CheckCircle, Calendar, Clock, Users, MapPin, Mail, Phone, ChevronRight, Gift, Sparkles } from 'lucide-react';

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
  discount_amount?: number;
  currency: string;
  zone_id?: string | null;
  table_code?: string | null;
  packages: {
    name: string;
    slug: string;
    price: number;
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
}

// Friendly zone names
const ZONE_NAMES: Record<string, string> = {
  'monkey-dome':           'Monkey Dome',
  'monkey-nest':           'Monkey Nest',
  'monkey-hilltop':        'Monkey Hilltop',
  'bamboo-pavilion':       'Bamboo Pavilion',
  'zone-t':                'Zone T',
  'zone-z':                'Zone Z',
  'exclusive-romantic':    'Exclusive Romantic — Zone Z',
  'romantic-rooftop-luge': 'Romantic Rooftop Luge',
};

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

  const customer = getCustomer();

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
            <button className="w-full py-3 bg-[#b1b94c] hover:bg-[#d4c91e] text-black font-bold rounded-xl transition-all">
              Back to Home
            </button>
          </Link>
        </motion.div>
      </main>
    );
  }

  const zoneDisplay = booking?.zone_id ? (ZONE_NAMES[booking.zone_id] || booking.zone_id) : null;

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#0a0a0a] text-white">
      {/* Decorative background — soft brand glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-1/3 left-1/2 h-[700px] w-[700px] -translate-x-1/2 rounded-full bg-[#b1b94c]/10 blur-[140px]" />
        <div className="absolute bottom-0 left-0 h-[300px] w-[300px] rounded-full bg-[#b1b94c]/5 blur-[100px]" />
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              'radial-gradient(circle at 1px 1px, rgba(177, 185, 76, 1) 1px, transparent 0)',
            backgroundSize: '32px 32px',
          }}
        />
      </div>

      <div className="relative z-10 max-w-lg mx-auto px-4 py-10">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-center mb-6"
        >
          <Image
            src="/images/threemonkeyslogo.png"
            alt="Three Monkeys Restaurant"
            width={140}
            height={48}
            priority
            unoptimized
            className="h-auto w-auto max-w-[140px]"
          />
        </motion.div>

        {/* Success Header Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="bg-gradient-to-br from-[#b1b94c] to-[#8a9139] rounded-2xl p-6 text-center mb-4 shadow-xl shadow-[#b1b94c]/20"
        >
          <motion.div
            initial={{ scale: 0, rotate: -90 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="w-16 h-16 bg-black rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg"
          >
            <CheckCircle className="w-9 h-9 text-[#b1b94c]" />
          </motion.div>
          <p className="text-black/60 text-[10px] uppercase tracking-[0.25em] mb-1">Reservation Confirmed</p>
          <h1 className="text-2xl sm:text-3xl font-bold text-black font-[family-name:var(--font-krona)] normal-case mb-2">
            Your table awaits
          </h1>
          {customer && (
            <p className="text-black/80 text-sm">
              Thank you, <span className="font-bold text-black">{customer.first_name}</span>! See you soon at Three Monkeys.
            </p>
          )}
          <div className="mt-4 bg-black/15 backdrop-blur rounded-xl px-4 py-2 inline-block">
            <span className="text-[10px] text-black/60 uppercase tracking-wider block">Booking Reference</span>
            <span className="text-xl font-bold text-black tracking-wide font-mono">{bookingRef}</span>
          </div>
          {customer?.email && (
            <p className="text-xs text-black/60 mt-3 flex items-center justify-center gap-1.5">
              <Mail className="w-3 h-3" />
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
              className="bg-white rounded-2xl shadow-xl overflow-hidden mb-4"
            >
              {/* Package + Zone Header */}
              <div className="bg-[#b1b94c] px-5 py-4">
                <p className="text-black/60 text-[10px] font-medium uppercase tracking-wider mb-1">Your reservation</p>
                <h2 className="text-black text-lg font-bold">{booking.packages?.name || 'Dining Package'}</h2>
                {zoneDisplay && (
                  <p className="text-black/70 text-xs mt-1 flex items-center gap-1.5">
                    <MapPin className="w-3 h-3" />
                    Seated in <span className="font-semibold text-black">{zoneDisplay}</span>
                  </p>
                )}
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
                    <p className="text-[10px] text-slate-400 uppercase">Guests</p>
                    <p className="text-sm font-semibold text-slate-800">{booking.guest_count}</p>
                  </div>
                </div>


                {/* Add-ons */}
                {booking.booking_addons && booking.booking_addons.length > 0 && (
                  <div className="border-t border-slate-100 pt-4 mt-4">
                    <p className="text-xs text-slate-400 uppercase mb-2 flex items-center gap-1.5">
                      <Gift className="w-3.5 h-3.5 text-[#b1b94c]" />
                      Add-ons
                    </p>
                    {booking.booking_addons.map((addon, index) => (
                      <div key={index} className="flex items-center justify-between py-1">
                        <span className="text-sm text-slate-600">{addon.promo_addons?.name} × {addon.quantity}</span>
                        <span className="text-sm font-semibold text-[#7a8534]">{formatCurrency((addon.unit_price || 0) * (addon.quantity || 1))}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Total with Discount */}
                <div className="border-t border-slate-100 pt-4 mt-4">
                  {booking.discount_amount && booking.discount_amount > 0 ? (
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 -mx-1">
                      {/* Original Price with Strikethrough */}
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-slate-500 text-sm">Original Price</span>
                        <span className="text-slate-400 text-lg line-through decoration-red-400 decoration-2">
                          {formatCurrency(booking.total_amount + booking.discount_amount)}
                        </span>
                      </div>
                      {/* Discount Amount with Percentage Badge */}
                      <div className="flex items-center justify-between mb-3 pb-3 border-b border-green-200/50">
                        <div className="flex items-center gap-2">
                          <span className="bg-green-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-sm">
                            {Math.round((booking.discount_amount / (booking.total_amount + booking.discount_amount)) * 100)}% OFF
                          </span>
                          <span className="text-green-700 text-sm font-medium">You saved!</span>
                        </div>
                        <span className="text-green-600 text-lg font-bold">
                          -{formatCurrency(booking.discount_amount)}
                        </span>
                      </div>
                      {/* Final Total Paid */}
                      <div className="flex items-center justify-between">
                        <span className="text-slate-700 font-semibold">Total Paid</span>
                        <span className="text-2xl font-bold text-[#1a1a1a]">{formatCurrency(booking.total_amount)}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600 font-medium">Total Paid</span>
                      <span className="text-2xl font-bold text-[#1a1a1a]">{formatCurrency(booking.total_amount)}</span>
                    </div>
                  )}
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
                  <span>Please arrive 15 minutes before your reservation time</span>
                </li>
                <li className="flex items-start gap-2">
                  <ChevronRight className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>Smart casual dress code recommended</span>
                </li>
                <li className="flex items-start gap-2">
                  <ChevronRight className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>Please inform us of any dietary requirements in advance</span>
                </li>
                <li className="flex items-start gap-2">
                  <ChevronRight className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>Reservations held for 15 minutes past booking time</span>
                </li>
              </ul>
            </motion.div>

            {/* Location Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-2xl shadow-xl p-4 mb-4"
            >
              <a
                href="https://maps.app.goo.gl/hk5Z7PQUHnmz6tVB6"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 group"
              >
                <div className="w-12 h-12 bg-[#b1b94c] rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                  <MapPin className="w-6 h-6 text-black" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-slate-800">Three Monkeys Restaurant</h3>
                  <p className="text-sm text-slate-500">Inside Hanuman World, Kathu, Phuket</p>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-[#b1b94c]" />
              </a>
            </motion.div>
          </>
        )}

        {/* Action Button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex gap-3"
        >
          <Link href="/" className="flex-1">
            <button className="w-full py-4 bg-[#b1b94c] hover:bg-[#c4cc5a] text-black font-bold rounded-2xl transition-all text-base shadow-lg hover:shadow-xl flex items-center justify-center gap-2">
              <Sparkles className="w-4 h-4" />
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
          <p className="text-white/40 text-xs mb-3">Need help with your booking?</p>
          <div className="flex justify-center gap-4">
            <a href="mailto:enjoy@threemonkeysphuket.com" className="flex items-center gap-1.5 text-white/70 hover:text-[#b1b94c] text-sm transition-colors">
              <Mail className="w-4 h-4" /> Email us
            </a>
            <a href="tel:+66993632222" className="flex items-center gap-1.5 text-white/70 hover:text-[#b1b94c] text-sm transition-colors">
              <Phone className="w-4 h-4" /> Call us
            </a>
          </div>
          <p className="text-white/20 text-[10px] mt-6">
            © {new Date().getFullYear()} Three Monkeys Restaurant Phuket
          </p>
        </motion.div>
      </div>
    </main>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-[#0f0f0f] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#b1b94c] border-t-transparent rounded-full animate-spin" />
      </main>
    }>
      <SuccessContent />
    </Suspense>
  );
}
