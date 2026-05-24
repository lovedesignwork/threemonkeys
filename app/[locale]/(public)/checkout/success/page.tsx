'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from '@/i18n/navigation';
import {
  CheckCircle2,
  Calendar,
  Clock,
  Users,
  MapPin,
  Mail,
  Phone,
  MessageCircle,
  ChevronRight,
  Gift,
  Sparkles,
  CreditCard,
  StickyNote,
  Copy,
  Check,
  Info,
} from 'lucide-react';

interface BookingAddon {
  id: string;
  quantity: number;
  unit_price: number;
  promo_addons: {
    id: string;
    name: string;
  } | null;
}

interface BookingCustomer {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  special_requests?: string | null;
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
  admin_notes?: string | null;
  packages: {
    name: string;
    slug: string;
    price: number;
  };
  booking_customers: BookingCustomer | BookingCustomer[];
  booking_addons: BookingAddon[];
}

const ZONE_NAMES: Record<string, string> = {
  'monkey-dome': 'Monkey Dome',
  'monkey-nest': 'Monkey Nest',
  'monkey-hilltop': 'Monkey Hilltop',
  'bamboo-pavilion': 'Bamboo Pavilion',
  'zone-t': 'Zone T',
  'zone-z': 'Zone Z',
  'exclusive-romantic': 'Exclusive Romantic — Zone Z',
  'romantic-rooftop-luge': 'Romantic Rooftop Luge',
};

function SuccessContent() {
  const searchParams = useSearchParams();
  const bookingRef = searchParams.get('booking_ref');
  const paymentIntent = searchParams.get('payment_intent');

  const [booking, setBooking] = useState<BookingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

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
    if (Number.isNaN(amount) || amount === null || amount === undefined) return '฿0';
    return `฿${amount.toLocaleString()}`;
  };

  const getCustomer = (): BookingCustomer | null => {
    if (!booking?.booking_customers) return null;
    return Array.isArray(booking.booking_customers)
      ? booking.booking_customers[0]
      : booking.booking_customers;
  };

  const copyBookingRef = () => {
    if (!bookingRef) return;
    navigator.clipboard.writeText(bookingRef).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const customer = getCustomer();
  const specialRequests = customer?.special_requests?.trim() || booking?.admin_notes?.trim() || '';
  const zoneDisplay = booking?.zone_id ? ZONE_NAMES[booking.zone_id] || booking.zone_id : null;

  if (error) {
    return (
      <main className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-[#111] border border-white/10 rounded-2xl p-8 max-w-sm w-full text-center"
        >
          <div className="w-16 h-16 bg-red-500/10 border border-red-500/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail className="w-8 h-8 text-red-400" />
          </div>
          <h1 className="text-xl font-bold text-white mb-2">Access Denied</h1>
          <p className="text-sm text-white/50 mb-6">{error}</p>
          <Link href="/">
            <button className="w-full py-3 bg-[#b1b94c] hover:bg-[#c4cc5a] text-black font-bold rounded-xl transition-all">
              Back to Home
            </button>
          </Link>
        </motion.div>
      </main>
    );
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#b1b94c] border-t-transparent rounded-full animate-spin" />
      </main>
    );
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#0a0a0a] text-white">
      {/* Soft brand glow */}
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

      <div className="relative z-10 max-w-2xl mx-auto px-4 py-10 sm:py-14">
        {/* Success hero — fresher: floating leaves backdrop, prominent
            checkmark medallion, larger booking reference. */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="relative bg-gradient-to-br from-[#b1b94c] via-[#a6ad48] to-[#8a9139] rounded-3xl p-8 sm:p-12 text-center mb-6 shadow-2xl shadow-[#b1b94c]/30 overflow-hidden"
        >
          {/* Layer 1: dot mesh */}
          <div
            className="absolute inset-0 opacity-[0.08]"
            style={{
              backgroundImage:
                'radial-gradient(circle at 1px 1px, rgba(0,0,0,0.6) 1px, transparent 0)',
              backgroundSize: '24px 24px',
            }}
          />
          {/* Layer 2: soft white glow at top */}
          <div className="pointer-events-none absolute -top-32 left-1/2 -translate-x-1/2 h-72 w-72 rounded-full bg-white/20 blur-[80px]" />
          {/* Layer 3: dark drift at bottom-right for depth */}
          <div className="pointer-events-none absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-black/20 blur-[100px]" />

          {/* Check medallion */}
          <motion.div
            initial={{ scale: 0, rotate: -90 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.15, type: 'spring', stiffness: 200 }}
            className="relative w-24 h-24 bg-black rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl ring-[6px] ring-black/15"
          >
            <span className="absolute inset-0 rounded-full ring-1 ring-white/10" />
            <CheckCircle2 className="w-14 h-14 text-[#b1b94c]" strokeWidth={2.5} />
          </motion.div>

          <p className="relative text-black/70 text-[11px] uppercase tracking-[0.35em] mb-3 font-semibold">
            Reservation Confirmed
          </p>
          <h1 className="relative text-3xl sm:text-4xl font-bold text-black font-[family-name:var(--font-krona)] normal-case mb-3 leading-[1.1]">
            Your table awaits
          </h1>
          {customer && (
            <p className="relative text-black/80 text-base sm:text-lg">
              Thank you, <span className="font-bold text-black">{customer.first_name}</span>. See
              you soon at Three Monkeys.
            </p>
          )}

          {/* Booking ref card — bigger, with a subtle inner glow */}
          <button
            onClick={copyBookingRef}
            className="relative mt-8 group inline-flex items-center gap-4 sm:gap-5 bg-black/95 hover:bg-black backdrop-blur rounded-2xl px-6 sm:px-7 py-4 sm:py-5 transition-all shadow-xl shadow-black/20"
          >
            <div className="text-left">
              <span className="text-[10px] sm:text-[11px] text-[#b1b94c]/80 uppercase tracking-[0.25em] block mb-1 font-semibold">
                Booking Reference
              </span>
              <span className="text-2xl sm:text-3xl font-bold text-[#b1b94c] tracking-[0.1em] font-mono leading-none">
                {bookingRef}
              </span>
            </div>
            <div className="w-9 h-9 bg-[#b1b94c]/15 group-hover:bg-[#b1b94c]/25 border border-[#b1b94c]/30 rounded-lg flex items-center justify-center transition-colors flex-shrink-0">
              {copied ? (
                <Check className="w-4 h-4 text-[#b1b94c]" />
              ) : (
                <Copy className="w-4 h-4 text-[#b1b94c]/80" />
              )}
            </div>
          </button>

          {customer?.email && (
            <p className="relative text-sm text-black/70 mt-5 flex items-center justify-center gap-1.5 px-2 break-all">
              <Mail className="w-3.5 h-3.5 flex-shrink-0" />
              Confirmation sent to{' '}
              <span className="font-semibold text-black">{customer.email}</span>
            </p>
          )}
        </motion.div>

        {booking && (
          <>
            {/* Reservation details */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-[#111] border border-white/10 rounded-3xl overflow-hidden mb-4"
            >
              <div className="bg-gradient-to-r from-[#b1b94c]/20 to-transparent border-b border-white/10 px-6 py-4">
                <p className="text-[10px] text-[#b1b94c] uppercase tracking-[0.2em] mb-1">
                  Your Reservation
                </p>
                <h2 className="text-white text-xl font-bold leading-tight">
                  {booking.packages?.name || 'Dining Package'}
                </h2>
                {zoneDisplay && (
                  <p className="text-white/60 text-sm mt-1.5 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#b1b94c]" />
                    Seated in{' '}
                    <span className="font-semibold text-white">{zoneDisplay}</span>
                    {booking.table_code && (
                      <span className="ml-1 px-2 py-0.5 bg-[#b1b94c]/15 border border-[#b1b94c]/30 rounded text-[10px] font-mono text-[#b1b94c]">
                        {booking.table_code}
                      </span>
                    )}
                  </p>
                )}
              </div>

              <div className="p-6">
                {/* Date / Time / Guests */}
                <div className="grid grid-cols-3 gap-3 mb-6">
                  <div className="bg-white/5 rounded-2xl p-4 text-center">
                    <div className="w-10 h-10 bg-[#b1b94c]/10 border border-[#b1b94c]/20 rounded-full flex items-center justify-center mx-auto mb-2">
                      <Calendar className="w-5 h-5 text-[#b1b94c]" />
                    </div>
                    <p className="text-[9px] text-white/40 uppercase tracking-wider">Date</p>
                    <p className="text-sm font-semibold text-white mt-0.5">
                      {new Date(booking.activity_date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                  <div className="bg-white/5 rounded-2xl p-4 text-center">
                    <div className="w-10 h-10 bg-[#b1b94c]/10 border border-[#b1b94c]/20 rounded-full flex items-center justify-center mx-auto mb-2">
                      <Clock className="w-5 h-5 text-[#b1b94c]" />
                    </div>
                    <p className="text-[9px] text-white/40 uppercase tracking-wider">Time</p>
                    <p className="text-sm font-semibold text-white mt-0.5">
                      {booking.time_slot === 'flexible' ? 'Flexible' : booking.time_slot}
                    </p>
                  </div>
                  <div className="bg-white/5 rounded-2xl p-4 text-center">
                    <div className="w-10 h-10 bg-[#b1b94c]/10 border border-[#b1b94c]/20 rounded-full flex items-center justify-center mx-auto mb-2">
                      <Users className="w-5 h-5 text-[#b1b94c]" />
                    </div>
                    <p className="text-[9px] text-white/40 uppercase tracking-wider">Guests</p>
                    <p className="text-sm font-semibold text-white mt-0.5">
                      {booking.guest_count}
                    </p>
                  </div>
                </div>

                {/* Add-ons */}
                {booking.booking_addons && booking.booking_addons.length > 0 && (
                  <div className="border-t border-white/10 pt-5 mb-5">
                    <p className="text-xs text-white/40 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                      <Gift className="w-3.5 h-3.5 text-[#b1b94c]" />
                      Add-ons
                    </p>
                    <div className="space-y-2">
                      {booking.booking_addons.map((addon, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between py-2 px-3 bg-white/[0.03] rounded-xl"
                        >
                          <span className="text-sm text-white/80">
                            {addon.promo_addons?.name || 'Add-on'}
                            <span className="text-white/40 ml-2">× {addon.quantity}</span>
                          </span>
                          <span className="text-sm font-semibold text-[#b1b94c]">
                            {formatCurrency((addon.unit_price || 0) * (addon.quantity || 1))}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Special requests / notes */}
                {specialRequests && (
                  <div className="border-t border-white/10 pt-5 mb-5">
                    <p className="text-xs text-white/40 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                      <StickyNote className="w-3.5 h-3.5 text-[#b1b94c]" />
                      Special Requests
                    </p>
                    <div className="bg-white/[0.03] border border-white/10 rounded-xl p-4">
                      <p className="text-sm text-white/80 leading-relaxed whitespace-pre-wrap">
                        {specialRequests}
                      </p>
                    </div>
                  </div>
                )}

                {/* Total */}
                <div className="border-t border-white/10 pt-5">
                  {booking.discount_amount && booking.discount_amount > 0 ? (
                    <div className="bg-gradient-to-br from-[#b1b94c]/10 to-[#b1b94c]/5 border border-[#b1b94c]/20 rounded-2xl p-5">
                      <div className="flex items-center justify-between mb-3 text-sm">
                        <span className="text-white/50">Original Price</span>
                        <span className="text-white/40 line-through decoration-red-400/70 decoration-2">
                          {formatCurrency(booking.total_amount + booking.discount_amount)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between mb-3 pb-3 border-b border-white/10">
                        <div className="flex items-center gap-2">
                          <span className="bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                            {Math.round(
                              (booking.discount_amount /
                                (booking.total_amount + booking.discount_amount)) *
                                100,
                            )}
                            % OFF
                          </span>
                          <span className="text-emerald-400 text-sm font-medium">You saved</span>
                        </div>
                        <span className="text-emerald-400 text-base font-bold">
                          −{formatCurrency(booking.discount_amount)}
                        </span>
                      </div>
                      <div className="flex items-end justify-between">
                        <span className="text-white/70 font-medium text-sm">Total Paid</span>
                        <span className="text-3xl font-bold text-white font-[family-name:var(--font-krona)]">
                          {formatCurrency(booking.total_amount)}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-end justify-between">
                      <span className="text-white/60 font-medium text-sm">Total Paid</span>
                      <span className="text-3xl font-bold text-white font-[family-name:var(--font-krona)]">
                        {formatCurrency(booking.total_amount)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Stripe descriptor notice */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="bg-[#111] border border-white/10 rounded-2xl p-4 mb-4 flex items-start gap-3"
            >
              <div className="w-10 h-10 bg-blue-500/10 border border-blue-500/30 rounded-xl flex items-center justify-center flex-shrink-0">
                <CreditCard className="w-5 h-5 text-blue-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white mb-1">Card Statement Descriptor</p>
                <p className="text-xs text-white/60 leading-relaxed">
                  The charge will appear as{' '}
                  <span className="px-1.5 py-0.5 bg-white/10 rounded font-mono text-white">
                    ONEBOOKING
                  </span>{' '}
                  on your card statement.
                </p>
              </div>
            </motion.div>

            {/* Important Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-5 mb-4"
            >
              <h3 className="text-amber-300 font-semibold text-sm mb-3 flex items-center gap-2">
                <Info className="w-4 h-4" />
                Important Information
              </h3>
              <ul className="text-amber-200/80 text-sm space-y-2">
                <li className="flex items-start gap-2">
                  <ChevronRight className="w-4 h-4 mt-0.5 flex-shrink-0 text-amber-400/60" />
                  <span>Please arrive 15 minutes before your reservation time</span>
                </li>
                <li className="flex items-start gap-2">
                  <ChevronRight className="w-4 h-4 mt-0.5 flex-shrink-0 text-amber-400/60" />
                  <span>Smart casual dress code recommended</span>
                </li>
                <li className="flex items-start gap-2">
                  <ChevronRight className="w-4 h-4 mt-0.5 flex-shrink-0 text-amber-400/60" />
                  <span>Tell us about any dietary requirements in advance</span>
                </li>
                <li className="flex items-start gap-2">
                  <ChevronRight className="w-4 h-4 mt-0.5 flex-shrink-0 text-amber-400/60" />
                  <span>Reservations held for 15 minutes past booking time</span>
                </li>
              </ul>
            </motion.div>

            {/* Location */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="bg-[#111] border border-white/10 rounded-2xl p-4 mb-4"
            >
              <a
                href="https://maps.app.goo.gl/hk5Z7PQUHnmz6tVB6"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 group"
              >
                <div className="w-12 h-12 bg-[#b1b94c] rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                  <MapPin className="w-6 h-6 text-black" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-white">Three Monkeys Restaurant</h3>
                  <p className="text-sm text-white/50">
                    Inside Hanuman World, Kathu, Phuket
                  </p>
                </div>
                <ChevronRight className="w-5 h-5 text-white/30 group-hover:text-[#b1b94c] transition-colors" />
              </a>
            </motion.div>
          </>
        )}

        {/* Back home button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex gap-3 mb-8"
        >
          <Link href="/" className="flex-1">
            <button className="w-full py-4 bg-[#b1b94c] hover:bg-[#c4cc5a] text-black font-bold rounded-2xl transition-all text-base shadow-lg hover:shadow-xl flex items-center justify-center gap-2">
              <Sparkles className="w-4 h-4" />
              Back to Home
            </button>
          </Link>
        </motion.div>

        {/* Help footer with WhatsApp */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35 }}
          className="text-center"
        >
          <p className="text-white/40 text-xs mb-4 uppercase tracking-wider">
            Need help with your booking?
          </p>
          <div className="grid grid-cols-3 gap-2 max-w-md mx-auto">
            <a
              href="https://wa.me/66980108838"
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center gap-1.5 px-3 py-3 bg-[#111] hover:bg-[#1a1a1a] border border-white/10 hover:border-emerald-500/40 rounded-xl transition-all group"
            >
              <MessageCircle className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-medium text-white/80">WhatsApp</span>
            </a>
            <a
              href="tel:+66980108838"
              className="flex flex-col items-center gap-1.5 px-3 py-3 bg-[#111] hover:bg-[#1a1a1a] border border-white/10 hover:border-[#b1b94c]/40 rounded-xl transition-all group"
            >
              <Phone className="w-4 h-4 text-[#b1b94c] group-hover:scale-110 transition-transform" />
              <span className="text-xs font-medium text-white/80">Call</span>
            </a>
            <a
              href="mailto:enjoy@threemonkeysphuket.com"
              className="flex flex-col items-center gap-1.5 px-3 py-3 bg-[#111] hover:bg-[#1a1a1a] border border-white/10 hover:border-blue-500/40 rounded-xl transition-all group"
            >
              <Mail className="w-4 h-4 text-blue-400 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-medium text-white/80">Email</span>
            </a>
          </div>

          <p className="text-white/20 text-[10px] mt-8">
            © {new Date().getFullYear()} Three Monkeys Restaurant Phuket
          </p>
        </motion.div>
      </div>
    </main>
  );
}

export default function SuccessPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-[#b1b94c] border-t-transparent rounded-full animate-spin" />
        </main>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}
