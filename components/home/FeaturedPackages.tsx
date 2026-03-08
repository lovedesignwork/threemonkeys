'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Users } from 'lucide-react';

const seats = [
  {
    id: 'monkey-dome',
    name: 'Monkey Dome',
    description: 'Signature treehouse dining with panoramic jungle views',
    capacity: '2-6 guests',
    image: '/images/Random images/35_resize.jpg',
    href: '/packages/monkey-dome',
  },
  {
    id: 'monkey-nest',
    name: 'Monkey Nest',
    description: 'Intimate canopy seating for romantic dinners',
    capacity: '2-4 guests',
    image: '/images/Random images/39_resize.jpg',
    href: '/packages/monkey-nest',
  },
  {
    id: 'bamboo-pavilion',
    name: 'Bamboo Pavilion',
    description: 'Open-air pavilion with traditional Thai architecture',
    capacity: '4-12 guests',
    image: '/images/Random images/40_resize.jpg',
    href: '/packages/bamboo-pavilion',
  },
  {
    id: 'rooftop-romantic',
    name: 'Rooftop Romantic',
    description: 'Exclusive rooftop with sunset forest views',
    capacity: '2 guests',
    image: '/images/Random images/41_resize.jpg',
    href: '/packages/rooftop-romantic',
  },
  {
    id: 'garden-terrace',
    name: 'Garden Terrace',
    description: 'Ground-level dining surrounded by tropical gardens',
    capacity: '4-8 guests',
    image: '/images/Random images/42_resize.jpg',
    href: '/packages/garden-terrace',
  },
  {
    id: 'private-sala',
    name: 'Private Sala',
    description: 'Secluded Thai-style pavilion for exclusive gatherings',
    capacity: '6-20 guests',
    image: '/images/Random images/43_resize.jpg',
    href: '/packages/private-sala',
  },
];

export function FeaturedPackages() {
  return (
    <section id="seats" className="relative py-24 bg-black overflow-hidden">
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

        {/* Seats Grid - 3 columns x 2 rows */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6">
          {seats.map((seat, index) => (
            <motion.div
              key={seat.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Link href={seat.href} className="group block h-full">
                <div className="relative h-full overflow-hidden rounded-2xl bg-white/5 border-2 border-[#b1b94c]/40 hover:border-[#b1b94c] transition-all duration-500">
                  {/* Image */}
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <Image
                      src={seat.image}
                      alt={seat.name}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                      unoptimized
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                    
                    {/* Capacity Badge */}
                    <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 bg-black/60 backdrop-blur-sm rounded-full text-white/90 text-xs">
                      <Users className="w-3.5 h-3.5" />
                      {seat.capacity}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg lg:text-xl font-[family-name:var(--font-krona)] text-white mb-1.5 group-hover:text-[#b1b94c] transition-colors normal-case truncate">
                          {seat.name}
                        </h3>
                        <p className="text-white/50 text-sm leading-relaxed line-clamp-2">
                          {seat.description}
                        </p>
                      </div>
                      
                      <div className="flex-shrink-0 w-10 h-10 rounded-full border border-white/20 flex items-center justify-center group-hover:bg-[#b1b94c] group-hover:border-[#b1b94c] transition-all">
                        <ArrowRight className="w-4 h-4 text-white/60 group-hover:text-black transition-colors" />
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
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
