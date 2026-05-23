'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, CalendarClock } from 'lucide-react';
import { getSpecialPackages } from '@/lib/data/packages';
import { formatPrice } from '@/lib/utils';

export function SpecialPackages() {
  const specialPackages = useMemo(() => getSpecialPackages(), []);

  return (
    <section className="relative py-24 bg-[#0f0f0f] overflow-hidden">
      {/* Subtle Background Accent */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-[#b1b94c]/5 rounded-full blur-3xl" />
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-block text-[#b1b94c] text-sm font-medium uppercase tracking-[0.3em] mb-4"
          >
            Celebrate With Us
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl lg:text-6xl font-[family-name:var(--font-krona)] text-white mb-6 normal-case"
          >
            Special Packages
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-white/50 text-lg max-w-2xl mx-auto font-[family-name:var(--font-inter)]"
          >
            Create unforgettable memories with our specially curated packages for every occasion
          </motion.p>
        </div>

        {/* 2 Column Grid - Same as special-packages page */}
        <div className="grid md:grid-cols-2 gap-6">
          {specialPackages.map((pkg, index) => (
            <motion.div
              key={pkg.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
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
                    
                    {/* Advance Booking Badge */}
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
                      {pkg.features?.slice(0, 3).map((feature, idx) => (
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
  );
}
