'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Utensils } from 'lucide-react';

const menuImages = [
  { src: '/images/Random images/32_resize.jpg', alt: 'Tom Yum Soup' },
  { src: '/images/Random images/33_resize.jpg', alt: 'Grilled Prawns' },
  { src: '/images/Random images/34_resize.jpg', alt: 'Thai Curry' },
  { src: '/images/Random images/35_resize.jpg', alt: 'Restaurant Ambiance' },
  { src: '/images/Random images/39_resize.jpg', alt: 'Pad Thai' },
  { src: '/images/Random images/40_resize.jpg', alt: 'Thai Feast' },
  { src: '/images/Random images/41_resize.jpg', alt: 'Fresh Salad' },
  { src: '/images/Random images/42_resize.jpg', alt: 'Pancakes' },
  { src: '/images/Random images/43_resize.jpg', alt: 'Pizza' },
  { src: '/images/Random images/44_resize.jpg', alt: 'Seafood Platter' },
  { src: '/images/Random images/45_resize.jpg', alt: 'Spring Rolls' },
  { src: '/images/Random images/46_resize.jpg', alt: 'Thai Noodles' },
  { src: '/images/Random images/47_resize.jpg', alt: 'Mango Sticky Rice' },
  { src: '/images/Random images/48_resize.jpg', alt: 'Cooking' },
  { src: '/images/Random images/32_resize.jpg', alt: 'Fine Dining' },
  { src: '/images/Random images/33_resize.jpg', alt: 'Gourmet Dish' },
  { src: '/images/Random images/34_resize.jpg', alt: 'Pasta' },
  { src: '/images/Random images/35_resize.jpg', alt: 'Dessert' },
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
