'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Heart, Cake, Users } from 'lucide-react';

const specialPackages = [
  {
    id: 'ultimate-dinner',
    icon: Heart,
    title: 'Ultimate Dinner Package',
    description: 'An unforgettable romantic dining experience at Three Monkeys Restaurant. Celebrate your honeymoon anniversary or a special romantic occasion in an enchanting setting, where every detail is thoughtfully designed to create lasting memories.',
    image: '/images/Random images/32_resize.jpg',
    features: ['Table Decorations', 'Sparkling Wine', 'Fresh Rose Bouquet', 'Spark Fountain', 'Photo & Video', 'Private Transfer'],
    price: '฿9,999',
    href: '/packages/ultimate-dinner',
  },
  {
    id: 'birthday-mini',
    icon: Cake,
    title: 'Birthday Mini',
    description: 'Brownies Cake 1 Piece | 1 Set of Balloons Pole. Make your birthday extra special at Three Monkeys! Celebrate your special day with our new Birthday Promotional Set.',
    image: '/images/Random images/33_resize.jpg',
    features: ['Table Decorations', 'Brownies Cake', 'Balloons Pole'],
    price: '฿1,200',
    href: '/packages/birthday-ice-cream-cake',
  },
  {
    id: 'will-you-marry-me',
    icon: Users,
    title: 'WILL YOU MARRY ME? at Three Monkeys',
    description: 'Create a Special Moment at Three Monkeys Restaurant (Zone 7 - Z). Make your marriage proposal truly unforgettable in a magical and romantic setting.',
    image: '/images/Random images/34_resize.jpg',
    features: ['Fresh Rose Bouquet', 'Spark Fountain', 'Will You Marry Me Sign'],
    price: '฿5,900',
    href: '/packages/will-you-marry-me',
  },
];

export function SpecialPackages() {
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

        {/* 3 Column Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {specialPackages.map((pkg, index) => (
            <motion.div
              key={pkg.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Link href={pkg.href} className="group block h-full">
                <div className="relative h-full bg-white/5 rounded-3xl overflow-hidden border border-[#b1b94c]/40 hover:border-[#b1b94c] transition-all duration-500">
                  {/* Image */}
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <Image
                      src={pkg.image}
                      alt={pkg.title}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                      unoptimized
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
                    
                    {/* Icon Badge */}
                    <div className="absolute top-4 left-4 w-12 h-12 bg-[#b1b94c] rounded-xl flex items-center justify-center">
                      <pkg.icon className="w-6 h-6 text-black" />
                    </div>
                    
                    {/* Price Badge */}
                    <div className="absolute top-4 right-4 px-3 py-1.5 bg-black/60 backdrop-blur-sm rounded-full">
                      <span className="text-[#b1b94c] text-sm font-medium">{pkg.price}</span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <h3 className="text-xl font-[family-name:var(--font-krona)] text-white mb-3 group-hover:text-[#b1b94c] transition-colors normal-case">
                      {pkg.title}
                    </h3>
                    <p className="text-white/50 text-sm leading-relaxed mb-5 font-[family-name:var(--font-inter)]">
                      {pkg.description}
                    </p>
                    
                    {/* Features */}
                    <div className="flex flex-wrap gap-2 mb-5">
                      {pkg.features.map((feature) => (
                        <span
                          key={feature}
                          className="px-3 py-1 bg-white/5 rounded-full text-white/60 text-xs font-[family-name:var(--font-inter)]"
                        >
                          {feature}
                        </span>
                      ))}
                    </div>
                    
                    {/* CTA */}
                    <div className="flex items-center gap-2 text-[#b1b94c] group-hover:gap-3 transition-all">
                      <span className="text-sm font-medium">Learn More</span>
                      <ArrowRight className="w-4 h-4" />
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
          className="mt-12 text-center"
        >
          <p className="text-white/40 text-sm mb-6 font-[family-name:var(--font-inter)]">
            Have a special request? We&apos;d love to create a custom package for you.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/special-packages">
              <button className="inline-flex items-center gap-2 px-8 py-3 bg-[#b1b94c] rounded-full text-black font-medium hover:bg-[#c4cc5a] transition-all">
                <span className="text-sm">View All Packages</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </Link>
            <Link href="/contact">
              <button className="inline-flex items-center gap-2 px-6 py-3 border border-white/20 rounded-full text-white hover:bg-white hover:text-black transition-all">
                <span className="text-sm font-medium">Contact Us</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
