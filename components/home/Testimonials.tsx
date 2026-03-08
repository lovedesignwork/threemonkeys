'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, ArrowLeft, ArrowRight } from 'lucide-react';
import Image from 'next/image';

const testimonials = [
  {
    id: 1,
    name: 'Sarah Johnson',
    location: 'Sydney, Australia',
    rating: 5,
    text: 'Absolutely incredible dining experience! The flavors were amazing and the staff made us feel so welcome. The garden setting is breathtaking.',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop',
  },
  {
    id: 2,
    name: 'Michael Chen',
    location: 'Singapore',
    rating: 5,
    text: 'Brought my whole family for dinner. Everyone had an amazing time! The servers were patient and professional. Best Thai food we had in Thailand.',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop',
  },
  {
    id: 3,
    name: 'Emma Williams',
    location: 'London, UK',
    rating: 5,
    text: 'The combination of authentic Thai flavors and the beautiful setting is perfect. Worth every penny! The staff speaks great English.',
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop',
  },
  {
    id: 4,
    name: 'David Mueller',
    location: 'Berlin, Germany',
    rating: 5,
    text: 'Professional service, exceptional cuisine, and incredibly friendly staff. This was the culinary highlight of our Thailand trip!',
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop',
  },
];

export function Testimonials() {
  const [current, setCurrent] = useState(0);

  const next = () => setCurrent((prev) => (prev + 1) % testimonials.length);
  const prev = () => setCurrent((prev) => (prev - 1 + testimonials.length) % testimonials.length);

  useEffect(() => {
    const interval = setInterval(next, 6000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative py-32 bg-[#0a0a0a] overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1920"
          alt="Restaurant ambiance"
          fill
          className="object-cover opacity-20"
          unoptimized
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-black" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          
          {/* Left Side - Header & Stats */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <span className="text-[#b1b94c] text-sm font-medium uppercase tracking-[0.3em]">
                Reviews
              </span>
              <h2 className="mt-4 text-4xl md:text-5xl lg:text-6xl font-[family-name:var(--font-krona)] text-white leading-tight normal-case">
                What Our
                <br />
                <span className="text-[#b1b94c]">Guests Say</span>
              </h2>
              <p className="mt-6 text-white/50 text-lg max-w-md">
                Don&apos;t just take our word for it. Here&apos;s what diners from around the world have to say.
              </p>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="mt-12 grid grid-cols-3 gap-8"
            >
              <div>
                <div className="text-4xl md:text-5xl font-[family-name:var(--font-krona)] text-white">4.9</div>
                <div className="mt-1 flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-[#b1b94c] fill-current" />
                  ))}
                </div>
                <div className="mt-2 text-white/40 text-sm">Google Rating</div>
              </div>
              <div>
                <div className="text-4xl md:text-5xl font-[family-name:var(--font-krona)] text-white">50K+</div>
                <div className="mt-2 text-white/40 text-sm">Happy Guests</div>
              </div>
              <div>
                <div className="text-4xl md:text-5xl font-[family-name:var(--font-krona)] text-white">#1</div>
                <div className="mt-2 text-white/40 text-sm">In Phuket</div>
              </div>
            </motion.div>
          </div>

          {/* Right Side - Testimonial Card */}
          <div className="relative">
            {/* Navigation */}
            <div className="absolute -top-16 right-0 flex gap-3 z-10">
              <button
                onClick={prev}
                className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center text-white/60 hover:bg-[#b1b94c] hover:border-[#b1b94c] hover:text-black transition-all"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <button
                onClick={next}
                className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center text-white/60 hover:bg-[#b1b94c] hover:border-[#b1b94c] hover:text-black transition-all"
              >
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>

            {/* Card */}
            <AnimatePresence mode="wait">
              <motion.div
                key={current}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.4 }}
                className="relative"
              >
                {/* Quote Mark */}
                <div className="absolute -top-6 -left-4 text-[120px] font-serif text-[#b1b94c]/20 leading-none select-none">
                  &ldquo;
                </div>

                <div className="relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-8 md:p-10">
                  {/* Stars */}
                  <div className="flex gap-1 mb-6">
                    {[...Array(testimonials[current].rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-[#b1b94c] fill-current" />
                    ))}
                  </div>

                  {/* Quote */}
                  <p className="text-white text-xl md:text-2xl leading-relaxed font-light">
                    {testimonials[current].text}
                  </p>

                  {/* Author */}
                  <div className="mt-8 flex items-center gap-4">
                    <div className="relative w-14 h-14 rounded-full overflow-hidden border-2 border-[#b1b94c]">
                      <Image
                        src={testimonials[current].image}
                        alt={testimonials[current].name}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                    <div>
                      <h4 className="text-white font-semibold text-lg">
                        {testimonials[current].name}
                      </h4>
                      <p className="text-white/40 text-sm">
                        {testimonials[current].location}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Progress Indicator */}
                <div className="mt-8 flex gap-2">
                  {testimonials.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrent(index)}
                      className="relative h-1 flex-1 bg-white/10 rounded-full overflow-hidden"
                    >
                      {index === current && (
                        <motion.div
                          initial={{ scaleX: 0 }}
                          animate={{ scaleX: 1 }}
                          transition={{ duration: 6, ease: 'linear' }}
                          className="absolute inset-0 bg-[#b1b94c] origin-left"
                        />
                      )}
                      {index < current && (
                        <div className="absolute inset-0 bg-[#b1b94c]" />
                      )}
                    </button>
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
