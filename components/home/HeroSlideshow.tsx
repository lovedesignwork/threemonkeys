'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, MapPin, Play } from 'lucide-react';

const heroImages = [
  '/images/Random images/32_resize.jpg',
  '/images/Random images/33_resize.jpg',
  '/images/Random images/34_resize.jpg',
  '/images/Random images/35_resize.jpg',
];

export function HeroSlideshow() {
  const [currentImage, setCurrentImage] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % heroImages.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative h-[100dvh] w-full overflow-hidden bg-black">
      {/* Immersive Background Images */}
      <div className="absolute inset-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentImage}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.8, ease: 'easeInOut' }}
            className="absolute inset-0"
          >
            <Image
              src={heroImages[currentImage]}
              alt="Three Monkeys Restaurant"
              fill
              className="object-cover"
              priority
              unoptimized
            />
          </motion.div>
        </AnimatePresence>
        
        {/* Minimal Gradient for text legibility at the bottom only */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80" />
      </div>

      {/* Floating Content Dock - Tucked at the bottom to let the image breathe */}
      <div className="absolute bottom-0 left-0 right-0 z-20 pb-8 pt-32 sm:pb-12 lg:pb-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-end justify-between gap-8 lg:flex-row lg:items-end">
            
            {/* Left: Typography & Intro */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="w-full max-w-2xl"
            >
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/20 px-4 py-1.5 backdrop-blur-md">
                <MapPin className="h-4 w-4 text-[#b1b94c]" />
                <span className="font-[family-name:var(--font-krona)] text-[12px] font-semibold uppercase tracking-widest text-white">
                  Three Monkeys, Phuket
                </span>
              </div>
              
              <h1 className="normal-case font-[family-name:var(--font-krona)] text-3xl font-bold leading-[1.1] tracking-tight text-white sm:text-4xl lg:text-5xl">
                Three Monkeys is Among Phuket&apos;s <br />
                <span className="text-[#b1b94c]">Most Exotic Restaurants and Bars</span>
              </h1>
              
              <p className="mt-6 max-w-lg font-[family-name:var(--font-inter)] text-base font-light leading-relaxed text-white/80 sm:text-lg">
                Seamlessly blending with its natural surroundings within the island&apos;s top outdoor attraction, Hanuman World. Set amongst the backdrop of lush jungle greenery and stunning views.
              </p>
            </motion.div>

            {/* Right: Actions & Slide Controls */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="flex w-full flex-col gap-8 lg:w-auto lg:items-end"
            >
              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-4">
                <Link
                  href="/booking"
                  className="group flex items-center gap-3 rounded-full bg-white px-8 py-4 font-[family-name:var(--font-krona)] text-sm font-bold uppercase tracking-wider text-black transition-all hover:bg-[#b1b94c]"
                >
                  RESERVE A TABLE
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
                <button className="flex h-14 w-14 items-center justify-center rounded-full border border-white/30 bg-black/20 text-white backdrop-blur-md transition-all hover:border-white hover:bg-white/10">
                  <Play className="ml-1 h-5 w-5 fill-current" />
                </button>
              </div>

              {/* Progress & Controls */}
              <div className="flex items-center gap-6 rounded-full border border-white/10 bg-black/30 px-6 py-3 backdrop-blur-md">
                <span className="font-[family-name:var(--font-krona)] text-sm font-semibold tracking-widest text-white">
                  0{currentImage + 1}
                </span>
                
                <div className="flex gap-2">
                  {heroImages.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentImage(idx)}
                      className="group relative h-1.5 w-12 overflow-hidden rounded-full bg-white/20 transition-colors hover:bg-white/40"
                    >
                      {currentImage === idx && (
                        <motion.div
                          layoutId="slideIndicator"
                          className="absolute inset-0 bg-[#b1b94c]"
                          transition={{ type: 'spring', bounce: 0, duration: 0.6 }}
                        />
                      )}
                    </button>
                  ))}
                </div>
                
                <span className="font-[family-name:var(--font-krona)] text-sm font-medium tracking-widest text-white/40">
                  0{heroImages.length}
                </span>
              </div>
            </motion.div>

          </div>
        </div>
      </div>
    </section>
  );
}
