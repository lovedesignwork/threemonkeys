'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Utensils } from 'lucide-react';

const menuImages = [
  { src: '/images/three_monkeys_menu/FOODS/Recommend/Tom Yum Gung Seafood Spicy Sour Soup.jpg', alt: 'Tom Yum Soup' },
  { src: '/images/three_monkeys_menu/FOODS/Western/Caesar Salad.jpg', alt: 'Caesar Salad' },
  { src: '/images/three_monkeys_menu/FOODS/Bali/The Notorious Beef Short Ribs.jpg', alt: 'Beef Short Ribs' },
  { src: '/images/three_monkeys_menu/FOODS/Thai/Grilled Australian Beef Tenderloin With Spicy Chili Paste.jpg', alt: 'Grilled Beef' },
  { src: '/images/three_monkeys_menu/FOODS/Japanese/California Roll.jpg', alt: 'California Roll' },
  { src: '/images/three_monkeys_menu/FOODS/Desserts/Chocolate Fondant Served With Vanilla Ice Cream.jpg', alt: 'Chocolate Fondant' },
  { src: '/images/three_monkeys_menu/FOODS/Western/Pork Chop With Grilled Vegetables Served With Pepper Sauce.jpg', alt: 'Pork Chop' },
  { src: '/images/three_monkeys_menu/FOODS/Bali/Signature BBQ Spare Ribs.jpg', alt: 'BBQ Spare Ribs' },
  { src: '/images/three_monkeys_menu/FOODS/Japanese/Norwegian Salmon Sashimi.jpg', alt: 'Salmon Sashimi' },
  { src: '/images/three_monkeys_menu/FOODS/Thai/Whole Chicken Stuffed With Chestnut And Rice.jpg', alt: 'Stuffed Chicken' },
  { src: '/images/three_monkeys_menu/FOODS/Vegetarian/Deep Fried Vegetables Spring Rolls.jpg', alt: 'Spring Rolls' },
  { src: '/images/three_monkeys_menu/FOODS/Desserts/Coconut Ice Cream Served In Fresh Coconut.jpg', alt: 'Coconut Ice Cream' },
  { src: '/images/three_monkeys_menu/FOODS/Western/Chicken Burger Served With Potato Wedges.jpg', alt: 'Chicken Burger' },
  { src: '/images/three_monkeys_menu/FOODS/Thai/Tom Yum Fried Rice With Prawns.jpg', alt: 'Tom Yum Fried Rice' },
  { src: '/images/three_monkeys_menu/FOODS/Japanese/Prawns Tempura.jpg', alt: 'Prawns Tempura' },
  { src: '/images/three_monkeys_menu/FOODS/Bali/Mee Goreng Basah Fried Noodles With Roasted Pork.jpg', alt: 'Mee Goreng' },
  { src: '/images/three_monkeys_menu/FOODS/Thai/Wanon Green Papaya Salad With Banana Blossom.jpg', alt: 'Papaya Salad' },
  { src: '/images/three_monkeys_menu/FOODS/Western/Deep Fried Prawns.jpg', alt: 'Fried Prawns' },
];

export function MenuShowcase() {
  // Double the images for seamless loop
  const duplicatedImages = [...menuImages, ...menuImages];

  return (
    <section className="relative py-24 lg:py-32 bg-[#0a0a0a] overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black opacity-50" />
      
      <div className="relative z-10">
        {/* Header */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-3 mb-6"
          >
            <div className="w-12 h-[1px] bg-[#b1b94c]" />
            <Utensils className="w-5 h-5 text-[#b1b94c]" />
            <div className="w-12 h-[1px] bg-[#b1b94c]" />
          </motion.div>
          
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl lg:text-6xl font-[family-name:var(--font-krona)] text-white mb-6 normal-case"
          >
            Our Menu
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-white/50 text-lg max-w-2xl mx-auto font-[family-name:var(--font-inter)]"
          >
            A culinary journey through Southern Thailand&apos;s rich flavors
          </motion.p>
        </div>

        {/* Rotating Image Carousel - Row 1 (Left to Right) */}
        <div className="relative mb-4">
          <div className="flex animate-scroll-left">
            {duplicatedImages.map((image, index) => (
              <div
                key={`row1-${index}`}
                className="flex-shrink-0 w-[280px] h-[200px] mx-2 rounded-2xl overflow-hidden group"
              >
                <div className="relative w-full h-full">
                  <Image
                    src={image.src}
                    alt={image.alt}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                    unoptimized
                  />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Rotating Image Carousel - Row 2 (Right to Left) */}
        <div className="relative mb-16">
          <div className="flex animate-scroll-right">
            {[...duplicatedImages].reverse().map((image, index) => (
              <div
                key={`row2-${index}`}
                className="flex-shrink-0 w-[320px] h-[220px] mx-2 rounded-2xl overflow-hidden group"
              >
                <div className="relative w-full h-full">
                  <Image
                    src={image.src}
                    alt={image.alt}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                    unoptimized
                  />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <Link
            href="/packages"
            className="group inline-flex items-center gap-4 px-8 py-4 bg-[#b1b94c] hover:bg-[#c4cc5a] text-black font-[family-name:var(--font-krona)] rounded-full transition-all"
          >
            <span>Explore Full Menu</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>
      </div>

      {/* Gradient Overlays for Fade Effect */}
      <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-[#0a0a0a] to-transparent z-20 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-[#0a0a0a] to-transparent z-20 pointer-events-none" />

      {/* CSS for infinite scroll animation */}
      <style jsx global>{`
        @keyframes scroll-left {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        
        @keyframes scroll-right {
          0% {
            transform: translateX(-50%);
          }
          100% {
            transform: translateX(0);
          }
        }
        
        .animate-scroll-left {
          animation: scroll-left 40s linear infinite;
        }
        
        .animate-scroll-right {
          animation: scroll-right 45s linear infinite;
        }
        
        .animate-scroll-left:hover,
        .animate-scroll-right:hover {
          animation-play-state: paused;
        }
      `}</style>
    </section>
  );
}
