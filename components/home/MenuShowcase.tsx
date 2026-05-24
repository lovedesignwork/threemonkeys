'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import { ArrowRight, Utensils } from 'lucide-react';

interface MenuImage {
  src: string;
  alt: string;
}

const menuImages: MenuImage[] = [
  { src: '/images/three_monkeys_menu/FOODS/Recommend/Tom Yum Gung Seafood Spicy Sour Soup.jpg', alt: 'Tom Yum Soup' },
  { src: '/images/three_monkeys_menu/FOODS/Western/Caesar Salad.jpg',                            alt: 'Caesar Salad' },
  { src: '/images/three_monkeys_menu/FOODS/Bali/The Notorious Beef Short Ribs.jpg',              alt: 'Beef Short Ribs' },
  { src: '/images/three_monkeys_menu/FOODS/Thai/Grilled Australian Beef Tenderloin With Spicy Chili Paste.jpg', alt: 'Grilled Beef' },
  { src: '/images/three_monkeys_menu/FOODS/Japanese/California Roll.jpg',                        alt: 'California Roll' },
  { src: '/images/three_monkeys_menu/FOODS/Desserts/Chocolate Fondant Served With Vanilla Ice Cream.jpg', alt: 'Chocolate Fondant' },
  { src: '/images/three_monkeys_menu/FOODS/Western/Pork Chop With Grilled Vegetables Served With Pepper Sauce.jpg', alt: 'Pork Chop' },
  { src: '/images/three_monkeys_menu/FOODS/Bali/Signature BBQ Spare Ribs.jpg',                   alt: 'BBQ Spare Ribs' },
  { src: '/images/three_monkeys_menu/FOODS/Japanese/Norwegian Salmon Sashimi.jpg',               alt: 'Salmon Sashimi' },
  { src: '/images/three_monkeys_menu/FOODS/Thai/Whole Chicken Stuffed With Chestnut And Rice.jpg', alt: 'Stuffed Chicken' },
  { src: '/images/three_monkeys_menu/FOODS/Vegetarian/Deep Fried Vegetables Spring Rolls.jpg',   alt: 'Spring Rolls' },
  { src: '/images/three_monkeys_menu/FOODS/Desserts/Coconut Ice Cream Served In Fresh Coconut.jpg', alt: 'Coconut Ice Cream' },
  { src: '/images/three_monkeys_menu/FOODS/Western/Chicken Burger Served With Potato Wedges.jpg', alt: 'Chicken Burger' },
  { src: '/images/three_monkeys_menu/FOODS/Thai/Tom Yum Fried Rice With Prawns.jpg',             alt: 'Tom Yum Fried Rice' },
  { src: '/images/three_monkeys_menu/FOODS/Japanese/Prawns Tempura.jpg',                         alt: 'Prawns Tempura' },
  { src: '/images/three_monkeys_menu/FOODS/Bali/Mee Goreng Basah Fried Noodles With Roasted Pork.jpg', alt: 'Mee Goreng' },
  { src: '/images/three_monkeys_menu/FOODS/Thai/Wanon Green Papaya Salad With Banana Blossom.jpg', alt: 'Papaya Salad' },
  { src: '/images/three_monkeys_menu/FOODS/Western/Deep Fried Prawns.jpg',                       alt: 'Fried Prawns' },
];

export function MenuShowcase() {
  // Duplicate the list so the marquee can loop seamlessly.
  const duplicated = [...menuImages, ...menuImages];

  return (
    <section className="relative bg-[#0a0a0a] overflow-hidden py-20 sm:py-24 lg:py-32">
      {/* Soft brand glow + dot grid backdrop */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-32 left-1/2 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-[#b1b94c]/8 blur-[120px]" />
        <div
          className="absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage:
              'radial-gradient(circle at 1px 1px, rgba(177, 185, 76, 1) 1px, transparent 0)',
            backgroundSize: '32px 32px',
          }}
        />
      </div>

      <div className="relative z-10">
        {/* ── Section header ── */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-12 sm:mb-16">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-3 mb-5"
          >
            <span className="h-px w-10 bg-[#b1b94c]/40" />
            <span className="flex h-9 w-9 items-center justify-center rounded-full border border-[#b1b94c]/40 bg-[#b1b94c]/10">
              <Utensils className="w-4 h-4 text-[#b1b94c]" />
            </span>
            <span className="h-px w-10 bg-[#b1b94c]/40" />
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.05 }}
            className="text-[10px] sm:text-xs uppercase tracking-[0.4em] text-[#b1b94c] mb-4"
          >
            Taste the Rainforest
          </motion.p>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-[family-name:var(--font-krona)] text-white normal-case leading-[1.05] mb-6"
          >
            Our Menu
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15 }}
            className="text-white/55 text-base sm:text-lg max-w-2xl mx-auto font-[family-name:var(--font-inter)]"
          >
            A culinary journey through Southern Thailand&apos;s rich flavors —
            with Western, Japanese and Bali fusion crossing every plate.
          </motion.p>
        </div>

        {/* ── Marquee row 1 (left-to-right scroll) ── */}
        <div className="relative mb-3 sm:mb-4">
          <div className="flex animate-mm-scroll-left">
            {duplicated.map((image, index) => (
              <article
                key={`row1-${index}`}
                className="flex-shrink-0 group relative w-[220px] sm:w-[260px] lg:w-[300px] aspect-[5/4] mx-1.5 sm:mx-2 rounded-2xl overflow-hidden border border-white/5"
              >
                <Image
                  src={image.src}
                  alt={image.alt}
                  fill
                  sizes="(min-width: 1024px) 300px, (min-width: 640px) 260px, 220px"
                  className="object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-110"
                  unoptimized
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-3 sm:p-4">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-[#b1b94c]/80 mb-0.5">
                    Signature
                  </p>
                  <p className="text-white text-sm sm:text-base font-[family-name:var(--font-krona)] leading-tight truncate">
                    {image.alt}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>

        {/* ── Marquee row 2 (right-to-left scroll, slower) ── */}
        <div className="relative mb-12 sm:mb-16">
          <div className="flex animate-mm-scroll-right">
            {[...duplicated].reverse().map((image, index) => (
              <article
                key={`row2-${index}`}
                className="flex-shrink-0 group relative w-[220px] sm:w-[260px] lg:w-[300px] aspect-[5/4] mx-1.5 sm:mx-2 rounded-2xl overflow-hidden border border-white/5"
              >
                <Image
                  src={image.src}
                  alt={image.alt}
                  fill
                  sizes="(min-width: 1024px) 300px, (min-width: 640px) 260px, 220px"
                  className="object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-110"
                  unoptimized
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-3 sm:p-4">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-[#b1b94c]/80 mb-0.5">
                    From the kitchen
                  </p>
                  <p className="text-white text-sm sm:text-base font-[family-name:var(--font-krona)] leading-tight truncate">
                    {image.alt}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>

        {/* ── CTA ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center px-4"
        >
          <Link
            href="/menu"
            className="group inline-flex items-center gap-3 px-8 py-4 bg-[#b1b94c] hover:bg-[#c4cc5a] text-black font-[family-name:var(--font-krona)] rounded-full transition-all text-sm sm:text-base tracking-wide"
          >
            <span>Explore Full Menu</span>
            <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>
      </div>

      {/* Fade-out edges */}
      <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-16 sm:w-32 bg-gradient-to-r from-[#0a0a0a] to-transparent z-20" />
      <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-16 sm:w-32 bg-gradient-to-l from-[#0a0a0a] to-transparent z-20" />

      {/* Marquee keyframes — prefixed so they don't collide with anything */}
      <style jsx global>{`
        @keyframes mm-scroll-left {
          0%   { transform: translate3d(0, 0, 0); }
          100% { transform: translate3d(-50%, 0, 0); }
        }
        @keyframes mm-scroll-right {
          0%   { transform: translate3d(-50%, 0, 0); }
          100% { transform: translate3d(0, 0, 0); }
        }
        .animate-mm-scroll-left  { animation: mm-scroll-left  45s linear infinite; }
        .animate-mm-scroll-right { animation: mm-scroll-right 55s linear infinite; }
        .animate-mm-scroll-left:hover,
        .animate-mm-scroll-right:hover { animation-play-state: paused; }
        @media (prefers-reduced-motion: reduce) {
          .animate-mm-scroll-left,
          .animate-mm-scroll-right { animation: none; }
        }
      `}</style>
    </section>
  );
}
