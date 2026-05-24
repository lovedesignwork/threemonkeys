'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import { useRef } from 'react';
import { 
  ArrowRight,
  Leaf,
  Award,
  Users,
  MapPin,
  ChefHat,
  Sparkles,
  Clock,
  Phone,
  Star,
  TreePine,
  Utensils,
  Mountain,
  Heart
} from 'lucide-react';
import { useTranslations } from 'next-intl';

const statIcons = [Award, Users, Star, TreePine];

const valueIcons = [Leaf, ChefHat, Mountain, Heart];

const experienceImages = [
  '/images/small/small-sized_25.jpg',
  '/images/small/small-sized_52.jpg',
  '/images/small/small-sized_01.jpg',
];

export default function AboutPage() {
  const t = useTranslations('aboutPage');
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });
  
  const y1 = useTransform(scrollYProgress, [0, 1], [0, -100]);

  return (
    <main ref={containerRef} className="min-h-screen bg-[#0a0a0a]">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-end justify-center overflow-hidden">
        <motion.div 
          className="absolute inset-0"
          style={{ y: y1 }}
        >
          <Image
            src="/images/new/threemonkeys035.jpg"
            alt="Rainforest"
            fill
            className="object-cover scale-110"
            priority
            unoptimized
          />
        </motion.div>
        
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-[#0a0a0a]" />
        
        <div className="relative z-10 text-center px-4 pb-24 max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-3 px-6 py-3 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full mb-8"
            >
              <TreePine className="w-5 h-5 text-[#b1b94c]" />
              <span className="text-white/80 text-sm font-medium tracking-wide">
                {t('heroBadge')}
              </span>
            </motion.div>
            
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-5xl md:text-7xl lg:text-8xl font-[family-name:var(--font-krona)] text-white mb-8 normal-case leading-[1.1]"
            >
              {t('heroTitle1')}
              <br />
              <span className="text-[#b1b94c]">{t('heroTitle2')}</span>
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="text-xl md:text-2xl text-white/60 max-w-2xl mx-auto font-[family-name:var(--font-inter)] leading-relaxed"
            >
              {t('heroDescription')}
            </motion.p>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="absolute bottom-12 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center pt-2"
          >
            <motion.div className="w-1.5 h-1.5 bg-[#b1b94c] rounded-full" />
          </motion.div>
        </motion.div>
      </section>

      {/* Stats Section */}
      <section className="py-20 relative z-10 -mt-32">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {['years', 'guests', 'awards', 'zones'].map((key, index) => {
              const Icon = statIcons[index];
              return (
                <motion.div
                  key={key}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="p-6 bg-[#111] rounded-2xl border border-white/10 text-center group hover:border-[#b1b94c]/30 transition-colors"
                >
                  <div className="w-12 h-12 bg-[#b1b94c]/10 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:bg-[#b1b94c]/20 transition-colors">
                    <Icon className="w-6 h-6 text-[#b1b94c]" />
                  </div>
                  <p className="text-3xl font-[family-name:var(--font-krona)] text-white mb-1">
                    {t(`stats.${key}.value`)}
                  </p>
                  <p className="text-white/50 text-sm font-[family-name:var(--font-inter)]">
                    {t(`stats.${key}.label`)}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left - Images */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div className="relative aspect-[3/4] rounded-2xl overflow-hidden">
                    <Image
                      src="/images/Random images/32_resize.jpg"
                      alt="Fine Dining"
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                  <div className="relative aspect-square rounded-2xl overflow-hidden">
                    <Image
                      src="/images/Random images/33_resize.jpg"
                      alt="Thai Cuisine"
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                </div>
                <div className="space-y-4 pt-8">
                  <div className="relative aspect-square rounded-2xl overflow-hidden">
                    <Image
                      src="/images/Random images/34_resize.jpg"
                      alt="Restaurant Interior"
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                  <div className="relative aspect-[3/4] rounded-2xl overflow-hidden">
                    <Image
                      src="/images/Random images/35_resize.jpg"
                      alt="Nature Dining"
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                </div>
              </div>
              
              {/* Floating Badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
                className="absolute -bottom-6 left-1/2 -translate-x-1/2 px-6 py-4 bg-[#b1b94c] rounded-2xl shadow-2xl"
              >
                <p className="text-black font-[family-name:var(--font-krona)] text-lg">
                  {t('storyEst')}
                </p>
              </motion.div>
            </motion.div>

            {/* Right - Content */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <span className="text-[#b1b94c] text-sm font-medium uppercase tracking-[0.3em] mb-4 block">
                {t('storyBadge')}
              </span>
              <h2 className="text-4xl md:text-5xl font-[family-name:var(--font-krona)] text-white mb-8 normal-case leading-tight">
                {t('storyTitle1')}
                <br />
                <span className="text-[#b1b94c]">{t('storyTitle2')}</span>
              </h2>
              
              <div className="space-y-6 text-white/60 text-lg font-[family-name:var(--font-inter)] leading-relaxed">
                <p>{t('storyP1')}</p>
                <p>{t('storyP2')}</p>
                <p>{t('storyP3')}</p>
              </div>

              <div className="mt-10">
                <Link href="/seats">
                  <button className="inline-flex items-center gap-3 px-8 py-4 bg-[#b1b94c] text-black font-[family-name:var(--font-krona)] rounded-full hover:bg-[#c4cc5a] transition-all">
                    {t('storyButton')}
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-24 bg-[#111]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="text-[#b1b94c] text-sm font-medium uppercase tracking-[0.3em] mb-4 block">
              {t('valuesBadge')}
            </span>
            <h2 className="text-4xl md:text-5xl font-[family-name:var(--font-krona)] text-white normal-case">
              {t('valuesTitle')}
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {['farmToTable', 'culinaryMastery', 'natureImmersion', 'heartfeltService'].map((key, index) => {
              const Icon = valueIcons[index];
              return (
                <motion.div
                  key={key}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="p-8 bg-[#0a0a0a] rounded-3xl border border-white/10 group hover:border-[#b1b94c]/30 transition-all"
                >
                  <div className="w-14 h-14 bg-[#b1b94c]/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-[#b1b94c]/20 transition-colors">
                    <Icon className="w-7 h-7 text-[#b1b94c]" />
                  </div>
                  <h3 className="text-xl font-[family-name:var(--font-krona)] text-white mb-3 normal-case">
                    {t(`values.${key}.title`)}
                  </h3>
                  <p className="text-white/50 font-[family-name:var(--font-inter)] leading-relaxed">
                    {t(`values.${key}.description`)}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Experience Preview */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="text-[#b1b94c] text-sm font-medium uppercase tracking-[0.3em] mb-4 block">
              {t('experiencesBadge')}
            </span>
            <h2 className="text-4xl md:text-5xl font-[family-name:var(--font-krona)] text-white normal-case mb-4">
              {t('experiencesTitle')}
            </h2>
            <p className="text-white/50 text-lg font-[family-name:var(--font-inter)] max-w-2xl mx-auto">
              {t('experiencesDescription')}
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {['monkeyDome', 'monkeyNest', 'outdoorZone'].map((key, index) => (
              <motion.div
                key={key}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group relative rounded-3xl overflow-hidden"
              >
                <div className="relative aspect-[4/5]">
                  <Image
                    src={experienceImages[index]}
                    alt={t(`experiences.${key}.title`)}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                    unoptimized
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                </div>
                
                <div className="absolute bottom-0 left-0 right-0 p-8">
                  <h3 className="text-2xl font-[family-name:var(--font-krona)] text-white mb-2 normal-case">
                    {t(`experiences.${key}.title`)}
                  </h3>
                  <p className="text-white/60 font-[family-name:var(--font-inter)]">
                    {t(`experiences.${key}.description`)}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mt-12"
          >
            <Link href="/seats">
              <button className="inline-flex items-center gap-2 text-[#b1b94c] font-medium hover:gap-3 transition-all">
                {t('experiencesViewAll')}
                <ArrowRight className="w-5 h-5" />
              </button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Full Width CTA */}
      <section className="relative py-32 overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/images/new/threemonkeys033.jpg"
            alt="Restaurant Ambiance"
            fill
            className="object-cover"
            unoptimized
          />
          <div className="absolute inset-0 bg-black/70" />
        </div>
        
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Sparkles className="w-12 h-12 text-[#b1b94c] mx-auto mb-8" />
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-[family-name:var(--font-krona)] text-white mb-8 normal-case leading-tight">
              {t('ctaTitle1')}
              <br />
              <span className="text-[#b1b94c]">{t('ctaTitle2')}</span>
            </h2>
            <p className="text-xl text-white/60 mb-12 font-[family-name:var(--font-inter)] max-w-2xl mx-auto">
              {t('ctaDescription')}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/booking">
                <button className="inline-flex items-center gap-3 px-10 py-5 bg-[#b1b94c] text-black font-[family-name:var(--font-krona)] rounded-full hover:bg-[#c4cc5a] transition-all">
                  {t('ctaReserve')}
                  <ArrowRight className="w-5 h-5" />
                </button>
              </Link>
              <Link href="/special-packages">
                <button className="inline-flex items-center gap-2 px-10 py-5 border-2 border-white/30 text-white font-[family-name:var(--font-krona)] rounded-full hover:bg-white hover:text-black transition-all">
                  {t('ctaPackages')}
                </button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Location Section */}
      <section className="py-24 bg-[#111]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Map */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative aspect-[4/3] rounded-3xl overflow-hidden border border-white/10"
            >
              <iframe
                src="https://www.openstreetmap.org/export/embed.html?bbox=98.30%2C7.92%2C98.32%2C7.94&layer=mapnik&marker=7.93%2C98.31"
                className="absolute inset-0 w-full h-full"
                style={{ border: 0 }}
                loading="lazy"
              />
            </motion.div>

            {/* Info */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <span className="text-[#b1b94c] text-sm font-medium uppercase tracking-[0.3em] mb-4 block">
                {t('locationBadge')}
              </span>
              <h2 className="text-4xl md:text-5xl font-[family-name:var(--font-krona)] text-white mb-8 normal-case">
                {t('locationTitle')}
              </h2>
              
              <div className="space-y-6">
                <div className="flex items-start gap-4 p-5 bg-[#0a0a0a] rounded-2xl">
                  <div className="w-12 h-12 bg-[#b1b94c]/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-6 h-6 text-[#b1b94c]" />
                  </div>
                  <div>
                    <p className="text-white font-medium mb-1">{t('locationLabel')}</p>
                    <p className="text-white/50 font-[family-name:var(--font-inter)]">
                      {t('locationAddress1')}<br />
                      {t('locationAddress2')}<br />
                      {t('locationAddress3')}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4 p-5 bg-[#0a0a0a] rounded-2xl">
                  <div className="w-12 h-12 bg-[#b1b94c]/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Phone className="w-6 h-6 text-[#b1b94c]" />
                  </div>
                  <div>
                    <p className="text-white font-medium mb-1">{t('contactLabel')}</p>
                    <p className="text-white/50 font-[family-name:var(--font-inter)]">
                      +66 98-010-8838<br />
                      enjoy@threemonkeysphuket.com
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4 p-5 bg-[#0a0a0a] rounded-2xl">
                  <div className="w-12 h-12 bg-[#b1b94c]/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Clock className="w-6 h-6 text-[#b1b94c]" />
                  </div>
                  <div>
                    <p className="text-white font-medium mb-1">{t('hoursLabel')}</p>
                    <p className="text-white/50 font-[family-name:var(--font-inter)]">
                      {t('hoursDaily')}<br />
                      {t('hoursLastOrder')}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex gap-4">
                <Link href="/contact">
                  <button className="inline-flex items-center gap-2 px-6 py-3 bg-[#b1b94c] text-black font-medium rounded-full hover:bg-[#c4cc5a] transition-all">
                    {t('contactButton')}
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </Link>
                <a
                  href="https://maps.app.goo.gl/hk5Z7PQUHnmz6tVB6"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 border border-white/20 text-white font-medium rounded-full hover:bg-white hover:text-black transition-all"
                >
                  {t('directionsButton')}
                </a>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </main>
  );
}
