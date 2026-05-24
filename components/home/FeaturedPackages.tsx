'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Link } from '@/i18n/navigation';
import Image from 'next/image';
import { ArrowRight, Star, Sparkles, Heart } from 'lucide-react';
import { getSeatPackages } from '@/lib/data/packages';
import { Package } from '@/types';

function isRomanticZone(pkg: Package): boolean {
  return pkg.id === 'monkey-dome' || pkg.id === 'monkey-nest';
}

export function FeaturedPackages() {
  const seatPackages = useMemo(() => getSeatPackages(), []);
  const premiumSeats = seatPackages.filter(pkg => pkg.id === 'monkey-dome' || pkg.id === 'monkey-nest');
  const openSeating = seatPackages.filter(pkg => pkg.id === 'indoor-seat' || pkg.id === 'outdoor-seat');
  const otherSeats = seatPackages.filter(
    pkg => pkg.id !== 'monkey-dome' && pkg.id !== 'monkey-nest' && pkg.id !== 'indoor-seat' && pkg.id !== 'outdoor-seat'
  );

  return (
    <section id="seats" className="relative py-24 bg-black overflow-hidden">
      {/* Romantic Heart Icon CSS */}
      <style jsx global>{`
        @keyframes heartbeat {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.2); }
        }
        
        @keyframes glitter {
          0%, 100% { opacity: 0; transform: scale(0) rotate(0deg); }
          50% { opacity: 1; transform: scale(1) rotate(180deg); }
        }
        
        .romantic-heart-icon {
          color: #ff6b6b;
          filter: drop-shadow(0 0 8px rgba(255, 107, 107, 0.6));
          animation: heartbeat 1.5s ease-in-out infinite;
        }
        
        .romantic-glitter {
          position: absolute;
          top: -4px;
          right: -4px;
          width: 8px;
          height: 8px;
          background: linear-gradient(45deg, #fff, #ffd700, #ff69b4);
          border-radius: 50%;
          animation: glitter 2s ease-in-out infinite;
        }
      `}</style>

      {/* Background Accent */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-[#b1b94c]/5 -skew-x-12 origin-top-right" />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8 mb-16">
          <div>
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-block text-[#b1b94c] text-sm font-medium uppercase tracking-[0.3em] mb-4"
            >
              Unique Dining Zones
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-5xl lg:text-6xl font-[family-name:var(--font-krona)] text-white normal-case"
            >
              Our Seats
            </motion.h2>
          </div>
          
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <Link
              href="/seats"
              className="group inline-flex items-center gap-3 text-white/60 hover:text-[#b1b94c] transition-colors"
            >
              <span className="text-sm uppercase tracking-widest">View All</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </div>

        {/* Premium Seats - Horizontal Cards (same as seats page) */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-2 h-2 bg-[#b1b94c] rounded-full" />
            <span className="text-sm font-medium text-[#b1b94c] uppercase tracking-wider">Premium Seats</span>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {premiumSeats.map((pkg, index) => (
              <motion.div
                key={pkg.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05, duration: 0.5 }}
              >
                <Link href={`/packages/${pkg.slug}`} className="group block h-full">
                  <div className="relative h-full md:min-h-[420px] bg-[#111] rounded-3xl overflow-hidden border-2 border-[#b1b94c]/40 hover:border-[#b1b94c] transition-all duration-500 flex flex-col md:flex-row">
                    {/* Image - Left Side (60% width) */}
                    <div className="relative w-full md:w-[60%] aspect-[4/3] md:aspect-auto flex-shrink-0 overflow-hidden">
                      <Image
                        src={pkg.image}
                        alt={pkg.name}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                        unoptimized
                      />
                      
                      {/* Badges */}
                      <div className="absolute top-4 left-4 flex flex-row gap-2 items-center">
                        {pkg.popular && (
                          <div className="px-3 py-1.5 bg-[#b1b94c] rounded-full flex items-center gap-1.5">
                            <Star className="w-3.5 h-3.5 text-black fill-current" />
                            <span className="text-black text-xs font-semibold">Popular</span>
                          </div>
                        )}
                        {isRomanticZone(pkg) && (
                          <div className="relative">
                            <Heart className="w-6 h-6 romantic-heart-icon" />
                            <div className="romantic-glitter" />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Content - Right Side (40% width) */}
                    <div className="w-full md:w-[40%] p-6 flex flex-col justify-center">
                      {/* Title */}
                      <h3 className="text-xl font-[family-name:var(--font-krona)] text-white group-hover:text-[#b1b94c] transition-colors normal-case leading-tight mb-2">
                        {pkg.name}
                      </h3>
                      <p className="text-white/50 text-sm mb-4 font-[family-name:var(--font-inter)]">
                        {pkg.shortDescription}
                      </p>
                      
                      {/* Feature Tags */}
                      <div className="flex flex-wrap gap-2 mb-6">
                        {pkg.features.slice(0, 3).map((feature, idx) => (
                          <span 
                            key={idx}
                            className="px-3 py-1 bg-[#b1b94c]/10 border border-[#b1b94c]/40 rounded-full text-[#b1b94c]/80 text-xs font-[family-name:var(--font-inter)]"
                          >
                            {feature}
                          </span>
                        ))}
                      </div>
                      
                      {/* Price Section */}
                      <div className="mb-4">
                        <span className="text-white/40 text-xs uppercase tracking-wider block mb-1">Deposit</span>
                        <div className="flex items-baseline gap-1">
                          <span className="text-3xl font-bold text-[#b1b94c] font-[family-name:var(--font-krona)]">
                            ฿4,000
                          </span>
                          <span className="text-white/40 text-sm">/ table</span>
                        </div>
                        <span className="text-white/30 text-xs">(up to 4 persons)</span>
                      </div>
                      
                      {/* Reserve Button */}
                      <motion.div
                        className="flex items-center justify-center gap-2 w-full py-3 bg-[#b1b94c] rounded-xl text-black font-semibold text-sm"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        Reserve Now
                        <ArrowRight className="w-4 h-4" />
                      </motion.div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Other Seats - Vertical Cards (same as seats page) */}
        <div>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-2 h-2 bg-white/40 rounded-full" />
            <span className="text-sm font-medium text-white/40 uppercase tracking-wider">More Seating Options</span>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {otherSeats.map((pkg, index) => (
              <motion.div
                key={pkg.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 + index * 0.05, duration: 0.5 }}
              >
                <Link href={`/packages/${pkg.slug}`} className="group block h-full">
                  <div className="relative h-full bg-[#111] rounded-3xl overflow-hidden border-2 border-[#b1b94c]/40 hover:border-[#b1b94c] transition-all duration-500">
                    {/* Image */}
                    <div className="relative aspect-[4/3] overflow-hidden">
                      <Image
                        src={pkg.image}
                        alt={pkg.name}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                        unoptimized
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#111]/70 via-transparent to-transparent" />
                      
                      {/* Badges - Right Side */}
                      <div className="absolute top-4 right-4 flex flex-row gap-2 items-center">
                        {pkg.popular && (
                          <div className="px-3 py-1.5 bg-[#b1b94c] rounded-full flex items-center gap-1.5">
                            <Star className="w-3.5 h-3.5 text-black fill-current" />
                            <span className="text-black text-xs font-semibold">Popular</span>
                          </div>
                        )}
                        {isRomanticZone(pkg) && (
                          <div className="relative">
                            <Heart className="w-6 h-6 romantic-heart-icon" />
                            <div className="romantic-glitter" />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-5">
                      {/* Title with icon */}
                      <div className="flex items-start gap-3 mb-3">
                        <motion.div 
                          className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#b1b94c]/20 to-[#b1b94c]/5 flex items-center justify-center flex-shrink-0 group-hover:from-[#b1b94c]/30 group-hover:to-[#b1b94c]/10 transition-all"
                          whileHover={{ rotate: [0, -5, 5, 0] }}
                        >
                          <Sparkles className="w-5 h-5 text-[#b1b94c]" />
                        </motion.div>
                        <div>
                          <h3 className="text-lg font-[family-name:var(--font-krona)] text-white group-hover:text-[#b1b94c] transition-colors normal-case leading-tight">
                            {pkg.name}
                          </h3>
                          <p className="text-white/40 text-xs mt-1 font-[family-name:var(--font-inter)]">
                            {pkg.shortDescription}
                          </p>
                        </div>
                      </div>
                      
                      {/* Feature Tags */}
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {pkg.features.slice(0, 3).map((feature, idx) => (
                          <span 
                            key={idx}
                            className="px-2 py-0.5 bg-white/5 rounded-full text-white/50 text-[10px] font-[family-name:var(--font-inter)]"
                          >
                            {feature}
                          </span>
                        ))}
                      </div>
                      
                      {/* Price Card */}
                      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#b1b94c]/10 via-[#b1b94c]/5 to-transparent p-4 border border-[#b1b94c]/20 group-hover:border-[#b1b94c]/40 transition-all">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-white/40 text-[10px] uppercase tracking-wider block">Deposit</span>
                            <span className="text-xl font-bold text-[#b1b94c] font-[family-name:var(--font-krona)]">
                              ฿500
                            </span>
                            <span className="text-white/30 text-[10px] ml-1">/ person</span>
                          </div>
                          <motion.div
                            className="flex items-center gap-2 px-4 py-2 bg-[#b1b94c] rounded-xl text-black font-semibold text-sm"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            Reserve
                            <ArrowRight className="w-4 h-4" />
                          </motion.div>
                        </div>
                        
                        {/* Decorative glow */}
                        <div className="absolute -right-8 -bottom-8 w-24 h-24 bg-[#b1b94c]/10 rounded-full blur-2xl group-hover:bg-[#b1b94c]/20 transition-all" />
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Open Seating - Indoor & Outdoor (horizontal cards, same as Premium) */}
        <div className="mt-16">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-2 h-2 bg-[#b1b94c] rounded-full" />
            <span className="text-sm font-medium text-[#b1b94c] uppercase tracking-wider">
              Open Seating — No Reservation Limit
            </span>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {openSeating.map((pkg, index) => (
              <motion.div
                key={pkg.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05, duration: 0.5 }}
              >
                <Link href={`/packages/${pkg.slug}`} className="group block h-full">
                  <div className="relative h-full md:min-h-[420px] bg-[#111] rounded-3xl overflow-hidden border-2 border-[#b1b94c]/40 hover:border-[#b1b94c] transition-all duration-500 flex flex-col md:flex-row">
                    {/* Image - Left Side (60% width) */}
                    <div className="relative w-full md:w-[60%] aspect-[4/3] md:aspect-auto flex-shrink-0 overflow-hidden">
                      <Image
                        src={pkg.image}
                        alt={pkg.name}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                        unoptimized
                      />
                    </div>

                    {/* Content - Right Side (40% width) */}
                    <div className="w-full md:w-[40%] p-6 flex flex-col justify-center">
                      <h3 className="text-xl font-[family-name:var(--font-krona)] text-white group-hover:text-[#b1b94c] transition-colors normal-case leading-tight mb-2">
                        {pkg.name}
                      </h3>
                      <p className="text-white/50 text-sm mb-4 font-[family-name:var(--font-inter)]">
                        {pkg.shortDescription}
                      </p>

                      {/* Feature Tags */}
                      <div className="flex flex-wrap gap-2 mb-6">
                        {pkg.features.slice(0, 3).map((feature, idx) => (
                          <span
                            key={idx}
                            className="px-3 py-1 bg-[#b1b94c]/10 border border-[#b1b94c]/40 rounded-full text-[#b1b94c]/80 text-xs font-[family-name:var(--font-inter)]"
                          >
                            {feature}
                          </span>
                        ))}
                      </div>

                      {/* Price Section */}
                      <div className="mb-4">
                        <span className="text-white/40 text-xs uppercase tracking-wider block mb-1">Deposit</span>
                        <div className="flex items-baseline gap-1">
                          <span className="text-3xl font-bold text-[#b1b94c] font-[family-name:var(--font-krona)]">
                            ฿500
                          </span>
                          <span className="text-white/40 text-sm">/ person</span>
                        </div>
                        <span className="text-white/30 text-xs">No reservation limit</span>
                      </div>

                      {/* Reserve Button */}
                      <motion.div
                        className="flex items-center justify-center gap-2 w-full py-3 bg-[#b1b94c] rounded-xl text-black font-semibold text-sm"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        Reserve Now
                        <ArrowRight className="w-4 h-4" />
                      </motion.div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 text-center"
        >
          <p className="text-white/40 text-sm mb-6">
            Can&apos;t decide? Let us help you choose the perfect spot.
          </p>
          <Link href="/booking">
            <button className="inline-flex items-center gap-3 px-8 py-4 bg-[#b1b94c] hover:bg-[#c5cd6f] text-black font-[family-name:var(--font-krona)] rounded-full transition-all">
              Reserve Your Seat
              <ArrowRight className="w-5 h-5" />
            </button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
