'use client';

import { useMemo, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from '@/i18n/navigation';
import Image from 'next/image';
import { ArrowRight, Star, Heart, Sparkles } from 'lucide-react';
import { getSeatPackages } from '@/lib/data/packages';
import { Package } from '@/types';
import { useTranslations } from 'next-intl';
import { useTranslatedPackage } from '@/hooks/useTranslatedPackage';

const heroImages = [
  '/images/new/threemonkeys048.jpg',
  '/images/new/threemonkeys042.jpg',
];

const isRomanticZone = (pkg: Package) => {
  return pkg.id.includes('romantic') || 
         pkg.name.toLowerCase().includes('romantic') ||
         pkg.features.some(f => f.toLowerCase().includes('romantic'));
};

export default function SeatsPage() {
  const t = useTranslations('seatsPage');
  const { getTranslatedPackage } = useTranslatedPackage();
  const [currentImage, setCurrentImage] = useState(0);
  
  const seatPackages = useMemo(() => {
    const packages = getSeatPackages();
    return packages.map(pkg => getTranslatedPackage(pkg));
  }, [getTranslatedPackage]);
  
  // Scroll to top on page mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Hero slideshow
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Loading fallback if no packages
  if (!seatPackages || seatPackages.length === 0) {
    return (
      <main className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-white text-center">
          <div className="w-8 h-8 border-2 border-[#b1b94c] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p>Loading seats...</p>
        </div>
      </main>
    );
  }

  return (
    <main key="seats-page" className="min-h-screen bg-[#0a0a0a]">
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
      <section className="relative h-[60vh] lg:h-[70vh] flex items-end justify-center overflow-hidden">
        <div className="absolute inset-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentImage}
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1 }}
              className="absolute inset-0"
            >
              <Image
                src={heroImages[currentImage]}
                alt="Our Seats"
                fill
                className="object-cover"
                priority
                unoptimized
              />
            </motion.div>
          </AnimatePresence>
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-black/40 to-black/20" />
        </div>

        <div className="relative z-10 text-center px-4 pt-32 pb-12">
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-block text-[#b1b94c] text-sm font-medium uppercase tracking-[0.3em] mb-6"
          >
            {t('badge')}
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-6xl lg:text-7xl font-[family-name:var(--font-krona)] text-white mb-6 normal-case"
          >
            {t('headline')}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-white/60 text-lg max-w-2xl mx-auto font-[family-name:var(--font-inter)]"
          >
            {t('description')}
          </motion.p>
        </div>
      </section>

      {/* Seats Grid */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Premium Seats - Monkey Dome & Monkey Nest */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-2 h-2 bg-[#b1b94c] rounded-full" />
              <span className="text-sm font-medium text-[#b1b94c] uppercase tracking-wider">{t('premiumSeats')}</span>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              {seatPackages.filter(pkg => pkg.id === 'monkey-dome' || pkg.id === 'monkey-nest').map((pkg, index) => (
                <motion.div
                  key={pkg.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05, duration: 0.5 }}
                >
                  <Link href={`/packages/${pkg.slug}`} className="group block h-full">
                    <div className="relative h-full md:min-h-[420px] bg-[#111] rounded-3xl overflow-hidden border-2 border-[#b1b94c]/40 hover:border-[#b1b94c] transition-all duration-500 flex flex-col md:flex-row">
                      {/* Image - Left Side (60% width) */}
                      <div className="relative w-full md:w-[60%] aspect-[4/3] md:aspect-auto flex-shrink-0 overflow-hidden">
                        <Image
                          src={pkg.image}
                          alt={pkg.name}
                          fill
                          className="object-cover transition-transform duration-700 group-hover:scale-110"
                          unoptimized
                        />
                        
                        {/* Badges */}
                        <div className="absolute top-4 left-4 flex flex-row gap-2 items-center">
                          {pkg.popular && (
                            <div className="px-3 py-1.5 bg-[#b1b94c] rounded-full flex items-center gap-1.5">
                              <Star className="w-3.5 h-3.5 text-black fill-current" />
                              <span className="text-black text-xs font-semibold">{t('popular')}</span>
                            </div>
                          )}
                          {isRomanticZone(pkg) && (
                            <div className="relative">
                              <Heart className="w-6 h-6 romantic-heart-icon" />
                              <div className="romantic-glitter" />
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Content - Right Side (40% width) */}
                      <div className="w-full md:w-[40%] p-6 flex flex-col justify-center">
                        {/* Title */}
                        <h3 className="text-xl font-[family-name:var(--font-krona)] text-white group-hover:text-[#b1b94c] transition-colors normal-case leading-tight mb-2">
                          {pkg.name}
                        </h3>
                        <p className="text-white/50 text-sm mb-4 font-[family-name:var(--font-inter)]">
                          {pkg.shortDescription}
                        </p>
                        
                        {/* Feature Tags */}
                        <div className="flex flex-wrap gap-2 mb-6">
                          {pkg.features.slice(0, 3).map((feature, idx) => (
                            <span 
                              key={idx}
                              className="px-3 py-1 bg-[#b1b94c]/10 border border-[#b1b94c]/40 rounded-full text-[#b1b94c]/80 text-xs font-[family-name:var(--font-inter)]"
                            >
                              {feature}
                            </span>
                          ))}
                        </div>
                        
                        {/* Price Section */}
                        <div className="mb-4">
                          <span className="text-white/40 text-xs uppercase tracking-wider block mb-1">{t('deposit')}</span>
                          <div className="flex items-baseline gap-1">
                            <span className="text-3xl font-bold text-[#b1b94c] font-[family-name:var(--font-krona)]">
                              ฿4,000
                            </span>
                            <span className="text-white/40 text-sm">{t('perTable')}</span>
                          </div>
                          <span className="text-white/30 text-xs">{t('upTo', { n: 4 })}</span>
                        </div>
                        
                        {/* Reserve Button */}
                        <motion.div
                          className="flex items-center justify-center gap-2 w-full py-3 bg-[#b1b94c] rounded-xl text-black font-semibold text-sm"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          {t('reserveNow')}
                          <ArrowRight className="w-4 h-4" />
                        </motion.div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Other Seats */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-2 h-2 bg-white/40 rounded-full" />
              <span className="text-sm font-medium text-white/40 uppercase tracking-wider">{t('moreOptions')}</span>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {seatPackages.filter(pkg => pkg.id !== 'monkey-dome' && pkg.id !== 'monkey-nest' && pkg.id !== 'indoor-seat' && pkg.id !== 'outdoor-seat').map((pkg, index) => (
              <motion.div
                key={pkg.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + index * 0.05, duration: 0.5 }}
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
                      <div className="absolute inset-0 bg-gradient-to-t from-[#111]/70 via-transparent to-transparent" />
                      
                      {/* Badges - Right Side */}
                      <div className="absolute top-4 right-4 flex flex-row gap-2 items-center">
                        {/* Popular Badge */}
                        {pkg.popular && (
                          <div className="px-3 py-1.5 bg-[#b1b94c] rounded-full flex items-center gap-1.5">
                            <Star className="w-3.5 h-3.5 text-black fill-current" />
                            <span className="text-black text-xs font-semibold">{t('popular')}</span>
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
                    <div className="p-5">
                      {/* Title with icon */}
                      <div className="flex items-start gap-3 mb-3">
                        <motion.div 
                          className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#b1b94c]/20 to-[#b1b94c]/5 flex items-center justify-center flex-shrink-0 group-hover:from-[#b1b94c]/30 group-hover:to-[#b1b94c]/10 transition-all"
                          whileHover={{ rotate: [0, -5, 5, 0] }}
                        >
                          <Sparkles className="w-5 h-5 text-[#b1b94c]" />
                        </motion.div>
                        <div>
                          <h3 className="text-lg font-[family-name:var(--font-krona)] text-white group-hover:text-[#b1b94c] transition-colors normal-case leading-tight">
                            {pkg.name}
                          </h3>
                          <p className="text-white/40 text-xs mt-1 font-[family-name:var(--font-inter)]">
                            {pkg.shortDescription}
                          </p>
                        </div>
                      </div>
                      
                      {/* Feature Tags */}
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {pkg.features.slice(0, 3).map((feature, idx) => (
                          <span 
                            key={idx}
                            className="px-2 py-0.5 bg-white/5 rounded-full text-white/50 text-[10px] font-[family-name:var(--font-inter)]"
                          >
                            {feature}
                          </span>
                        ))}
                      </div>
                      
                      {/* Price Card */}
                      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#b1b94c]/10 via-[#b1b94c]/5 to-transparent p-4 border border-[#b1b94c]/20 group-hover:border-[#b1b94c]/40 transition-all">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-white/40 text-[10px] uppercase tracking-wider block">{t('deposit')}</span>
                            <span className="text-xl font-bold text-[#b1b94c] font-[family-name:var(--font-krona)]">
                              ฿500
                            </span>
                            <span className="text-white/30 text-[10px] ml-1">{t('perPerson')}</span>
                          </div>
                          <motion.div
                            className="flex items-center gap-2 px-4 py-2 bg-[#b1b94c] rounded-xl text-black font-semibold text-sm"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            {t('reserve')}
                            <ArrowRight className="w-4 h-4" />
                          </motion.div>
                        </div>
                        
                        {/* Decorative glow */}
                        <div className="absolute -right-8 -bottom-8 w-24 h-24 bg-[#b1b94c]/10 rounded-full blur-2xl group-hover:bg-[#b1b94c]/20 transition-all" />
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
            </div>
          </div>

          {/* Open Seating - Indoor & Outdoor */}
          <div className="mt-16">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-2 h-2 bg-[#b1b94c] rounded-full" />
              <span className="text-sm font-medium text-[#b1b94c] uppercase tracking-wider">{t('openSeating')}</span>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              {seatPackages.filter(pkg => pkg.id === 'indoor-seat' || pkg.id === 'outdoor-seat').map((pkg, index) => (
                <motion.div
                  key={pkg.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05, duration: 0.5 }}
                >
                  <Link href={`/packages/${pkg.slug}`} className="group block h-full">
                    <div className="relative h-full md:min-h-[420px] bg-[#111] rounded-3xl overflow-hidden border-2 border-[#b1b94c]/40 hover:border-[#b1b94c] transition-all duration-500 flex flex-col md:flex-row">
                      {/* Image - Left Side (60% width) */}
                      <div className="relative w-full md:w-[60%] aspect-[4/3] md:aspect-auto flex-shrink-0 overflow-hidden">
                        <Image
                          src={pkg.image}
                          alt={pkg.name}
                          fill
                          className="object-cover transition-transform duration-700 group-hover:scale-110"
                          unoptimized
                        />
                      </div>

                      {/* Content - Right Side (40% width) */}
                      <div className="w-full md:w-[40%] p-6 flex flex-col justify-center">
                        {/* Title */}
                        <h3 className="text-xl font-[family-name:var(--font-krona)] text-white group-hover:text-[#b1b94c] transition-colors normal-case leading-tight mb-2">
                          {pkg.name}
                        </h3>
                        <p className="text-white/50 text-sm mb-4 font-[family-name:var(--font-inter)]">
                          {pkg.shortDescription}
                        </p>

                        {/* Feature Tags */}
                        <div className="flex flex-wrap gap-2 mb-6">
                          {pkg.features.slice(0, 3).map((feature, idx) => (
                            <span
                              key={idx}
                              className="px-3 py-1 bg-[#b1b94c]/10 border border-[#b1b94c]/40 rounded-full text-[#b1b94c]/80 text-xs font-[family-name:var(--font-inter)]"
                            >
                              {feature}
                            </span>
                          ))}
                        </div>

                        {/* Price Section */}
                        <div className="mb-4">
                          <span className="text-white/40 text-xs uppercase tracking-wider block mb-1">{t('deposit')}</span>
                          <div className="flex items-baseline gap-1">
                            <span className="text-3xl font-bold text-[#b1b94c] font-[family-name:var(--font-krona)]">
                              ฿500
                            </span>
                            <span className="text-white/40 text-sm">{t('perPerson')}</span>
                          </div>
                          <span className="text-white/30 text-xs">{t('noLimit')}</span>
                        </div>

                        {/* Reserve Button */}
                        <motion.div
                          className="flex items-center justify-center gap-2 w-full py-3 bg-[#b1b94c] rounded-xl text-black font-semibold text-sm"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          {t('reserveNow')}
                          <ArrowRight className="w-4 h-4" />
                        </motion.div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-[#111]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            <h2 className="text-3xl md:text-4xl font-[family-name:var(--font-krona)] text-white mb-4 normal-case">
              {t('ctaTitle')}
            </h2>
            <p className="text-white/50 text-lg mb-8 font-[family-name:var(--font-inter)]">
              {t('ctaDescription')}
            </p>
            <Link href="/special-packages">
              <button className="inline-flex items-center gap-2 px-8 py-4 bg-[#b1b94c] text-black font-[family-name:var(--font-krona)] rounded-full hover:bg-[#c4cc5a] transition-all">
                {t('ctaButton')}
                <ArrowRight className="w-5 h-5" />
              </button>
            </Link>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
