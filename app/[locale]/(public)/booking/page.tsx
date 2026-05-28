'use client';

import { useState, useMemo, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useRouter } from '@/i18n/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { 
  Check, Calendar, Clock, Users, Minus, Plus, Car, Navigation, 
  MapPin, ShieldCheck, CalendarDays, ArrowRight, ArrowLeft, Hotel,
  Star, Sparkles, ChevronDown, Info, Gift, Music, Heart, Flame
} from 'lucide-react';
import { CalendarPicker, CustomSelect } from '@/components/ui';
import { packages } from '@/lib/data/packages';
import { formatPrice } from '@/lib/utils';
import { buildBangkokTimestamp, getZoneForPackage } from '@/lib/allotment/zones';

import { type Addon } from '@/lib/data/addons';

// Icon mapping for add-ons
const addonIconMap: Record<string, React.ElementType> = {
  'violin-dinner': Music,
  'saxophone-dinner': Music,
  'spark-fountain': Flame,
  'honeymoon-anniversary': Heart,
  'birthday-mini': Gift,
  'private-transfer': Car,
};

// Time slot configurations based on seat type
const PREMIUM_TIME_SLOTS = ['16:00', '19:00', '22:00']; // Monkey Dome, Monkey Nest
const SEMI_PREMIUM_TIME_SLOTS = ['19:00', '22:00']; // Monkey Hilltop, Bamboo Pavilion
const SPECIAL_PACKAGE_TIME_SLOTS = ['17:00', '18:00', '19:00', '20:00', '21:00', '22:00']; // Special packages
const NORMAL_TIME_SLOTS = ['10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00']; // All other seats

// Special package IDs (require 1 day advance booking)
const SPECIAL_PACKAGE_IDS = ['ultimate-dinner', 'ultimate-birthday', 'will-you-marry-me'];

// Helper to check if a package is a special package
const isSpecialPackage = (packageId: string | null): boolean => {
  if (!packageId) return false;
  return SPECIAL_PACKAGE_IDS.includes(packageId);
};

// Helper to check if booking date is at least 1 day in advance (for add-ons availability)
const isAdvanceBooking = (selectedDate: string | Date | null | undefined): boolean => {
  if (!selectedDate) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const bookingDate = new Date(selectedDate);
  if (isNaN(bookingDate.getTime())) return false;
  bookingDate.setHours(0, 0, 0, 0);
  const diffTime = bookingDate.getTime() - today.getTime();
  const diffDays = diffTime / (1000 * 60 * 60 * 24);
  return diffDays >= 1;
};

// Helper to get available time slots based on package
const getAvailableTimeSlots = (packageId: string | null): string[] => {
  if (!packageId) return NORMAL_TIME_SLOTS;
  
  // Premium seats: Monkey Dome, Monkey Nest
  if (packageId === 'monkey-dome' || packageId === 'monkey-nest') {
    return PREMIUM_TIME_SLOTS;
  }
  
  // Semi-premium seats: Monkey Hilltop, Bamboo Pavilion
  if (packageId === 'monkey-hilltop' || packageId === 'bamboo-pavilion') {
    return SEMI_PREMIUM_TIME_SLOTS;
  }
  
  // Special packages: 17:00 - 22:00 hourly
  if (isSpecialPackage(packageId)) {
    return SPECIAL_PACKAGE_TIME_SLOTS;
  }
  
  // All other seats: normal hourly slots
  return NORMAL_TIME_SLOTS;
};

// Helper to check if a time slot is bookable (at least 2 hours before)
const isTimeSlotBookable = (timeSlot: string, selectedDate: string): boolean => {
  if (!selectedDate) return true; // If no date selected, show all as enabled initially
  
  const now = new Date();
  const [hours, minutes] = timeSlot.split(':').map(Number);
  const slotDate = new Date(selectedDate);
  slotDate.setHours(hours, minutes, 0, 0);
  
  // Add 2 hours buffer to current time
  const minBookingTime = new Date(now.getTime() + 2 * 60 * 60 * 1000);
  
  return slotDate > minBookingTime;
};

const allBookablePackages = packages.filter(pkg => pkg.type === 'seat' || pkg.type === 'special');
const seatPackages = packages.filter(pkg => pkg.type === 'seat');
const specialPackages = packages.filter(pkg => pkg.type === 'special');

const VVIP_TRANSFER_PRICE = 2500;

// Helper to check if package is per-table pricing
const isPerTablePkg = (pkgId: string) => {
  return pkgId === 'monkey-dome' || pkgId === 'monkey-nest';
};

// Quick Select Grid Component
function QuickSelectGrid({ onSelect }: { onSelect: (id: string) => void }) {
  // Premium seats (Monkey Dome & Nest) first, then others
  const premiumSeats = seatPackages.filter(pkg => isPerTablePkg(pkg.id));
  const regularSeats = seatPackages.filter(pkg => !isPerTablePkg(pkg.id));
  
  return (
    <div className="mt-6 space-y-6">
      {/* Premium Seats Section */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <div className="w-2 h-2 bg-[#b1b94c] rounded-full" />
          <span className="text-sm font-medium text-[#b1b94c]">Premium Seats</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {premiumSeats.map((pkg) => (
            <div
              key={pkg.id}
              onClick={() => onSelect(pkg.id)}
              className="relative flex items-center gap-3 p-3 rounded-xl border-2 border-[#b1b94c]/40 bg-gradient-to-br from-[#b1b94c]/10 to-transparent cursor-pointer hover:border-[#b1b94c] hover:from-[#b1b94c]/20 transition-all group"
            >
              <div className="relative w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 border border-[#b1b94c]/30">
                <Image
                  src={pkg.image}
                  alt={pkg.name}
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
              <div className="flex-grow min-w-0">
                <h4 className="text-sm font-semibold text-white group-hover:text-[#b1b94c] transition-colors">
                  {pkg.name}
                </h4>
                <p className="text-[10px] text-white/50 line-clamp-1 mb-1">{pkg.shortDescription}</p>
                <div className="flex items-center gap-1">
                  <span className="text-xs font-bold text-[#b1b94c]">{formatPrice(pkg.price)}</span>
                  <span className="text-[10px] text-white/40">/ table (up to 4)</span>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-[#b1b94c]/50 group-hover:text-[#b1b94c] transition-colors flex-shrink-0" />
            </div>
          ))}
        </div>
      </div>

      {/* Regular Dining Seats Section */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <div className="w-2 h-2 bg-white/40 rounded-full" />
          <span className="text-sm font-medium text-white/60">More Seating Options</span>
          <span className="text-xs text-white/30">({regularSeats.length})</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {regularSeats.map((pkg) => (
            <div
              key={pkg.id}
              onClick={() => onSelect(pkg.id)}
              className="flex items-center gap-3 p-2.5 rounded-lg border border-white/10 bg-white/5 cursor-pointer hover:bg-white/10 hover:border-white/20 transition-all group"
            >
              <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                <Image
                  src={pkg.image}
                  alt={pkg.name}
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
              <div className="flex-grow min-w-0">
                <h4 className="text-xs font-medium text-white group-hover:text-[#b1b94c] transition-colors line-clamp-1">
                  {pkg.name}
                </h4>
                <div className="flex items-center gap-1">
                  <span className="text-[10px] font-semibold text-[#b1b94c]">฿500</span>
                  <span className="text-[10px] text-white/40">deposit / person</span>
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-white/30 -rotate-90 group-hover:text-[#b1b94c] transition-colors flex-shrink-0" />
            </div>
          ))}
        </div>
      </div>
      
      {/* Special Packages Section */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <div className="w-2 h-2 bg-amber-500 rounded-full" />
          <span className="text-sm font-medium text-amber-400">Special Packages</span>
          <span className="text-xs text-amber-400/50 ml-1">• Book 1 day ahead</span>
        </div>
        <div className="grid grid-cols-1 gap-3">
          {specialPackages.map((pkg) => (
            <div
              key={pkg.id}
              onClick={() => onSelect(pkg.id)}
              className="relative flex items-center gap-4 p-3 rounded-xl border border-amber-500/30 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent cursor-pointer hover:border-amber-500/50 hover:from-amber-500/15 transition-all group"
            >
              <div className="relative w-20 h-16 rounded-xl overflow-hidden flex-shrink-0 border border-amber-500/20">
                <Image
                  src={pkg.image}
                  alt={pkg.name}
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
              <div className="flex-grow min-w-0">
                <h4 className="text-sm font-semibold text-white group-hover:text-amber-400 transition-colors line-clamp-1">
                  {pkg.name}
                </h4>
                <p className="text-[10px] text-white/50 line-clamp-1 mb-1">{pkg.shortDescription}</p>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-amber-400">{formatPrice(pkg.price)}</span>
                  <span className="text-[10px] text-white/40">total package</span>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-amber-400/50 group-hover:text-amber-400 transition-colors flex-shrink-0" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function BookingContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const [selectedPackageId, setSelectedPackageId] = useState<string | null>(null);
  const selectedPackage = packages.find(p => p.id === selectedPackageId);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const packageParam = searchParams.get('package');
    if (packageParam) {
      const foundPackage = packages.find(p => p.id === packageParam || p.slug === packageParam);
      if (foundPackage) {
        setSelectedPackageId(foundPackage.id);
      }
    }
  }, [searchParams]);

  // Initialize date/time/guests/transfer/hotel/requests/addons from URL
  // params so the "Edit" link on the checkout page restores the
  // customer's previous booking selections instead of resetting them.
  const [selectedDate, setSelectedDate] = useState(() => searchParams.get('date') || '');
  const [selectedTime, setSelectedTime] = useState(() => searchParams.get('time') || '');
  
  // Get available time slots based on selected package
  const availableTimeSlots = useMemo(() => {
    return getAvailableTimeSlots(selectedPackageId);
  }, [selectedPackageId]);
  
  // Get minimum booking date based on package type (special packages require 1 day advance)
  const minBookingDate = useMemo(() => {
    const today = new Date();
    if (isSpecialPackage(selectedPackageId)) {
      // Special packages require at least 1 day in advance
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      return tomorrow.toISOString().split('T')[0];
    }
    return today.toISOString().split('T')[0];
  }, [selectedPackageId]);
  
  // Reset selected date if it's no longer valid for special packages
  useEffect(() => {
    if (selectedDate && isSpecialPackage(selectedPackageId)) {
      const selectedDateObj = new Date(selectedDate);
      const minDateObj = new Date(minBookingDate);
      if (selectedDateObj < minDateObj) {
        setSelectedDate('');
      }
    }
  }, [selectedPackageId, selectedDate, minBookingDate]);
  
  // Reset selected time when package changes and current time is not available
  useEffect(() => {
    if (selectedTime && !availableTimeSlots.includes(selectedTime)) {
      setSelectedTime('');
    }
  }, [selectedPackageId, availableTimeSlots, selectedTime]);
  const [guestCount, setGuestCount] = useState(() => {
    const g = parseInt(searchParams.get('guests') || '', 10);
    return Number.isFinite(g) && g > 0 ? g : 2;
  });
  const [needTransfer, setNeedTransfer] = useState(() => searchParams.get('transfer') === 'true');
  const [hotelName, setHotelName] = useState(() => searchParams.get('hotel') || '');
  const [specialRequests, setSpecialRequests] = useState(() => searchParams.get('requests') || '');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedAddons, setSelectedAddons] = useState<Record<string, number>>(() => {
    // URL format: "addonId:qty,addonId:qty"
    const addonsParam = searchParams.get('addons') || '';
    const result: Record<string, number> = {};
    if (addonsParam) {
      addonsParam.split(',').forEach((item) => {
        const [id, qty] = item.split(':');
        const n = parseInt(qty || '', 10);
        if (id && Number.isFinite(n) && n > 0) result[id] = n;
      });
    }
    return result;
  });

  // Track which addon descriptions are expanded
  const [expandedAddons, setExpandedAddons] = useState<Record<string, boolean>>({});

  // Promotional add-ons (fetched from API based on admin settings)
  const [promotionalAddons, setPromotionalAddons] = useState<Addon[]>([]);

  // Fetch enabled add-ons on mount
  useEffect(() => {
    const fetchAddons = async () => {
      try {
        const res = await fetch('/api/addons');
        const json = await res.json();
        if (res.ok) {
          setPromotionalAddons(json.addons || []);
        }
      } catch (err) {
        console.error('Failed to fetch addons:', err);
      }
    };
    fetchAddons();
  }, []);

  // Alcohol restriction dates
  const [alcoholRestrictedDates, setAlcoholRestrictedDates] = useState<string[]>([]);

  // Fetch alcohol restriction dates on mount
  useEffect(() => {
    const fetchAlcoholRestrictions = async () => {
      try {
        const res = await fetch('/api/alcohol-restrictions');
        const json = await res.json();
        if (res.ok) {
          setAlcoholRestrictedDates(json.dates || []);
        }
      } catch (err) {
        console.error('Failed to fetch alcohol restrictions:', err);
      }
    };
    fetchAlcoholRestrictions();
  }, []);

  // Check if selected date is alcohol restricted
  const isSelectedDateAlcoholRestricted = useMemo(() => {
    if (!selectedDate) return false;
    // Convert selected date to ISO format (YYYY-MM-DD) for comparison
    const dateStr = new Date(selectedDate).toISOString().split('T')[0];
    return alcoholRestrictedDates.includes(dateStr);
  }, [selectedDate, alcoholRestrictedDates]);

  const toggleAddonExpanded = (addonId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering the parent onClick (addon selection)
    setExpandedAddons(prev => ({ ...prev, [addonId]: !prev[addonId] }));
  };

  const updateAddonQuantity = (addonId: string, delta: number) => {
    setSelectedAddons(prev => {
      const current = prev[addonId] || 0;
      const newQty = Math.max(0, current + delta);
      return { ...prev, [addonId]: newQty };
    });
  };

  const handleGuestCountChange = (delta: number) => {
    const newCount = Math.max(1, Math.min(maxGuestsForPackage, guestCount + delta));
    setGuestCount(newCount);
  };

  // Per-table packages (fixed price regardless of guest count, max 4 guests)
  const isPerTablePackage = (pkgId: string | null) => {
    return pkgId === 'monkey-dome' || pkgId === 'monkey-nest';
  };

  // Fixed price packages (special packages + per-table packages)
  // These have fixed prices that don't change with guest count
  const isFixedPricePackage = (pkgId: string | null) => {
    return isPerTablePackage(pkgId) || isSpecialPackage(pkgId);
  };

  // Max guests: Monkey Dome = 4, Monkey Nest = 6, Bamboo Pavilion = 4, Exclusive Zone 7 = 4, Zone 7 = 50, Will You Marry Me = 2, Special packages = 10, Others = 20
  const getMaxGuestsForPackage = (pkgId: string | null) => {
    if (pkgId === 'monkey-dome') return 4;
    if (pkgId === 'monkey-nest') return 6;
    if (pkgId === 'bamboo-pavilion') return 4;
    if (pkgId === 'exclusive-romantic-zone-7') return 4;
    if (pkgId === 'zone-7') return 50;
    if (pkgId === 'zone-6') return 50;
    if (pkgId === 'rooftop-romantic') return 40;
    if (pkgId === 'indoor-seat' || pkgId === 'outdoor-seat') return 100;
    if (pkgId === 'will-you-marry-me') return 2;
    if (isSpecialPackage(pkgId)) return 10;
    return 20;
  };

  const maxGuestsForPackage = getMaxGuestsForPackage(selectedPackageId);
  const DEPOSIT_PER_PERSON = 500;

  const handleSelectPackage = (pkgId: string) => {
    setSelectedPackageId(pkgId);
    setIsDropdownOpen(false);
    // Reset guest count if switching to a package with lower max and current count exceeds limit
    const maxGuests = getMaxGuestsForPackage(pkgId);
    if (guestCount > maxGuests) {
      setGuestCount(maxGuests);
    }
  };

  const prices = useMemo(() => {
    if (!selectedPackage) return { base: 0, addons: 0, transfer: 0, total: 0, deposit: 0 };
    
    // For fixed price packages (Monkey Dome/Nest + Special packages): price is fixed
    // For other packages: price is per person
    const base = isFixedPricePackage(selectedPackageId) 
      ? selectedPackage.price // Fixed price for the package
      : selectedPackage.price * guestCount;
    
    const transfer = needTransfer ? VVIP_TRANSFER_PRICE : 0;
    
    // Deposit calculation:
    // Monkey Dome: 4,000 THB fixed
    // Monkey Nest: 5,000 THB fixed (all guests)
    // Other fixed price packages: Full package price as deposit
    // Others: THB 500 per person
    let deposit: number;
    if (selectedPackageId === 'monkey-dome') {
      deposit = 4000;
    } else if (selectedPackageId === 'monkey-nest') {
      deposit = 5000;
    } else if (isFixedPricePackage(selectedPackageId)) {
      deposit = selectedPackage.price;
    } else {
      deposit = DEPOSIT_PER_PERSON * guestCount;
    }
    
    let addons = 0;
    Object.entries(selectedAddons).forEach(([addonId, qty]) => {
      if (qty > 0) {
        const addon = promotionalAddons.find(a => a.id === addonId);
        if (addon) {
          addons += addon.price * qty;
        }
      }
    });

    return {
      base,
      addons,
      transfer,
      total: base + addons + transfer,
      deposit
    };
  }, [selectedPackage, selectedPackageId, guestCount, needTransfer, selectedAddons]);

  // ── Allotment availability check ──
  // Whenever the customer chooses a package + date + time, hit the public
  // availability API. If the zone is full, block "Proceed to Checkout".
  // Special packages (which don't map to a zone) skip this check.
  const [availabilityState, setAvailabilityState] = useState<'idle' | 'checking' | 'available' | 'full' | 'error' | 'not_applicable'>('idle');

  useEffect(() => {
    const zone = getZoneForPackage(selectedPackageId);
    if (!zone || !selectedDate || !selectedTime) {
      setAvailabilityState(zone ? 'idle' : 'not_applicable');
      return;
    }
    let cancelled = false;
    setAvailabilityState('checking');
    (async () => {
      try {
        const startIso = buildBangkokTimestamp(selectedDate, selectedTime);
        const url = `/api/allotment/availability?zone=${encodeURIComponent(zone.zoneId)}&start=${encodeURIComponent(startIso)}`;
        const res = await fetch(url, { cache: 'no-store' });
        const json = await res.json();
        if (cancelled) return;
        if (!res.ok) {
          setAvailabilityState('error');
          return;
        }
        setAvailabilityState(json.is_available ? 'available' : 'full');
      } catch {
        if (!cancelled) setAvailabilityState('error');
      }
    })();
    return () => { cancelled = true; };
  }, [selectedPackageId, selectedDate, selectedTime]);

  // Subscribe to allotment changes via Supabase Realtime so the badge updates
  // when other customers book or staff add manual blocks.
  useEffect(() => {
    const zone = getZoneForPackage(selectedPackageId);
    if (!zone || !selectedDate || !selectedTime) return;
    let active = true;
    let channel: { unsubscribe?: () => void } | null = null;
    (async () => {
      try {
        const { supabase } = await import('@/lib/supabase/client');
        const chan = supabase
          .channel(`allotment-${zone.zoneId}-${selectedDate}`)
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'tm_allotments', filter: `zone_id=eq.${zone.zoneId}` },
            () => {
              if (!active) return;
              // Trigger a re-check by toggling a no-op state — easier: just refetch directly.
              const startIso = buildBangkokTimestamp(selectedDate, selectedTime);
              fetch(`/api/allotment/availability?zone=${encodeURIComponent(zone.zoneId)}&start=${encodeURIComponent(startIso)}`, { cache: 'no-store' })
                .then(r => r.json())
                .then(j => { if (active) setAvailabilityState(j.is_available ? 'available' : 'full'); })
                .catch(() => { if (active) setAvailabilityState('error'); });
            }
          )
          .subscribe();
        channel = chan as { unsubscribe?: () => void };
      } catch (err) {
        console.warn('Realtime subscription failed', err);
      }
    })();
    return () => {
      active = false;
      try { channel?.unsubscribe?.(); } catch { /* noop */ }
    };
  }, [selectedPackageId, selectedDate, selectedTime]);

  const isFormValid = selectedPackageId && selectedDate && selectedTime && availabilityState !== 'full';

  const handleProceedToCheckout = () => {
    if (!isFormValid) return;
    
    // Build addons string (format: "id:qty,id:qty")
    const addonsStr = Object.entries(selectedAddons)
      .filter(([, qty]) => qty > 0)
      .map(([id, qty]) => `${id}:${qty}`)
      .join(',');
    
    const params = new URLSearchParams({
      package: selectedPackageId!,
      date: selectedDate,
      time: selectedTime,
      guests: guestCount.toString(),
      transfer: needTransfer.toString(),
      hotel: hotelName,
      requests: specialRequests,
    });
    
    if (addonsStr) {
      params.set('addons', addonsStr);
    }
    
    router.push(`/checkout?${params.toString()}`);
  };

  return (
    <main className="min-h-screen bg-[#0a0a0a]">
      {/* Hero Section */}
      <section className="relative min-h-[50vh] flex items-end justify-center overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/images/new/threemonkeys008.jpg"
            alt="Restaurant"
            fill
            className="object-cover"
            priority
            unoptimized
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-[#0a0a0a]" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-4 pt-24 sm:pt-32 pb-10 sm:pb-12 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-[#b1b94c]/10 border border-[#b1b94c]/30 rounded-full mb-4 sm:mb-6"
          >
            <CalendarDays className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#b1b94c]" />
            <span className="text-[#b1b94c] text-xs sm:text-sm font-medium">Reserve Your Experience</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-[family-name:var(--font-krona)] text-white mb-3 sm:mb-4 normal-case"
          >
            Book Your Table
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-white/60 text-sm sm:text-lg font-[family-name:var(--font-inter)] px-4"
          >
            Select your dining zone and complete your reservation
          </motion.p>
        </div>
      </section>

      {/* Booking Content */}
      <section className="py-10 sm:py-16 -mt-10 sm:-mt-20 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
            {/* Left Column - Package Selection */}
            <div className="lg:col-span-2 space-y-5 sm:space-y-6">
              {/* Package Selector */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-[#111] rounded-2xl sm:rounded-3xl border border-white/10"
              >
                <div className="p-5 sm:p-6 border-b border-white/10">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 bg-[#b1b94c] rounded-lg flex items-center justify-center text-black font-bold text-sm flex-shrink-0">
                      1
                    </div>
                    <h2 className="text-lg sm:text-xl font-[family-name:var(--font-krona)] text-white normal-case">
                      Select Your Seat or Package
                    </h2>
                  </div>
                  <p className="text-white/50 text-xs sm:text-sm ml-11">Choose from our dining zones or special packages</p>
                </div>

                <div className="p-4 sm:p-6">
                  {/* Selected Package Display */}
                  <div className="relative">
                    <button
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      className={`w-full p-4 rounded-2xl border-2 transition-all text-left ${
                        selectedPackage 
                          ? 'border-[#b1b94c] bg-[#b1b94c]/5' 
                          : 'border-white/20 bg-white/5 hover:border-white/30'
                      }`}
                    >
                      {selectedPackage ? (
                        <div className="flex items-center gap-3 sm:gap-4">
                          <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden flex-shrink-0">
                            <Image
                              src={selectedPackage.image}
                              alt={selectedPackage.name}
                              fill
                              className="object-cover"
                              unoptimized
                            />
                          </div>
                          <div className="flex-grow min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              {selectedPackage.popular && (
                                <span className="px-2 py-0.5 bg-[#b1b94c] text-black text-[10px] sm:text-xs font-medium rounded-full flex items-center gap-1">
                                  <Star className="w-3 h-3" />
                                  Popular
                                </span>
                              )}
                            </div>
                            <h3 className="text-base sm:text-lg font-[family-name:var(--font-krona)] text-white normal-case line-clamp-1">
                              {selectedPackage.name}
                            </h3>
                            <p className="text-white/50 text-xs sm:text-sm line-clamp-1">
                              {selectedPackage.shortDescription}
                            </p>
                          </div>
                          <div className="text-right flex-shrink-0">
                            {selectedPackage.type === 'seat' ? (
                              <>
                                <div className="text-[10px] text-white/40 uppercase tracking-wider">Deposit</div>
                                {selectedPackage.id === 'monkey-dome' ? (
                                  <>
                                    <div className="text-xl font-bold text-[#b1b94c]">฿4,000</div>
                                    <div className="text-xs text-white/40">/ table (max 4)</div>
                                  </>
                                ) : selectedPackage.id === 'monkey-nest' ? (
                                  <>
                                    <div className="text-xl font-bold text-[#b1b94c]">฿5,000</div>
                                    <div className="text-xs text-white/40">/ table (max 6)</div>
                                  </>
                                ) : selectedPackage.id === 'bamboo-pavilion' ? (
                                  <>
                                    <div className="text-xl font-bold text-[#b1b94c]">฿500</div>
                                    <div className="text-xs text-white/40">/ person (max 4)</div>
                                  </>
                                ) : selectedPackage.id === 'exclusive-romantic-zone-7' ? (
                                  <>
                                    <div className="text-xl font-bold text-[#b1b94c]">฿500</div>
                                    <div className="text-xs text-white/40">/ person (max 4)</div>
                                  </>
                                ) : selectedPackage.id === 'zone-7' ? (
                                  <>
                                    <div className="text-xl font-bold text-[#b1b94c]">฿500</div>
                                    <div className="text-xs text-white/40">/ person (up to 50)</div>
                                  </>
                                ) : selectedPackage.id === 'zone-6' ? (
                                  <>
                                    <div className="text-xl font-bold text-[#b1b94c]">฿500</div>
                                    <div className="text-xs text-white/40">/ person (up to 50)</div>
                                  </>
                                ) : selectedPackage.id === 'rooftop-romantic' ? (
                                  <>
                                    <div className="text-xl font-bold text-[#b1b94c]">฿500</div>
                                    <div className="text-xs text-white/40">/ person (up to 40)</div>
                                  </>
                                ) : selectedPackage.id === 'monkey-hilltop' ? (
                                  <>
                                    <div className="text-xl font-bold text-[#b1b94c]">฿500</div>
                                    <div className="text-xs text-white/40">/ person (2-4)</div>
                                  </>
                                ) : selectedPackage.id === 'indoor-seat' || selectedPackage.id === 'outdoor-seat' ? (
                                  <>
                                    <div className="text-xl font-bold text-[#b1b94c]">฿500</div>
                                    <div className="text-xs text-white/40">/ person (open)</div>
                                  </>
                                ) : (
                                  <>
                                    <div className="text-xl font-bold text-[#b1b94c]">฿500</div>
                                    <div className="text-xs text-white/40">/ person</div>
                                  </>
                                )}
                              </>
                            ) : (
                              <>
                                <div className="text-[10px] text-white/40 uppercase tracking-wider">Package</div>
                                <div className="text-xl font-bold text-[#b1b94c]">{formatPrice(selectedPackage.price)}</div>
                                <div className="text-xs text-white/40">total</div>
                              </>
                            )}
                          </div>
                          <ChevronDown className={`w-5 h-5 text-white/50 transition-transform flex-shrink-0 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                        </div>
                      ) : (
                        <div className="flex items-center justify-between py-2">
                          <span className="text-white/50">Select a dining zone...</span>
                          <ChevronDown className={`w-5 h-5 text-white/50 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                        </div>
                      )}
                    </button>

                    {/* Dropdown Menu */}
                    <AnimatePresence>
                      {isDropdownOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="absolute z-50 w-full mt-2 rounded-2xl border border-white/10 bg-[#1a1a1a] shadow-2xl max-h-[500px] overflow-y-auto"
                        >
                          {/* Dining Seats Section */}
                          <div className="sticky top-0 z-10 px-4 py-3 bg-[#1a1a1a] border-b border-white/10">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-[#b1b94c] rounded-full" />
                              <span className="text-xs font-medium text-[#b1b94c] uppercase tracking-wider">Dining Seats</span>
                              <span className="text-xs text-white/30">({seatPackages.length})</span>
                            </div>
                          </div>
                          {seatPackages.map((pkg) => (
                            <div
                              key={pkg.id}
                              onClick={() => handleSelectPackage(pkg.id)}
                              className={`p-4 cursor-pointer transition-all border-b border-white/5 ${
                                selectedPackageId === pkg.id 
                                  ? 'bg-[#b1b94c]/10 ring-1 ring-[#b1b94c]/30' 
                                  : 'hover:bg-white/5'
                              }`}
                            >
                              <div className="flex gap-4">
                                <div className="relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0">
                                  <Image
                                    src={pkg.image}
                                    alt={pkg.name}
                                    fill
                                    className="object-cover"
                                    unoptimized
                                  />
                                  {pkg.popular && (
                                    <div className="absolute top-1 left-1 px-1.5 py-0.5 bg-[#b1b94c] rounded-full flex items-center gap-1">
                                      <Star className="w-2.5 h-2.5 text-black fill-current" />
                                      <span className="text-black text-[9px] font-semibold">Popular</span>
                                    </div>
                                  )}
                                </div>
                                <div className="flex-grow min-w-0">
                                  <h3 className="text-sm font-[family-name:var(--font-krona)] text-white mb-1 normal-case">
                                    {pkg.name}
                                  </h3>
                                  <p className="text-[11px] text-white/40 mb-2 line-clamp-1">{pkg.shortDescription}</p>
                                  {/* Feature Tags */}
                                  <div className="flex flex-wrap gap-1">
                                    {pkg.features.slice(0, 3).map((feature, idx) => (
                                      <span 
                                        key={idx}
                                        className="px-1.5 py-0.5 bg-white/5 rounded text-white/50 text-[9px]"
                                      >
                                        {feature}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                                <div className="flex flex-col items-end justify-between flex-shrink-0">
                                  {selectedPackageId === pkg.id && (
                                    <div className="w-5 h-5 bg-[#b1b94c] rounded-full flex items-center justify-center">
                                      <Check className="w-3 h-3 text-black" />
                                    </div>
                                  )}
                                  <div className="text-right mt-auto">
                                    <span className="text-[10px] text-white/40 uppercase tracking-wider block">Deposit</span>
                                    {pkg.id === 'monkey-dome' ? (
                                      <>
                                        <span className="text-base font-bold text-[#b1b94c]">฿4,000</span>
                                        <span className="text-white/30 text-[9px] block">/ table (max 4)</span>
                                      </>
                                    ) : pkg.id === 'monkey-nest' ? (
                                      <>
                                        <span className="text-base font-bold text-[#b1b94c]">฿5,000</span>
                                        <span className="text-white/30 text-[9px] block">/ table (max 6)</span>
                                      </>
                                    ) : pkg.id === 'bamboo-pavilion' ? (
                                      <>
                                        <span className="text-base font-bold text-[#b1b94c]">฿500</span>
                                        <span className="text-white/30 text-[9px] block">/ person (max 4)</span>
                                      </>
                                    ) : pkg.id === 'exclusive-romantic-zone-7' ? (
                                      <>
                                        <span className="text-base font-bold text-[#b1b94c]">฿500</span>
                                        <span className="text-white/30 text-[9px] block">/ person (max 4)</span>
                                      </>
                                    ) : pkg.id === 'zone-7' ? (
                                      <>
                                        <span className="text-base font-bold text-[#b1b94c]">฿500</span>
                                        <span className="text-white/30 text-[9px] block">/ person (up to 50)</span>
                                      </>
                                    ) : pkg.id === 'zone-6' ? (
                                      <>
                                        <span className="text-base font-bold text-[#b1b94c]">฿500</span>
                                        <span className="text-white/30 text-[9px] block">/ person (up to 50)</span>
                                      </>
                                    ) : pkg.id === 'rooftop-romantic' ? (
                                      <>
                                        <span className="text-base font-bold text-[#b1b94c]">฿500</span>
                                        <span className="text-white/30 text-[9px] block">/ person (up to 40)</span>
                                      </>
                                    ) : pkg.id === 'monkey-hilltop' ? (
                                      <>
                                        <span className="text-base font-bold text-[#b1b94c]">฿500</span>
                                        <span className="text-white/30 text-[9px] block">/ person (2-4)</span>
                                      </>
                                    ) : pkg.id === 'indoor-seat' || pkg.id === 'outdoor-seat' ? (
                                      <>
                                        <span className="text-base font-bold text-[#b1b94c]">฿500</span>
                                        <span className="text-white/30 text-[9px] block">/ person (open)</span>
                                      </>
                                    ) : (
                                      <>
                                        <span className="text-base font-bold text-[#b1b94c]">฿500</span>
                                        <span className="text-white/30 text-[9px] block">/ person</span>
                                      </>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}

                          {/* Special Packages Section */}
                          <div className="sticky top-0 z-10 px-4 py-3 bg-[#1a1a1a] border-b border-white/10 border-t">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-amber-500 rounded-full" />
                              <span className="text-xs font-medium text-amber-400 uppercase tracking-wider">Special Packages</span>
                              <span className="text-xs text-white/30">({specialPackages.length})</span>
                            </div>
                          </div>
                          {specialPackages.map((pkg) => (
                            <div
                              key={pkg.id}
                              onClick={() => handleSelectPackage(pkg.id)}
                              className={`p-4 cursor-pointer transition-all border-b border-white/5 last:border-b-0 ${
                                selectedPackageId === pkg.id 
                                  ? 'bg-amber-500/10 ring-1 ring-amber-500/30' 
                                  : 'hover:bg-white/5'
                              }`}
                            >
                              <div className="flex gap-4">
                                <div className="relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0">
                                  <Image
                                    src={pkg.image}
                                    alt={pkg.name}
                                    fill
                                    className="object-cover"
                                    unoptimized
                                  />
                                  {pkg.featured && (
                                    <div className="absolute top-1 left-1 px-1.5 py-0.5 bg-amber-500 rounded-full flex items-center gap-1">
                                      <Sparkles className="w-2.5 h-2.5 text-black" />
                                      <span className="text-black text-[9px] font-semibold">Special</span>
                                    </div>
                                  )}
                                </div>
                                <div className="flex-grow min-w-0">
                                  <h3 className="text-sm font-[family-name:var(--font-krona)] text-white mb-1 normal-case">
                                    {pkg.name}
                                  </h3>
                                  <p className="text-[11px] text-white/40 mb-2 line-clamp-1">{pkg.shortDescription}</p>
                                  {/* Feature Tags */}
                                  <div className="flex flex-wrap gap-1">
                                    {pkg.features.slice(0, 3).map((feature, idx) => (
                                      <span 
                                        key={idx}
                                        className="px-1.5 py-0.5 bg-amber-500/10 rounded text-amber-400/70 text-[9px]"
                                      >
                                        {feature}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                                <div className="flex flex-col items-end justify-between flex-shrink-0">
                                  {selectedPackageId === pkg.id && (
                                    <div className="w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center">
                                      <Check className="w-3 h-3 text-black" />
                                    </div>
                                  )}
                                  <div className="text-right mt-auto">
                                    <span className="text-[10px] text-white/40 uppercase tracking-wider block">Package</span>
                                    <span className="text-base font-bold text-amber-400">{formatPrice(pkg.price)}</span>
                                    <span className="text-white/30 text-[9px] block">total</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Quick Select Grid */}
                  {!selectedPackage && (
                    <QuickSelectGrid onSelect={handleSelectPackage} />
                  )}
                </div>
              </motion.div>

              {/* Date & Time Selection */}
              <AnimatePresence>
                {selectedPackage && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="bg-[#111] rounded-3xl border border-white/10"
                  >
                    <div className="p-6 border-b border-white/10">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 bg-[#b1b94c] rounded-lg flex items-center justify-center text-black font-bold text-sm flex-shrink-0">
                          2
                        </div>
                        <h2 className="text-lg sm:text-xl font-[family-name:var(--font-krona)] text-white normal-case">
                          Choose Date & Time
                        </h2>
                      </div>
                      <p className="text-white/50 text-xs sm:text-sm ml-11">Select your preferred dining schedule</p>
                    </div>

                    <div className="p-4 sm:p-6">
                      <div className="grid md:grid-cols-2 gap-5 sm:gap-6 items-stretch">
                        {/* Date Picker */}
                        <div className="relative z-30">
                          <label className="block text-sm font-medium text-white/70 mb-3 flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-[#b1b94c]" />
                            Select Date
                          </label>
                          <CalendarPicker
                            value={selectedDate}
                            onChange={setSelectedDate}
                            minDate={minBookingDate}
                            restrictedDates={alcoholRestrictedDates}
                          />
                          {isSpecialPackage(selectedPackageId) && (
                            <p className="text-amber-400/70 text-xs mt-2 flex items-center gap-1.5">
                              <Info className="w-3.5 h-3.5" />
                              Special packages require at least 1 day advance booking
                            </p>
                          )}
                        </div>

                        {/* Time Picker - Single dropdown based on seat type */}
                        <div>
                          <label className="block text-sm font-medium text-white/70 mb-3 flex items-center gap-2">
                            <Clock className="w-4 h-4 text-[#b1b94c]" />
                            Select Time
                            {(selectedPackageId === 'monkey-dome' || selectedPackageId === 'monkey-nest' ||
                              selectedPackageId === 'monkey-hilltop' || selectedPackageId === 'bamboo-pavilion' ||
                              selectedPackageId === 'exclusive-romantic-zone-7' || selectedPackageId === 'zone-7' ||
                              selectedPackageId === 'zone-6' || selectedPackageId === 'rooftop-romantic' ||
                              selectedPackageId === 'indoor-seat' || selectedPackageId === 'outdoor-seat' ||
                              isSpecialPackage(selectedPackageId)) && (
                              <span className="text-white/40 text-xs ml-1">
                                ({availableTimeSlots.length} time slots available)
                              </span>
                            )}
                          </label>
                          <CustomSelect
                            value={selectedTime}
                            onChange={setSelectedTime}
                            placeholder="Select time"
                            className="w-full"
                            options={availableTimeSlots.map((timeSlot) => {
                              const [hourStr] = timeSlot.split(':');
                              const hourNum = parseInt(hourStr);
                              const display12h = hourNum > 12 ? hourNum - 12 : (hourNum === 0 ? 12 : hourNum);
                              const ampm = hourNum >= 12 ? 'PM' : 'AM';
                              const isBookable = isTimeSlotBookable(timeSlot, selectedDate);
                              
                              return { 
                                value: timeSlot, 
                                label: `${timeSlot} (${display12h}:00 ${ampm})${!isBookable ? ' - Not available' : ''}`,
                                disabled: !isBookable
                              };
                            })}
                          />
                          {isSpecialPackage(selectedPackageId) && (
                            <p className="text-amber-400/70 text-xs mt-2 flex items-center gap-1.5">
                              <Info className="w-3.5 h-3.5" />
                              Special packages available from 5:00 PM - 10:00 PM
                            </p>
                          )}
                          {selectedDate && !isSpecialPackage(selectedPackageId) && (
                            <p className="text-white/40 text-xs mt-2 flex items-center gap-1">
                              <Info className="w-3 h-3" />
                              Bookings must be made at least 2 hours in advance
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Alcohol Restriction Notice */}
                      {isSelectedDateAlcoholRestricted && (
                        <div className="mt-4 bg-amber-500/10 border border-amber-500/30 rounded-xl p-4">
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 w-8 h-8 bg-amber-500/20 rounded-lg flex items-center justify-center">
                              <Info className="w-4 h-4 text-amber-400" />
                            </div>
                            <div>
                              <h4 className="text-amber-400 font-semibold text-sm mb-1">Alcohol Sale Notice</h4>
                              <p className="text-white/70 text-xs leading-relaxed">
                                Alcoholic beverages will not be sold on this date due to local regulations / public holiday.
                              </p>
                              <p className="text-white/50 text-xs mt-2 leading-relaxed">
                                If your package includes sparkling wine or alcohol, it will be replaced with a non-alcoholic option from the restaurant&apos;s selected menu only.
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="p-4 sm:p-6 pt-0">
                      <div className="grid md:grid-cols-2 gap-5 sm:gap-6 items-stretch">
                        {/* Number of Persons */}
                        <div>
                          <label className="block text-sm font-medium text-white/70 mb-3">
                            <span className="flex items-center gap-2 flex-wrap">
                              <span className="flex items-center gap-2">
                                <Users className="w-4 h-4 text-[#b1b94c] flex-shrink-0" />
                                Number of Persons
                              </span>
                              {(() => {
                                const hint = selectedPackageId === 'monkey-dome'
                                  ? 'Max 4 per table'
                                  : selectedPackageId === 'monkey-nest'
                                  ? 'Max 6 per table'
                                  : selectedPackageId === 'bamboo-pavilion'
                                  ? 'Max 4 persons'
                                  : selectedPackageId === 'exclusive-romantic-zone-7'
                                  ? 'Max 4 persons'
                                  : selectedPackageId === 'zone-7'
                                  ? 'Up to 50 persons'
                                  : selectedPackageId === 'zone-6'
                                  ? 'Up to 50 persons'
                                  : selectedPackageId === 'rooftop-romantic'
                                  ? 'Up to 40 persons'
                                  : selectedPackageId === 'monkey-hilltop'
                                  ? '2-4 persons'
                                  : selectedPackageId === 'indoor-seat' || selectedPackageId === 'outdoor-seat'
                                  ? 'Open seating'
                                  : isSpecialPackage(selectedPackageId)
                                  ? 'Max 10 persons'
                                  : '';
                                return hint ? (
                                  <span className="text-white/40 text-xs">({hint})</span>
                                ) : null;
                              })()}
                            </span>
                          </label>
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => handleGuestCountChange(-1)}
                              disabled={guestCount <= 1}
                              className="w-12 h-12 rounded-xl bg-white/5 border-2 border-white/10 flex items-center justify-center hover:bg-white/10 hover:border-[#b1b94c]/50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                            >
                              <Minus className="w-5 h-5 text-white/70" />
                            </button>
                            <div className="flex-1 h-12 rounded-xl bg-white/5 border-2 border-white/10 flex items-center justify-center">
                              <span className="text-xl font-bold text-white">{guestCount}</span>
                              <span className="text-white/50 ml-2 text-sm">{guestCount === 1 ? 'person' : 'persons'}</span>
                            </div>
                            <button
                              onClick={() => handleGuestCountChange(1)}
                              disabled={guestCount >= maxGuestsForPackage}
                              className="w-12 h-12 rounded-xl bg-white/5 border-2 border-white/10 flex items-center justify-center hover:bg-white/10 hover:border-[#b1b94c]/50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                            >
                              <Plus className="w-5 h-5 text-white/70" />
                            </button>
                          </div>
                          {/* Deposit Display */}
                          {selectedPackage && (
                            <motion.div 
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="mt-4 relative overflow-hidden rounded-xl bg-gradient-to-r from-[#b1b94c]/5 to-[#b1b94c]/10 border border-[#b1b94c]/20"
                            >
                              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxjaXJjbGUgZmlsbD0iI2IxYjk0YyIgZmlsbC1vcGFjaXR5PSIwLjAzIiBjeD0iMjAiIGN5PSIyMCIgcj0iMiIvPjwvZz48L3N2Zz4=')] opacity-50" />
                              <div className="relative flex items-center gap-3 p-3">
                                <div className="w-10 h-10 rounded-lg bg-[#b1b94c]/20 flex items-center justify-center flex-shrink-0">
                                  <ShieldCheck className="w-5 h-5 text-[#b1b94c]" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-baseline gap-2">
                                    <span className="text-white/60 text-xs uppercase tracking-wide">Deposit</span>
                                    <span className="text-[#b1b94c] font-bold text-lg">{formatPrice(prices.deposit)}</span>
                                  </div>
                                  <p className="text-white/40 text-xs truncate">
                                    {selectedPackageId === 'monkey-dome' 
                                      ? 'Fixed rate (max 4 guests)'
                                      : selectedPackageId === 'monkey-nest'
                                      ? 'Fixed rate (max 6 guests)'
                                      : isFixedPricePackage(selectedPackageId) 
                                      ? 'Fixed rate package' 
                                      : `฿${DEPOSIT_PER_PERSON} × ${guestCount} ${guestCount === 1 ? 'person' : 'persons'}`}
                                  </p>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </div>

                        {/* Special Requests */}
                        <div className="flex flex-col h-full">
                          <label className="block text-sm font-medium text-white/70 mb-2 flex items-center gap-2">
                            <Info className="w-4 h-4 text-[#b1b94c]" />
                            Special Requests (Optional)
                          </label>
                          {selectedPackage?.id === 'ultimate-dinner' && (
                            <div className="mb-3 p-3 bg-[#b1b94c]/10 border border-[#b1b94c]/30 rounded-xl">
                              <div className="flex items-start gap-2">
                                <Car className="w-4 h-4 text-[#b1b94c] mt-0.5 flex-shrink-0" />
                                <p className="text-xs text-[#b1b94c]">
                                  <span className="font-semibold">Transfer included:</span> Please provide your hotel name or pickup address for the complimentary round-trip transfer service.
                                </p>
                              </div>
                            </div>
                          )}
                          <textarea
                            value={specialRequests}
                            onChange={(e) => setSpecialRequests(e.target.value)}
                            placeholder={selectedPackage?.id === 'ultimate-dinner' 
                              ? "Please enter your hotel name or pickup address for transfer, plus any dietary requirements or special requests..."
                              : "Dietary requirements, celebrations, accessibility needs..."
                            }
                            className="w-full flex-1 min-h-[120px] px-4 py-3 bg-white/5 border-2 border-white/10 rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-[#b1b94c] hover:border-white/20 transition-all resize-none text-sm"
                          />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Add-ons & Promotions - Only available for advance bookings (at least 1 day) */}
              <AnimatePresence>
                {selectedPackage && selectedDate && isAdvanceBooking(selectedDate) && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="bg-[#111] rounded-3xl border border-white/10"
                  >
                    <div className="p-5 sm:p-6 border-b border-white/10">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-10 h-10 bg-gradient-to-br from-[#b1b94c] to-[#8a9139] rounded-xl flex items-center justify-center flex-shrink-0">
                            <Gift className="w-5 h-5 text-black" />
                          </div>
                          <div className="min-w-0">
                            <h2 className="text-lg sm:text-xl font-[family-name:var(--font-krona)] text-white normal-case">
                              Add On &amp; Promotion
                            </h2>
                            <p className="text-white/50 text-xs sm:text-sm">Enhance your experience with special add-ons</p>
                          </div>
                        </div>
                        <div className="self-start sm:self-auto inline-flex items-center px-2.5 py-1 bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 rounded-full flex-shrink-0">
                          <span className="text-amber-400 text-[10px] sm:text-xs font-medium whitespace-nowrap">Advance Booking Only</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-6">
                      {/* First two items - 2 column grid (Violin & Saxophone) */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        {promotionalAddons.slice(0, 2).map((addon, index) => {
                          const qty = selectedAddons[addon.id] || 0;
                          const isSelected = qty > 0;
                          return (
                            <motion.div
                              key={addon.id}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.1 }}
                              onClick={() => updateAddonQuantity(addon.id, isSelected ? -1 : 1)}
                              className={`relative group rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 ${
                                isSelected 
                                  ? 'ring-2 ring-[#b1b94c] bg-[#b1b94c]/5' 
                                  : 'bg-white/5 hover:bg-white/10 border border-white/10'
                              }`}
                            >
                              {/* Image */}
                              <div className="relative h-40 overflow-hidden">
                                <Image
                                  src={addon.image}
                                  alt={addon.name}
                                  fill
                                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                                  unoptimized
                                />
                              </div>
                              
                              {/* Content */}
                              <div className="p-4">
                                <h4 className="text-base font-bold text-white mb-1">
                                  {addon.name}
                                </h4>
                                <div className="mb-3">
                                  <p className={`text-white/50 text-sm leading-relaxed transition-all duration-300 ${
                                    expandedAddons[addon.id] ? '' : 'line-clamp-2'
                                  }`}>
                                    {addon.description}
                                  </p>
                                  {addon.description.length > 80 && (
                                    <button
                                      type="button"
                                      onClick={(e) => toggleAddonExpanded(addon.id, e)}
                                      className="text-[#b1b94c] text-xs font-medium mt-1 hover:underline"
                                    >
                                      {expandedAddons[addon.id] ? 'Show less' : 'Read more'}
                                    </button>
                                  )}
                                </div>
                                
                                <div className="flex items-center justify-between">
                                  <div className="flex items-baseline gap-1">
                                    <span className="text-xl font-bold text-[#b1b94c]">
                                      {addon.price.toLocaleString()}
                                    </span>
                                    <span className="text-white/50 text-sm">THB</span>
                                  </div>
                                </div>
                                
                                {/* Checkbox */}
                                <label className="flex items-center gap-2 mt-3 cursor-pointer">
                                  <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                                    isSelected 
                                      ? 'bg-[#b1b94c] border-[#b1b94c]' 
                                      : 'border-white/30 bg-transparent'
                                  }`}>
                                    {isSelected && <Check className="w-3 h-3 text-black" />}
                                  </div>
                                  <span className="text-white/70 text-sm">add this to my booking</span>
                                </label>
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>
                      
                      {/* Remaining items - full width (hidden for ultimate-dinner package) */}
                      {selectedPackage?.id !== 'ultimate-dinner' && (
                      <div className="space-y-4">
                        {promotionalAddons.slice(2).map((addon, index) => {
                          const qty = selectedAddons[addon.id] || 0;
                          const isSelected = qty > 0;
                          return (
                            <motion.div
                              key={addon.id}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: (index + 2) * 0.1 }}
                              onClick={() => updateAddonQuantity(addon.id, isSelected ? -1 : 1)}
                              className={`relative group rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 ${
                                isSelected 
                                  ? 'ring-2 ring-[#b1b94c] bg-[#b1b94c]/5' 
                                  : 'bg-white/5 hover:bg-white/10 border border-white/10'
                              }`}
                            >
                              <div className="flex">
                                {/* Image Section - 40% width */}
                                <div className="relative w-[40%] min-h-[160px] flex-shrink-0 overflow-hidden">
                                  <Image
                                    src={addon.image}
                                    alt={addon.name}
                                    fill
                                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                                    unoptimized
                                  />
                                </div>

                                {/* Content Section - 60% width */}
                                <div className="flex-grow p-4 w-[60%]">
                                  <h4 className="text-base font-bold text-white mb-1">
                                    {addon.name}
                                  </h4>
                                  <div className="mb-3">
                                    <p className={`text-white/50 text-sm leading-relaxed transition-all duration-300 ${
                                      expandedAddons[addon.id] ? '' : 'line-clamp-2'
                                    }`}>
                                      {addon.description}
                                    </p>
                                    {addon.description.length > 80 && (
                                      <button
                                        type="button"
                                        onClick={(e) => toggleAddonExpanded(addon.id, e)}
                                        className="text-[#b1b94c] text-xs font-medium mt-1 hover:underline"
                                      >
                                        {expandedAddons[addon.id] ? 'Show less' : 'Read more'}
                                      </button>
                                    )}
                                  </div>
                                  
                                  <div className="flex items-baseline gap-1 mb-3">
                                    <span className="text-xl font-bold text-[#b1b94c]">
                                      {addon.price.toLocaleString()}
                                    </span>
                                    <span className="text-white/50 text-sm">THB</span>
                                  </div>
                                  
                                  {/* Checkbox */}
                                  <label className="flex items-center gap-2 cursor-pointer">
                                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                                      isSelected 
                                        ? 'bg-[#b1b94c] border-[#b1b94c]' 
                                        : 'border-white/30 bg-transparent'
                                    }`}>
                                      {isSelected && <Check className="w-3 h-3 text-black" />}
                                    </div>
                                    <span className="text-white/70 text-sm">add this to my booking</span>
                                  </label>
                                </div>
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

            </div>

            {/* Right Column - Summary */}
            <div className="lg:col-span-1">
              <div className="sticky top-28">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-[#111] rounded-3xl border border-white/10 overflow-hidden"
                >
                  {selectedPackage ? (
                    <>
                      {/* Package Image */}
                      <div className="relative h-48 overflow-hidden">
                        <Image
                          src={selectedPackage.image}
                          alt={selectedPackage.name}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#111] to-transparent" />
                        <div className="absolute bottom-4 left-4 right-4">
                          <h3 className="text-lg font-[family-name:var(--font-krona)] text-white normal-case line-clamp-2">
                            {selectedPackage.name}
                          </h3>
                        </div>
                      </div>

                      {/* Summary Content */}
                      <div className="p-6 space-y-4">
                        {/* Booking Details */}
                        {selectedDate && (
                          <div className="flex items-center gap-3 text-sm">
                            <Calendar className="w-4 h-4 text-[#b1b94c]" />
                            <span className="text-white">
                              {new Date(selectedDate).toLocaleDateString('en-US', { 
                                weekday: 'long', 
                                year: 'numeric', 
                                month: 'long', 
                                day: 'numeric' 
                              })}
                            </span>
                          </div>
                        )}
                        
                        {selectedTime && (
                          <div className="flex items-center gap-3 text-sm">
                            <Clock className="w-4 h-4 text-[#b1b94c]" />
                            <span className="text-white">
                              {(() => {
                                const [hourStr, minuteStr] = selectedTime.split(':');
                                const hourNum = parseInt(hourStr);
                                const display12h = hourNum > 12 ? hourNum - 12 : (hourNum === 0 ? 12 : hourNum);
                                const ampm = hourNum >= 12 ? 'PM' : 'AM';
                                return `${display12h}:${minuteStr} ${ampm}`;
                              })()}
                            </span>
                          </div>
                        )}
                        
                        <div className="flex items-center gap-3 text-sm">
                          <Users className="w-4 h-4 text-[#b1b94c]" />
                          <span className="text-white">{guestCount} {guestCount === 1 ? 'Guest' : 'Guests'}</span>
                        </div>

                        {needTransfer && (
                          <div className="flex items-center gap-3 text-sm">
                            <Car className="w-4 h-4 text-[#b1b94c]" />
                            <span className="text-white">VVIP Transfer</span>
                          </div>
                        )}

                        {/* Price Breakdown */}
                        <div className="pt-4 border-t border-white/10 space-y-2">
                          {isPerTablePackage(selectedPackageId) ? (
                            <>
                              <div className="flex justify-between text-sm">
                                <span className="text-white/60">
                                  {selectedPackage.name} - 1 Table
                                </span>
                                <span className="text-white">{formatPrice(prices.base)}</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-white/60">
                                  {guestCount} {guestCount === 1 ? 'Person' : 'Persons'}
                                </span>
                                <span className="text-white/40">included</span>
                              </div>
                            </>
                          ) : isSpecialPackage(selectedPackageId) ? (
                            <>
                              <div className="flex justify-between text-sm">
                                <span className="text-white/60">
                                  {selectedPackage.name} - Package
                                </span>
                                <span className="text-white">{formatPrice(prices.base)}</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-white/60">
                                  {guestCount} {guestCount === 1 ? 'Person' : 'Persons'}
                                </span>
                                <span className="text-white/40">included (max 10)</span>
                              </div>
                            </>
                          ) : (
                            <div className="flex justify-between text-sm">
                              <span className="text-white/60">
                                {selectedPackage.name} × {guestCount}
                              </span>
                              <span className="text-white">{formatPrice(prices.base)}</span>
                            </div>
                          )}
                          
                          {/* Add-ons */}
                          {Object.entries(selectedAddons).map(([addonId, qty]) => {
                            if (qty <= 0) return null;
                            const addon = promotionalAddons.find(a => a.id === addonId);
                            if (!addon) return null;
                            return (
                              <div key={addonId} className="flex justify-between text-sm">
                                <span className="text-white/60">{addon.name} × {qty}</span>
                                <span className="text-green-400">+{formatPrice(addon.price * qty)}</span>
                              </div>
                            );
                          })}
                          
                          {needTransfer && (
                            <div className="flex justify-between text-sm">
                              <span className="text-white/60">VVIP Transfer</span>
                              <span className="text-white">+{formatPrice(prices.transfer)}</span>
                            </div>
                          )}

                          <div className="pt-3 border-t border-white/10 flex justify-between items-center">
                            <span className="text-white font-medium">Total</span>
                            <span className="text-2xl font-bold text-[#b1b94c]">
                              {formatPrice(prices.total)}
                            </span>
                          </div>
                        </div>

                        {/* Availability badge — only shown for packages that consume allotment */}
                        {selectedDate && selectedTime && availabilityState !== 'idle' && availabilityState !== 'not_applicable' && (
                          <div className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border ${
                            availabilityState === 'available' ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300' :
                            availabilityState === 'full'      ? 'bg-red-500/10 border-red-500/40 text-red-300' :
                            availabilityState === 'error'     ? 'bg-amber-500/10 border-amber-500/40 text-amber-300' :
                            'bg-white/5 border-white/10 text-white/60'
                          }`}>
                            {availabilityState === 'checking' && (<>
                              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                              Checking availability…
                            </>)}
                            {availabilityState === 'available' && (<>
                              <Check className="w-4 h-4" />
                              Available — book now
                            </>)}
                            {availabilityState === 'full' && (<>
                              <Info className="w-4 h-4" />
                              Fully booked — pick another time
                            </>)}
                            {availabilityState === 'error' && (<>
                              <Info className="w-4 h-4" />
                              Couldn&apos;t check availability — please retry
                            </>)}
                          </div>
                        )}

                        {/* Alcohol restriction badge */}
                        {isSelectedDateAlcoholRestricted && (
                          <div className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border bg-amber-500/10 border-amber-500/40 text-amber-300">
                            <Info className="w-4 h-4" />
                            Selected date: alcohol restricted
                          </div>
                        )}

                        {/* CTA Button */}
                        <button
                          onClick={handleProceedToCheckout}
                          disabled={!isFormValid}
                          className="w-full py-4 bg-[#b1b94c] hover:bg-[#c4cc5a] text-black font-[family-name:var(--font-krona)] rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                          {availabilityState === 'full' ? 'Fully Booked' : 'Proceed to Checkout'}
                          <ArrowRight className="w-5 h-5" />
                        </button>

                        {/* Trust Badges */}
                        <div className="flex items-center justify-center gap-4 pt-2">
                          <span className="flex items-center gap-1 text-white/40 text-xs">
                            <ShieldCheck className="w-4 h-4" />
                            Secure
                          </span>
                          <span className="flex items-center gap-1 text-white/40 text-xs">
                            <CalendarDays className="w-4 h-4" />
                            Instant Confirm
                          </span>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="p-8 text-center">
                      <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Sparkles className="w-8 h-8 text-white/30" />
                      </div>
                      <h3 className="text-lg font-[family-name:var(--font-krona)] text-white mb-2 normal-case">
                        Select a Dining Zone
                      </h3>
                      <p className="text-white/40 text-sm">
                        Choose your preferred dining experience to see booking details
                      </p>
                    </div>
                  )}
                </motion.div>

                {/* Location Info */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="mt-6 p-4 bg-[#111] rounded-2xl border border-white/10"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-[#b1b94c]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-5 h-5 text-[#b1b94c]" />
                    </div>
                    <div>
                      <p className="text-white font-medium text-sm">Three Monkeys Restaurant</p>
                      <p className="text-white/40 text-xs mt-1">Inside Hanuman World, Kathu, Phuket</p>
                      <a
                        href="https://maps.app.goo.gl/hk5Z7PQUHnmz6tVB6"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[#b1b94c] text-xs mt-2 hover:underline"
                      >
                        <Navigation className="w-3 h-3" />
                        Get Directions
                      </a>
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

export default function BookingPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-white/30 border-t-[#b1b94c] rounded-full animate-spin" />
      </main>
    }>
      <BookingContent />
    </Suspense>
  );
}
