'use client';

import { useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, ArrowLeft, CalendarClock } from 'lucide-react';
import { getSpecialPackages } from '@/lib/data/packages';
import { formatPrice } from '@/lib/utils';

export default function SpecialPackagesPage() {
  const specialPackages = useMemo(() => getSpecialPackages(), []);
  
  // Scroll to top on page mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  return (
    <main className="min-h-screen bg-[#0a0a0a]">
      {/* Hero Section */}
      <section className="relative min-h-[50vh] flex items-end justify-center overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/images/Random images/40_resize.jpg"
            alt="Special Packages"
            fill
            className="object-cover"
            priority
            unoptimized
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-[#0a0a0a]" />
        </div>

        <div className="relative z-10 text-center px-4 pt-32 pb-12">
          {/* Back Link */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="absolute top-8 left-8"
          >
            <Link 
              href="/"
              className="inline-flex items-center gap-2 text-white/60 hover:text-[#b1b94c] transition-colors font-[family-name:var(--font-inter)]"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Link>
          </motion.div>

          <motion.span
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-block text-[#b1b94c] text-sm font-medium uppercase tracking-[0.3em] mb-6"
          >
            Celebrate With Us
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-6xl lg:text-7xl font-[family-name:var(--font-krona)] text-white mb-6 normal-case"
          >
            Special Packages
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-white/60 text-lg max-w-2xl mx-auto font-[family-name:var(--font-inter)]"
          >
            Create unforgettable memories with our specially curated packages for every occasion
          </motion.p>
          
          {/* Advance Booking Notice */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-6 inline-flex items-center gap-2 px-4 py-2 bg-amber-500/20 border border-amber-500/40 rounded-full"
          >
            <CalendarClock className="w-4 h-4 text-amber-400" />
            <span className="text-amber-400 text-sm font-medium">
              All special packages require advance booking at least 1 day before
            </span>
          </motion.div>
        </div>
      </section>

      {/* Packages Grid */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-6">
            {specialPackages.map((pkg, index) => (
              <motion.div
                key={pkg.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
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
                      
                      {/* Advance Booking Badge - Only Badge */}
                      <div className="absolute top-4 left-4">
                        <div className="px-3 py-1.5 bg-amber-500/90 backdrop-blur-sm rounded-full flex items-center gap-1.5">
                          <CalendarClock className="w-3.5 h-3.5 text-black" />
                          <span className="text-black text-xs font-semibold">Book 1 Day Ahead</span>
                        </div>
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
                        <span className="text-white/40 text-xs uppercase tracking-wider block mb-1">Package Price</span>
                        <div className="flex items-baseline gap-1">
                          <span className="text-3xl font-bold text-[#b1b94c] font-[family-name:var(--font-krona)]">
                            {formatPrice(pkg.price)}
                          </span>
                          <span className="text-white/40 text-sm">total</span>
                        </div>
                      </div>
                      
                      {/* Book Button */}
                      <motion.div
                        className="flex items-center justify-center gap-2 w-full py-3 bg-[#b1b94c] rounded-xl text-black font-semibold text-sm"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        Book Now
                        <ArrowRight className="w-4 h-4" />
                      </motion.div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Custom Request Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/images/Random images/41_resize.jpg"
            alt=""
            fill
            className="object-cover"
            unoptimized
          />
          <div className="absolute inset-0 bg-[#b1b94c]/90" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <h2 className="text-3xl md:text-4xl font-[family-name:var(--font-krona)] text-black mb-4 normal-case">
              Have Something Unique in Mind?
            </h2>
            <p className="text-black/60 text-lg mb-8 font-[family-name:var(--font-inter)] max-w-xl mx-auto">
              We love creating custom experiences. Tell us about your vision and we&apos;ll make it happen.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/contact">
                <button className="px-8 py-4 bg-black text-[#b1b94c] font-[family-name:var(--font-krona)] rounded-full hover:bg-black/80 transition-all">
                  Contact Us
                </button>
              </Link>
              <Link href="/seats">
                <button className="px-8 py-4 bg-transparent border-2 border-black text-black font-[family-name:var(--font-krona)] rounded-full hover:bg-black hover:text-[#b1b94c] transition-all">
                  View Our Seats
                </button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
