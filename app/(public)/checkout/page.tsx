'use client';

import { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { 
  ArrowLeft, Calendar, Clock, Users, MapPin, Car, 
  CreditCard, Lock, ShieldCheck, CheckCircle, AlertCircle,
  User, Mail, Phone, Pencil, Loader2, Tag, X, Wine, Cake, 
  UtensilsCrossed, Sparkles, Gift
} from 'lucide-react';
import Link from 'next/link';
import CountryPhoneSelector from '@/components/ui/CountryPhoneSelector';
import { packages } from '@/lib/data/packages';
import { formatPrice } from '@/lib/utils';
import StripeCardProvider from '@/components/checkout/StripeCardProvider';
import EmbeddedCardForm from '@/components/checkout/EmbeddedCardForm';

const promotionalAddons = [
  {
    id: 'wine-pairing',
    name: 'Wine Pairing',
    price: 800,
    icon: Wine,
  },
  {
    id: 'dessert-platter',
    name: 'Dessert Platter',
    price: 550,
    icon: Cake,
  },
  {
    id: 'appetizer-set',
    name: 'Premium Appetizer Set',
    price: 750,
    icon: UtensilsCrossed,
  },
];

const VVIP_TRANSFER_PRICE = 2500;

function CheckoutContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  // Parse booking data from URL params
  const packageId = searchParams.get('package');
  const date = searchParams.get('date');
  const time = searchParams.get('time');
  const guests = parseInt(searchParams.get('guests') || '2');
  const transfer = searchParams.get('transfer') === 'true';
  const hotel = searchParams.get('hotel') || '';
  const requests = searchParams.get('requests') || '';
  const addonsParam = searchParams.get('addons') || '';
  
  const selectedPackage = packages.find(p => p.id === packageId || p.slug === packageId);
  
  // Parse addons from URL (format: "id:qty,id:qty")
  const addonQuantities = useMemo(() => {
    const result: Record<string, number> = {};
    if (addonsParam) {
      addonsParam.split(',').forEach(item => {
        const [id, qty] = item.split(':');
        if (id && qty) {
          result[id] = parseInt(qty);
        }
      });
    }
    return result;
  }, [addonsParam]);

  // Build edit URL to go back to booking page with all details
  const editBookingUrl = useMemo(() => {
    const params = new URLSearchParams();
    if (packageId) params.set('package', packageId);
    return `/booking?${params.toString()}`;
  }, [packageId]);

  // Customer details form
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [countryCode, setCountryCode] = useState('+66');
  const [specialRequests, setSpecialRequests] = useState(requests);
  
  // Payment state
  const [isCreatingBooking, setIsCreatingBooking] = useState(false);
  
  // Promo code state
  const [promoCodeInput, setPromoCodeInput] = useState('');
  const [promoValidating, setPromoValidating] = useState(false);
  const [promoError, setPromoError] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<{
    id: string;
    code: string;
    description: string | null;
    discount_type: 'percentage' | 'fixed';
    discount_value: number;
    stripe_coupon_id: string | null;
  } | null>(null);
  const [discountAmount, setDiscountAmount] = useState(0);

  // Price calculations
  const prices = useMemo(() => {
    if (!selectedPackage) return { base: 0, addons: 0, transfer: 0, discount: 0, subtotal: 0, total: 0 };
    
    const base = selectedPackage.price * guests;

    let addonsTotal = 0;
    Object.entries(addonQuantities).forEach(([addonId, qty]) => {
      if (qty > 0) {
        const addon = promotionalAddons.find(p => p.id === addonId);
        if (addon) {
          addonsTotal += addon.price * qty;
        }
      }
    });

    const transferCost = transfer ? VVIP_TRANSFER_PRICE : 0;
    const subtotal = base + addonsTotal + transferCost;

    return {
      base,
      addons: addonsTotal,
      transfer: transferCost,
      discount: discountAmount,
      subtotal,
      total: Math.max(0, subtotal - discountAmount)
    };
  }, [selectedPackage, guests, addonQuantities, transfer, discountAmount]);

  // Format date for display
  const formatDisplayDate = (dateString: string) => {
    if (!dateString) return '';
    const [year, month, day] = dateString.split('-').map(Number);
    const dateObj = new Date(year, month - 1, day);
    return dateObj.toLocaleDateString('en-US', { 
      weekday: 'long',
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  // Format time for display
  const formatTime = (timeString: string) => {
    if (!timeString) return '';
    if (timeString === 'flexible') return '8:00 AM - 6:00 PM (Flexible)';
    const [hours, minutes] = timeString.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${String(minutes).padStart(2, '0')} ${period}`;
  };

  // Form validation
  const isCustomerFormValid = useMemo(() => {
    const emailValid = Boolean(email && email.includes('@'));
    const phoneValid = phone.length >= 8;
    const nameValid = Boolean(firstName.trim() && lastName.trim());
    return emailValid && phoneValid && nameValid;
  }, [email, phone, firstName, lastName]);

  // Validate promo code
  const validatePromoCode = async () => {
    if (!promoCodeInput.trim()) return;
    
    setPromoValidating(true);
    setPromoError('');
    
    try {
      const response = await fetch('/api/checkout/validate-promo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: promoCodeInput.trim(),
          orderTotal: prices.subtotal,
        }),
      });
      
      const data = await response.json();
      
      if (data.valid) {
        setAppliedPromo(data.promoCode);
        setDiscountAmount(data.discountAmount);
        setPromoCodeInput('');
      } else {
        setPromoError(data.error || 'Invalid promo code');
      }
    } catch {
      setPromoError('Failed to validate promo code');
    } finally {
      setPromoValidating(false);
    }
  };

  const removePromoCode = () => {
    setAppliedPromo(null);
    setDiscountAmount(0);
    setPromoError('');
  };

  // Create booking and payment intent
  const handleCreateBookingAndPay = async (): Promise<{ clientSecret: string; bookingRef: string } | null> => {
    if (!isCustomerFormValid) return null;
    
    setIsCreatingBooking(true);
    
    try {
      const response = await fetch('/api/checkout/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          packageId: selectedPackage?.id,
          date,
          time,
          guests,
          pickup: transfer,
          hotel,
          room: '',
          privateTransfer: transfer,
          privatePassengers: guests,
          additionalGuests: 0,
          promoAddons: addonQuantities,
          promoCodeId: appliedPromo?.id || null,
          discountAmount: discountAmount,
          customer: {
            firstName,
            lastName,
            email,
            phone,
            countryCode,
            specialRequests,
          },
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `Server error (${response.status})`);
      }

      if (data.clientSecret) {
        return {
          clientSecret: data.clientSecret,
          bookingRef: data.bookingRef,
        };
      } else {
        throw new Error(data.error || 'Failed to create payment');
      }
    } catch (error) {
      console.error('Booking creation error:', error);
      throw error;
    } finally {
      setIsCreatingBooking(false);
    }
  };

  // Redirect if no package selected
  if (!selectedPackage) {
    return (
      <main className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="max-w-lg mx-auto text-center px-4">
          <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-10 h-10 text-[#b1b94c]" />
          </div>
          <h1 className="text-2xl font-[family-name:var(--font-krona)] text-white mb-4 normal-case">
            No Booking Found
          </h1>
          <p className="text-white/60 mb-8">
            Please select a dining zone and complete the booking form first.
          </p>
          <Link href="/booking">
            <button className="px-8 py-4 bg-[#b1b94c] hover:bg-[#c4cc5a] text-black font-[family-name:var(--font-krona)] rounded-xl transition-colors">
              Go to Booking
            </button>
          </Link>
        </div>
      </main>
    );
  }

  const hasAddons = Object.values(addonQuantities).some(qty => qty > 0);

  return (
    <main className="min-h-screen bg-[#0a0a0a]">
      {/* Main Content */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <Link 
            href={editBookingUrl}
            className="inline-flex items-center gap-2 text-white/40 hover:text-[#b1b94c] transition-colors text-sm mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Booking</span>
          </Link>
          
          <div className="grid lg:grid-cols-5 gap-8">
            {/* Left Column - Forms */}
            <div className="lg:col-span-3 space-y-6">
              {/* Page Title - Mobile & Desktop */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between"
              >
                <div>
                  <h1 className="text-2xl md:text-3xl font-[family-name:var(--font-krona)] text-white normal-case mb-1">
                    Checkout
                  </h1>
                  <p className="text-white/40 text-sm">Complete your reservation securely</p>
                </div>
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-green-500/10 border border-green-500/20 rounded-full">
                  <Lock className="w-3.5 h-3.5 text-green-400" />
                  <span className="text-green-400 text-xs font-medium">SSL Secured</span>
                </div>
              </motion.div>
              
              {/* Booking Summary Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-[#111] rounded-3xl border border-white/10 overflow-hidden"
              >
                <div className="p-4 border-b border-white/10 flex items-center justify-between bg-white/5">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-[#b1b94c]" />
                    <h2 className="text-sm font-medium text-white/80 uppercase tracking-wider">
                      Your Reservation
                    </h2>
                  </div>
                  <Link 
                    href={editBookingUrl}
                    className="flex items-center gap-1.5 px-2.5 py-1 text-xs text-white/60 hover:text-[#b1b94c] hover:bg-white/5 rounded-lg transition-colors"
                  >
                    <Pencil className="w-3 h-3" />
                    Edit
                  </Link>
                </div>
                
                <div className="p-6">
                  {/* Package Info with Booking Details */}
                  <div className="flex gap-5">
                    {/* Package Image */}
                    <div className="relative w-28 h-28 rounded-2xl overflow-hidden flex-shrink-0 ring-2 ring-[#b1b94c]/30">
                      <Image
                        src={selectedPackage.image}
                        alt={selectedPackage.name}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      {selectedPackage.type === 'special' && (
                        <div className="absolute bottom-2 left-2">
                          <span className="px-2 py-0.5 bg-amber-500 text-black text-[10px] font-bold rounded-full flex items-center gap-1">
                            <Sparkles className="w-2.5 h-2.5" />
                            SPECIAL
                          </span>
                        </div>
                      )}
                    </div>
                    
                    {/* Package Details */}
                    <div className="flex-grow min-w-0">
                      <h3 className="text-xl font-[family-name:var(--font-krona)] text-white normal-case mb-3">
                        {selectedPackage.name}
                      </h3>
                      
                      {/* Booking Details Grid */}
                      <div className="grid grid-cols-2 gap-2">
                        <div className="flex items-center gap-2 px-3 py-2 bg-white/5 rounded-lg">
                          <Calendar className="w-4 h-4 text-[#b1b94c]" />
                          <div className="min-w-0">
                            <p className="text-[10px] text-white/40 uppercase tracking-wider">Date</p>
                            <p className="text-sm text-white font-medium truncate">{formatDisplayDate(date || '').split(',')[0]}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-2 bg-white/5 rounded-lg">
                          <Clock className="w-4 h-4 text-[#b1b94c]" />
                          <div className="min-w-0">
                            <p className="text-[10px] text-white/40 uppercase tracking-wider">Time</p>
                            <p className="text-sm text-white font-medium">{formatTime(time || '')}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-2 bg-white/5 rounded-lg">
                          <Users className="w-4 h-4 text-[#b1b94c]" />
                          <div className="min-w-0">
                            <p className="text-[10px] text-white/40 uppercase tracking-wider">Guests</p>
                            <p className="text-sm text-white font-medium">{guests} {guests === 1 ? 'Person' : 'People'}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-2 bg-white/5 rounded-lg">
                          <Car className="w-4 h-4 text-[#b1b94c]" />
                          <div className="min-w-0">
                            <p className="text-[10px] text-white/40 uppercase tracking-wider">Transfer</p>
                            <p className="text-sm text-white font-medium truncate">{transfer ? 'VVIP Transfer' : 'Self Arrange'}</p>
                          </div>
                        </div>
                      </div>
                      
                      {/* Hotel Info */}
                      {transfer && hotel && (
                        <div className="mt-2 flex items-center gap-2 px-3 py-2 bg-[#b1b94c]/10 rounded-lg border border-[#b1b94c]/20">
                          <MapPin className="w-4 h-4 text-[#b1b94c] flex-shrink-0" />
                          <div className="min-w-0">
                            <p className="text-[10px] text-[#b1b94c]/70 uppercase tracking-wider">Pickup Location</p>
                            <p className="text-sm text-white font-medium truncate">{hotel}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Add-ons Section */}
                  {hasAddons && (
                    <div className="mt-6 pt-6 border-t border-white/10">
                      <div className="flex items-center gap-2 mb-4">
                        <Gift className="w-4 h-4 text-[#b1b94c]" />
                        <span className="text-sm font-medium text-white">Add-ons & Extras</span>
                      </div>
                      <div className="space-y-2">
                        {Object.entries(addonQuantities).map(([addonId, qty]) => {
                          if (qty <= 0) return null;
                          const addon = promotionalAddons.find(p => p.id === addonId);
                          if (!addon) return null;
                          const IconComponent = addon.icon;
                          return (
                            <div 
                              key={addonId}
                              className="flex items-center justify-between p-3 bg-[#b1b94c]/10 rounded-xl border border-[#b1b94c]/20"
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-[#b1b94c]/20 rounded-lg flex items-center justify-center">
                                  <IconComponent className="w-4 h-4 text-[#b1b94c]" />
                                </div>
                                <div>
                                  <p className="text-white text-sm font-medium">{addon.name}</p>
                                  <p className="text-white/50 text-xs">Quantity: {qty}</p>
                                </div>
                              </div>
                              <span className="text-[#b1b94c] font-medium">
                                {formatPrice(addon.price * qty)}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>

              {/* Guest Details Form */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-3xl overflow-hidden shadow-lg"
              >
                <div className="p-5 border-b border-slate-200 bg-slate-50">
                  <div className="flex items-center gap-3">
                    <User className="w-5 h-5 text-[#8a9139]" />
                    <h2 className="text-lg font-[family-name:var(--font-krona)] text-slate-800 normal-case">
                      Guest Information
                    </h2>
                  </div>
                </div>
                
                <div className="p-6 space-y-5">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-slate-600 mb-2">First Name *</label>
                      <input
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="John"
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#b1b94c] focus:ring-2 focus:ring-[#b1b94c]/20"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-slate-600 mb-2">Last Name *</label>
                      <input
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        placeholder="Doe"
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#b1b94c] focus:ring-2 focus:ring-[#b1b94c]/20"
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm text-slate-600 mb-2">Email Address *</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="john@example.com"
                        className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#b1b94c] focus:ring-2 focus:ring-[#b1b94c]/20"
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm text-slate-600 mb-2">Phone Number *</label>
                    <div className="flex gap-3">
                      <CountryPhoneSelector
                        value={countryCode}
                        onChange={setCountryCode}
                        className="w-28"
                      />
                      <div className="relative flex-grow">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                          placeholder="812345678"
                          className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#b1b94c] focus:ring-2 focus:ring-[#b1b94c]/20"
                          required
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm text-slate-600 mb-2">Special Requests (Optional)</label>
                    <textarea
                      value={specialRequests}
                      onChange={(e) => setSpecialRequests(e.target.value)}
                      placeholder="Dietary requirements, celebrations, accessibility needs..."
                      rows={3}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#b1b94c] focus:ring-2 focus:ring-[#b1b94c]/20 resize-none"
                    />
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Right Column - Order Summary & Payment */}
            <div className="lg:col-span-2">
              <div className="sticky top-28">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-white rounded-3xl overflow-hidden shadow-lg"
                >
                  {/* Order Summary Header */}
                  <div className="p-5 bg-[#b1b94c]">
                    <h2 className="text-lg font-[family-name:var(--font-krona)] text-black normal-case">
                      Order Summary
                    </h2>
                  </div>
                  
                  <div className="p-6">
                    {/* Order Items */}
                    <div className="space-y-3">
                      {/* Base Package */}
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-slate-800 text-sm font-medium">{selectedPackage.name}</p>
                          <p className="text-slate-400 text-xs">{guests} {guests === 1 ? 'guest' : 'guests'} × {formatPrice(selectedPackage.price)}</p>
                        </div>
                        <span className="text-slate-800 font-medium">{formatPrice(prices.base)}</span>
                      </div>
                      
                      {/* Add-ons */}
                      {Object.entries(addonQuantities).map(([addonId, qty]) => {
                        if (qty <= 0) return null;
                        const addon = promotionalAddons.find(p => p.id === addonId);
                        if (!addon) return null;
                        return (
                          <div key={addonId} className="flex justify-between items-start">
                            <div>
                              <p className="text-slate-800 text-sm">{addon.name}</p>
                              <p className="text-slate-400 text-xs">{qty} × {formatPrice(addon.price)}</p>
                            </div>
                            <span className="text-green-600 font-medium">+{formatPrice(addon.price * qty)}</span>
                          </div>
                        );
                      })}
                      
                      {/* Transfer */}
                      {transfer && (
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-slate-800 text-sm">VVIP Transfer</p>
                            <p className="text-slate-400 text-xs">Luxury pickup service</p>
                          </div>
                          <span className="text-slate-800 font-medium">+{formatPrice(prices.transfer)}</span>
                        </div>
                      )}
                    </div>
                    
                    {/* Promo Code Section */}
                    <div className="mt-6 pt-6 border-t border-slate-200">
                      {appliedPromo ? (
                        <div className="flex items-center justify-between p-3 bg-green-50 rounded-xl border border-green-200">
                          <div className="flex items-center gap-2">
                            <Tag className="w-4 h-4 text-green-600" />
                            <div>
                              <span className="text-green-700 font-medium text-sm">{appliedPromo.code}</span>
                              <p className="text-green-600 text-xs">
                                {appliedPromo.discount_type === 'percentage' 
                                  ? `${appliedPromo.discount_value}% off` 
                                  : `${formatPrice(appliedPromo.discount_value)} off`}
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={removePromoCode}
                            className="p-1.5 text-green-600 hover:bg-green-100 rounded-lg transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <div>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={promoCodeInput}
                              onChange={(e) => setPromoCodeInput(e.target.value.toUpperCase())}
                              placeholder="Promo code"
                              className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm uppercase placeholder:normal-case placeholder:text-slate-400 focus:outline-none focus:border-[#b1b94c] focus:ring-2 focus:ring-[#b1b94c]/20"
                              onKeyDown={(e) => e.key === 'Enter' && validatePromoCode()}
                            />
                            <button
                              onClick={validatePromoCode}
                              disabled={promoValidating || !promoCodeInput.trim()}
                              className="px-4 py-2.5 bg-slate-100 text-slate-700 rounded-xl text-sm font-medium hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                              {promoValidating ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Apply'}
                            </button>
                          </div>
                          {promoError && (
                            <p className="text-red-500 text-xs mt-2">{promoError}</p>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Discount */}
                    {discountAmount > 0 && (
                      <div className="flex justify-between mt-4 text-green-600">
                        <span className="text-sm">Discount</span>
                        <span className="font-medium">-{formatPrice(discountAmount)}</span>
                      </div>
                    )}
                    
                    {/* Total */}
                    <div className="mt-6 pt-6 border-t border-slate-200">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-800 font-medium">Total</span>
                        <span className="text-3xl font-bold text-[#8a9139]">
                          {formatPrice(prices.total)}
                        </span>
                      </div>
                      <p className="text-slate-400 text-xs mt-1 text-right">Includes all taxes and fees</p>
                    </div>
                    
                    {/* Payment Section */}
                    <div className="mt-6 pt-6 border-t border-slate-200">
                      <div className="flex items-center gap-2 mb-4">
                        <CreditCard className="w-5 h-5 text-[#8a9139]" />
                        <h3 className="text-slate-800 font-medium">Payment Details</h3>
                      </div>
                      
                      <StripeCardProvider>
                        <EmbeddedCardForm
                          amount={prices.total}
                          isCustomerFormValid={isCustomerFormValid}
                          onSubmit={handleCreateBookingAndPay}
                          isCreatingBooking={isCreatingBooking}
                        />
                      </StripeCardProvider>
                      
                      <div className="flex items-center gap-2 p-3 bg-green-50 rounded-xl border border-green-200 mt-4">
                        <Lock className="w-4 h-4 text-green-600 flex-shrink-0" />
                        <span className="text-xs text-green-700">256-bit SSL encryption</span>
                      </div>
                    </div>
                    
                    {/* Trust badges */}
                    <div className="mt-6 pt-6 border-t border-slate-200">
                      <p className="text-slate-400 text-xs text-center mb-3">
                        Payment processed by <span className="text-[#8a9139] font-medium">ONEBOOKING</span>
                      </p>
                      <div className="flex items-center justify-center gap-4 text-slate-400 text-xs">
                        <span className="flex items-center gap-1">
                          <ShieldCheck className="w-4 h-4" />
                          Secure
                        </span>
                        <span className="flex items-center gap-1">
                          <Lock className="w-4 h-4" />
                          SSL
                        </span>
                        <span className="flex items-center gap-1">
                          <CheckCircle className="w-4 h-4" />
                          Verified
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-white/30 border-t-[#b1b94c] rounded-full animate-spin" />
      </main>
    }>
      <CheckoutContent />
    </Suspense>
  );
}
