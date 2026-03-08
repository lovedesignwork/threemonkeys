'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Star, ArrowLeft, Heart } from 'lucide-react';
import { getSeatPackages } from '@/lib/data/packages';
import { formatPrice } from '@/lib/utils';

const seatPackages = getSeatPackages();

const isRomanticZone = (pkg: typeof seatPackages[0]) => {
  return pkg.id.includes('romantic') || 
         pkg.name.toLowerCase().includes('romantic') ||
         pkg.features.some(f => f.toLowerCase().includes('romantic'));
};

export default function SeatsPage() {
  return (
    <main className="min-h-screen bg-[#0a0a0a]">
      {/* SVG Gradient Definition for Romantic Heart */}
      <svg width="0" height="0" className="absolute">
        <defs>
          <linearGradient id="romantic-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ec4899" />
            <stop offset="50%" stopColor="#f43f5e" />
            <stop offset="100%" stopColor="#ef4444" />
          </linearGradient>
        </defs>
      </svg>
      {/* Hero Section */}
      <section className="relative min-h-[50vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1920"
            alt="Our Seats"
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
            Unique Dining Zones
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-6xl lg:text-7xl font-[family-name:var(--font-krona)] text-white mb-6 normal-case"
          >
            Our Seats
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-white/60 text-lg max-w-2xl mx-auto font-[family-name:var(--font-inter)]"
          >
            Each seat offers a unique atmosphere and unforgettable rainforest dining experience. Choose your perfect spot in nature.
          </motion.p>
        </div>
      </section>

      {/* Seats Grid */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {seatPackages.map((pkg, index) => (
              <motion.div
                key={pkg.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
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
                      <div className="absolute inset-0 bg-gradient-to-t from-[#111] via-black/30 to-transparent" />
                      
                      {/* Badges - Right Side */}
                      <div className="absolute top-4 right-4 flex flex-row gap-2 items-center">
                        {/* Popular Badge */}
                        {pkg.popular && (
                          <div className="px-3 py-1.5 bg-[#b1b94c] rounded-full flex items-center gap-1.5">
                            <Star className="w-3.5 h-3.5 text-black fill-current" />
                            <span className="text-black text-xs font-semibold">Popular</span>
                          </div>
                        )}
                        
                        {/* Romantic Badge */}
                        {isRomanticZone(pkg) && (
                          <div className="relative">
                            <Heart className="w-6 h-6 romantic-heart-icon" />
                            <div className="romantic-glitter" />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                      <h3 className="text-xl font-[family-name:var(--font-krona)] text-white mb-2 group-hover:text-[#b1b94c] transition-colors normal-case">
                        {pkg.name}
                      </h3>
                      <p className="text-white/50 text-sm leading-relaxed mb-4 font-[family-name:var(--font-inter)] line-clamp-2">
                        {pkg.shortDescription}
                      </p>
                      
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

      {/* CTA Section */}
      <section className="py-20 bg-[#111]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-[family-name:var(--font-krona)] text-white mb-4 normal-case">
              Looking for Something Special?
            </h2>
            <p className="text-white/50 text-lg mb-8 font-[family-name:var(--font-inter)]">
              Check out our special packages for romantic dinners, birthday celebrations, and private events.
            </p>
            <Link href="/special-packages">
              <button className="inline-flex items-center gap-2 px-8 py-4 bg-[#b1b94c] text-black font-[family-name:var(--font-krona)] rounded-full hover:bg-[#c4cc5a] transition-all">
                View Special Packages
                <ArrowRight className="w-5 h-5" />
              </button>
            </Link>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
