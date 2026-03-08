'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, ArrowLeft, Clock, Star } from 'lucide-react';
import { getSpecialPackages } from '@/lib/data/packages';
import { formatPrice } from '@/lib/utils';

const specialPackages = getSpecialPackages();

export default function SpecialPackagesPage() {
  return (
    <main className="min-h-screen bg-[#0a0a0a]">
      {/* Hero Section */}
      <section className="relative min-h-[50vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/images/Random images/40_resize.jpg"
            alt="Special Packages"
            fill
            className="object-cover"
            priority
            unoptimized
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-[#0a0a0a]" />
        </div>

        <div className="relative z-10 text-center px-4 py-32">
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
        </div>
      </section>

      {/* Packages Grid */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {specialPackages.map((pkg, index) => (
              <motion.div
                key={pkg.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
              >
                <Link href={`/packages/${pkg.slug}`} className="group block h-full">
                  <div className="relative h-full bg-[#111] rounded-3xl overflow-hidden border border-white/10 hover:border-[#b1b94c]/50 transition-all duration-500">
                    {/* Image */}
                    <div className="relative aspect-[4/3] overflow-hidden">
                      <Image
                        src={pkg.image}
                        alt={pkg.name}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                        unoptimized
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#111] via-black/30 to-transparent" />
                      
                      {/* Duration Badge */}
                      <div className="absolute top-4 left-4 px-3 py-1.5 bg-black/60 backdrop-blur-sm rounded-full flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-white/80" />
                        <span className="text-white/80 text-xs">{pkg.duration}</span>
                      </div>
                      
                      {/* Popular/Featured Badge */}
                      {(pkg.popular || pkg.featured) && (
                        <div className="absolute top-4 right-4 px-3 py-1.5 bg-[#b1b94c] rounded-full flex items-center gap-1.5">
                          <Star className="w-3.5 h-3.5 text-black fill-current" />
                          <span className="text-black text-xs font-semibold">
                            {pkg.popular ? 'Popular' : 'Featured'}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-6">
                      <h3 className="text-lg font-[family-name:var(--font-krona)] text-white mb-2 group-hover:text-[#b1b94c] transition-colors normal-case line-clamp-2">
                        {pkg.name}
                      </h3>
                      <p className="text-white/50 text-sm leading-relaxed mb-4 font-[family-name:var(--font-inter)] line-clamp-2">
                        {pkg.shortDescription}
                      </p>
                      
                      {/* Features */}
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {pkg.features.slice(0, 3).map((feature) => (
                          <span
                            key={feature}
                            className="px-2 py-0.5 bg-white/5 rounded-full text-white/50 text-xs"
                          >
                            {feature}
                          </span>
                        ))}
                      </div>
                      
                      {/* Price & CTA */}
                      <div className="flex items-center justify-between pt-4 border-t border-white/10">
                        <div>
                          <span className="text-white/40 text-xs">From</span>
                          <div className="text-lg font-bold text-[#b1b94c]">
                            {formatPrice(pkg.price)}
                          </div>
                        </div>
                        <span className="flex items-center gap-1 text-[#b1b94c] text-sm font-medium group-hover:gap-2 transition-all">
                          Book
                          <ArrowRight className="w-4 h-4" />
                        </span>
                      </div>
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
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
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
