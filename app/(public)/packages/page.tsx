'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Armchair, Sparkles } from 'lucide-react';

export default function PackagesLandingPage() {
  return (
    <main className="min-h-screen bg-[#0a0a0a]">
      {/* Hero Section */}
      <section className="relative min-h-[50vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/images/Random images/47_resize.jpg"
            alt="Dining Experience"
            fill
            className="object-cover"
            priority
            unoptimized
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-[#0a0a0a]" />
        </div>

        <div className="relative z-10 text-center px-4 py-32">
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-block text-[#b1b94c] text-sm font-medium uppercase tracking-[0.3em] mb-6"
          >
            Dining Experiences
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-6xl lg:text-7xl font-[family-name:var(--font-krona)] text-white mb-6 normal-case"
          >
            Book Your Experience
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-white/60 text-lg max-w-2xl mx-auto font-[family-name:var(--font-inter)]"
          >
            Choose from our unique dining seats or special celebration packages
          </motion.p>
        </div>
      </section>

      {/* Two Options */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Our Seats Card */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              <Link href="/seats" className="group block h-full">
                <div className="relative h-full bg-[#111] rounded-3xl overflow-hidden border border-white/10 hover:border-[#b1b94c]/50 transition-all duration-500">
                  {/* Image */}
                  <div className="relative aspect-[16/10] overflow-hidden">
                    <Image
                      src="/images/Random images/48_resize.jpg"
                      alt="Our Seats"
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                      unoptimized
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#111] via-black/40 to-transparent" />
                    
                    {/* Icon */}
                    <div className="absolute top-6 left-6 w-14 h-14 bg-[#b1b94c] rounded-2xl flex items-center justify-center">
                      <Armchair className="w-7 h-7 text-black" />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-8">
                    <h2 className="text-3xl font-[family-name:var(--font-krona)] text-white mb-3 group-hover:text-[#b1b94c] transition-colors normal-case">
                      Our Seats
                    </h2>
                    <p className="text-white/50 text-lg leading-relaxed mb-6 font-[family-name:var(--font-inter)]">
                      Choose from 6 unique dining zones, each offering a different atmosphere and stunning rainforest views.
                    </p>
                    
                    {/* Features */}
                    <div className="flex flex-wrap gap-2 mb-6">
                      <span className="px-3 py-1 bg-white/10 rounded-full text-white/70 text-sm">Monkey Dome</span>
                      <span className="px-3 py-1 bg-white/10 rounded-full text-white/70 text-sm">Monkey Nest</span>
                      <span className="px-3 py-1 bg-white/10 rounded-full text-white/70 text-sm">Bamboo Pavilion</span>
                      <span className="px-3 py-1 bg-white/10 rounded-full text-white/70 text-sm">+3 more</span>
                    </div>
                    
                    {/* CTA */}
                    <div className="flex items-center gap-2 text-[#b1b94c] font-medium group-hover:gap-3 transition-all">
                      <span>View All Seats</span>
                      <ArrowRight className="w-5 h-5" />
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>

            {/* Special Packages Card */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <Link href="/special-packages" className="group block h-full">
                <div className="relative h-full bg-[#111] rounded-3xl overflow-hidden border border-white/10 hover:border-[#b1b94c]/50 transition-all duration-500">
                  {/* Image */}
                  <div className="relative aspect-[16/10] overflow-hidden">
                    <Image
                      src="/images/Random images/32_resize.jpg"
                      alt="Special Packages"
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                      unoptimized
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#111] via-black/40 to-transparent" />
                    
                    {/* Icon */}
                    <div className="absolute top-6 left-6 w-14 h-14 bg-[#b1b94c] rounded-2xl flex items-center justify-center">
                      <Sparkles className="w-7 h-7 text-black" />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-8">
                    <h2 className="text-3xl font-[family-name:var(--font-krona)] text-white mb-3 group-hover:text-[#b1b94c] transition-colors normal-case">
                      Special Packages
                    </h2>
                    <p className="text-white/50 text-lg leading-relaxed mb-6 font-[family-name:var(--font-inter)]">
                      Celebrate special occasions with our curated packages for romantic dinners, birthdays, and private events.
                    </p>
                    
                    {/* Features */}
                    <div className="flex flex-wrap gap-2 mb-6">
                      <span className="px-3 py-1 bg-white/10 rounded-full text-white/70 text-sm">Romantic Dinner</span>
                      <span className="px-3 py-1 bg-white/10 rounded-full text-white/70 text-sm">Birthday</span>
                      <span className="px-3 py-1 bg-white/10 rounded-full text-white/70 text-sm">Private Events</span>
                    </div>
                    
                    {/* CTA */}
                    <div className="flex items-center gap-2 text-[#b1b94c] font-medium group-hover:gap-3 transition-all">
                      <span>View All Packages</span>
                      <ArrowRight className="w-5 h-5" />
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
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
              Not Sure What to Choose?
            </h2>
            <p className="text-white/50 text-lg mb-8 font-[family-name:var(--font-inter)]">
              Contact us and we&apos;ll help you find the perfect dining experience for your occasion.
            </p>
            <Link href="/contact">
              <button className="inline-flex items-center gap-2 px-8 py-4 bg-[#b1b94c] text-black font-[family-name:var(--font-krona)] rounded-full hover:bg-[#c4cc5a] transition-all">
                Contact Us
                <ArrowRight className="w-5 h-5" />
              </button>
            </Link>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
