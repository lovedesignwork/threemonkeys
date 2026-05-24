'use client';

import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Link } from '@/i18n/navigation';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { 
  Clock, 
  Users, 
  ArrowRight, 
  Check, 
  Utensils,
  Star,
  MapPin,
  Phone,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Heart,
  Music,
  Wine,
  Flower2,
  Camera,
  Car,
  Cake,
  PartyPopper,
  Flame,
  Gift,
  Table2,
  MessageCircle,
  Mail,
  type LucideIcon
} from 'lucide-react';
import { getPackageBySlug, packages } from '@/lib/data/packages';

const getIconForInclusion = (text: string, index: number): LucideIcon => {
  const lowerText = text.toLowerCase();
  
  if (lowerText.includes('saxophone')) return Music;
  if (lowerText.includes('band') || lowerText.includes('bongo')) return PartyPopper;
  if (lowerText.includes('prosecco') || lowerText.includes('wine') || lowerText.includes('champagne')) return Wine;
  if (lowerText.includes('flower') || lowerText.includes('rose')) return Flower2;
  if (lowerText.includes('bouquet')) return Gift;
  if (lowerText.includes('photo')) return Camera;
  if (lowerText.includes('video')) return Sparkles;
  if (lowerText.includes('transfer') || lowerText.includes('pick-up') || lowerText.includes('round-trip')) return Car;
  if (lowerText.includes('cake')) return Cake;
  if (lowerText.includes('balloon')) return PartyPopper;
  if (lowerText.includes('spark') || lowerText.includes('fountain')) return Flame;
  if (lowerText.includes('fire show')) return Flame;
  if (lowerText.includes('smoke')) return Sparkles;
  if (lowerText.includes('honeymoon')) return Heart;
  if (lowerText.includes('table setting') || lowerText.includes('themed table')) return Table2;
  if (lowerText.includes('decoration')) return Sparkles;
  if (lowerText.includes('elegant')) return Star;
  
  const fallbackIcons = [Sparkles, Star, Heart, Gift, Flower2, Music, Camera, Flame];
  return fallbackIcons[index % fallbackIcons.length];
};
import { formatPrice } from '@/lib/utils';
import { notFound } from 'next/navigation';
import { useState } from 'react';

export default function PackagePage() {
  const params = useParams();
  const slug = params.slug as string;
  const pkg = getPackageBySlug(slug);
  const [activeImage, setActiveImage] = useState(0);
  const t = useTranslations('packageDetailPage');

  if (!pkg) {
    notFound();
  }

  const otherPackages = packages.filter(p => p.id !== pkg.id && p.category !== 'transfer').slice(0, 3);
  
  // Gallery images (use package gallery if available, otherwise default images)
  const galleryImages = pkg.gallery && pkg.gallery.length > 0 
    ? pkg.gallery 
    : [
        pkg.image,
        '/images/by_slide/slide_05/monkey-dome02.jpg',
        '/images/by_slide/slide_05/monkey-dome03.jpg',
        '/images/by_slide/slide_05/monkey-dome04.jpg',
      ];

  return (
    <main className="min-h-screen bg-[#0a0a0a]">
      {/* Hero Section
          - Mobile: square (1:1) so the dish/zone image shows in full
            with minimal overlay.
          - Tablet+: 60vh / 70vh tall as before.
          - Arrows + thumbnails let the customer browse the gallery. */}
      <section className="relative aspect-square sm:aspect-auto sm:h-[60vh] lg:h-[70vh] overflow-hidden">
        {/* Background image */}
        <motion.div
          className="absolute inset-0"
          initial={{ scale: 1.05 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.5 }}
        >
          <Image
            key={galleryImages[activeImage]}
            src={galleryImages[activeImage]}
            alt={pkg.name}
            fill
            className="object-cover"
            priority
            unoptimized
          />
          {/* Lighter overlay on mobile (image-forward), stronger on
              desktop where text overlays the hero. */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a]/80 via-transparent to-transparent sm:from-[#0a0a0a] sm:via-black/40 sm:to-black/20" />
        </motion.div>

        {/* Prev / Next arrows — vertically centered, never on top of the title */}
        {galleryImages.length > 1 && (
          <>
            <button
              type="button"
              onClick={() =>
                setActiveImage((prev) => (prev - 1 + galleryImages.length) % galleryImages.length)
              }
              aria-label="Previous photo"
              className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-20 flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-full border border-white/20 bg-black/40 text-white backdrop-blur-md transition-all hover:bg-[#b1b94c] hover:text-black hover:border-[#b1b94c]"
            >
              <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6" />
            </button>
            <button
              type="button"
              onClick={() =>
                setActiveImage((prev) => (prev + 1) % galleryImages.length)
              }
              aria-label="Next photo"
              className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-20 flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-full border border-white/20 bg-black/40 text-white backdrop-blur-md transition-all hover:bg-[#b1b94c] hover:text-black hover:border-[#b1b94c]"
            >
              <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6" />
            </button>
          </>
        )}

        {/* Thumbnail rail — redesigned for better visibility */}
        {galleryImages.length > 1 && (
          <div className="absolute bottom-6 sm:bottom-8 left-1/2 -translate-x-1/2 z-20">
            <div className="flex items-center gap-1 sm:gap-2 bg-black/60 backdrop-blur-xl rounded-2xl p-2 sm:p-3 border border-white/10 shadow-2xl">
              {/* Image counter */}
              <div className="hidden sm:flex items-center justify-center px-3 py-1 mr-2 bg-white/10 rounded-lg">
                <span className="text-white/90 text-sm font-medium tabular-nums">
                  {activeImage + 1} / {galleryImages.length}
                </span>
              </div>
              
              {/* Thumbnails */}
              <div className="flex gap-2 sm:gap-3 max-w-[70vw] sm:max-w-[60vw] overflow-x-auto no-scrollbar">
                {galleryImages.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveImage(index)}
                    aria-label={`Show photo ${index + 1}`}
                    className={`group relative flex-shrink-0 w-16 h-12 sm:w-20 sm:h-14 lg:w-24 lg:h-16 rounded-xl overflow-hidden transition-all duration-300 ${
                      activeImage === index
                        ? 'ring-2 ring-[#b1b94c] ring-offset-2 ring-offset-black/60 scale-105'
                        : 'ring-1 ring-white/20 opacity-70 hover:opacity-100 hover:ring-white/40'
                    }`}
                  >
                    <Image 
                      src={img} 
                      alt="" 
                      fill 
                      className={`object-cover transition-transform duration-300 ${
                        activeImage === index ? '' : 'group-hover:scale-110'
                      }`} 
                      unoptimized 
                    />
                    {/* Active indicator overlay */}
                    {activeImage === index && (
                      <div className="absolute inset-0 bg-[#b1b94c]/20 pointer-events-none" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Content Section */}
      <section className="relative z-10 -mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content - 2 columns */}
            <div className="lg:col-span-2 space-y-8">
              {/* Title Card */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-8 bg-[#111] rounded-3xl border border-white/10"
              >
                {/* Category Badge */}
                <div className="flex items-center gap-3 mb-4">
                  <span className="px-3 py-1 bg-[#b1b94c]/20 text-[#b1b94c] rounded-full text-xs font-medium uppercase tracking-wider">
                    {pkg.category === 'zone' ? 'Dining Zone' : pkg.category === 'romantic' ? 'Romantic Dining' : pkg.category}
                  </span>
                  <div className="flex items-center gap-1 text-[#b1b94c]">
                    <Star className="w-4 h-4 fill-current" />
                    <span className="text-sm font-medium">4.9</span>
                  </div>
                </div>

                {/* Title */}
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-[family-name:var(--font-krona)] text-white mb-4 normal-case">
                  {pkg.name}
                </h1>

                {/* Quick Stats */}
                <div className="flex flex-wrap gap-4 mb-6">
                  <div className="flex items-center gap-2 text-white/60">
                    <Clock className="w-4 h-4 text-[#b1b94c]" />
                    <span className="text-sm">{pkg.duration}</span>
                  </div>
                  <div className="flex items-center gap-2 text-white/60">
                    <Users className="w-4 h-4 text-[#b1b94c]" />
                    <span className="text-sm">
                      {pkg.id === 'monkey-nest' ? '2-6 guests on Monkey Nest seat only' : pkg.id === 'zone-7' ? 'up to 10 guests' : pkg.id === 'zone-6' ? 'up to 50 guests' : pkg.id === 'rooftop-romantic' ? 'up to 40 guests' : pkg.id === 'indoor-seat' || pkg.id === 'outdoor-seat' ? 'open seating' : '2-4 guests'}
                    </span>
                  </div>
                  {pkg.includesMeal && (
                    <div className="flex items-center gap-2 text-white/60">
                      <Utensils className="w-4 h-4 text-[#b1b94c]" />
                      <span className="text-sm">Meal Included</span>
                    </div>
                  )}
                </div>

                {/* Description */}
                <p className="text-white/60 text-lg leading-relaxed font-[family-name:var(--font-inter)]">
                  {pkg.description}
                </p>
              </motion.div>

              {/* What's Included */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="p-8 bg-[#111] rounded-3xl border border-white/10"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-[#b1b94c]/20 rounded-xl flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-[#b1b94c]" />
                  </div>
                  <h2 className="text-2xl font-[family-name:var(--font-krona)] text-white normal-case">
                    {t('whatsIncluded')}
                  </h2>
                </div>

                <div className="grid sm:grid-cols-2 gap-3">
                  {pkg.included.map((item, index) => {
                    const IconComponent = getIconForInclusion(item, index);
                    return (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 + index * 0.05 }}
                        className="group flex items-center gap-4 p-4 bg-white/5 rounded-xl"
                      >
                        <div className="relative flex items-center justify-center flex-shrink-0 w-10 h-10">
                          <motion.div
                            className="absolute w-10 h-10 rounded-full blur-md"
                            animate={{ 
                              scale: [1, 1.5, 1],
                              opacity: [0.3, 0.6, 0.3],
                              backgroundColor: ['#b1b94c', '#f0e68c', '#b1b94c']
                            }}
                            transition={{ 
                              duration: 4,
                              repeat: Infinity,
                              ease: "easeInOut",
                              delay: index * 0.25
                            }}
                          />
                          <motion.div
                            animate={{ 
                              scale: [1, 1.15, 1],
                              color: ['#b1b94c', '#f0e68c', '#b1b94c']
                            }}
                            transition={{ 
                              duration: 4,
                              repeat: Infinity,
                              ease: "easeInOut",
                              delay: index * 0.25
                            }}
                            style={{ color: '#b1b94c' }}
                          >
                            <IconComponent className="relative z-10 w-7 h-7 drop-shadow-[0_0_10px_currentColor]" style={{ color: 'inherit' }} />
                          </motion.div>
                        </div>
                        <span className="text-white/80 text-sm font-[family-name:var(--font-inter)]">
                          {pkg.id === 'monkey-dome' ? (
                            item === 'Reserved zone seating' ? t('included.reservedZoneSeating') :
                            item === 'Fully redeemable' ? t('included.fullyRedeemable') :
                            item === 'Ambient lighting' ? t('included.ambientLighting') :
                            item === 'Priority service' ? t('included.priorityService') :
                            item
                          ) : pkg.id === 'zone-7' ? (
                            item === 'Reserved zone seating' ? t('included.reservedZoneSeating') :
                            item === 'Flexible setup' ? t('included.flexibleSetup') :
                            item === 'Fully redeemable' ? t('included.fullyRedeemable') :
                            item === 'Prime entertainment' ? t('included.primeEntertainment') :
                            item
                          ) : pkg.id === 'ultimate-dinner' ? (
                            item === 'Romantic table setting curated for honeymoon & anniversary celebrations' ? t('included.romanticTableSetting') :
                            item === 'Elegant table decorations' ? t('included.elegantDecorations') :
                            item === '1 bottle of sparkling wine (Prosecco)' ? t('included.sparklingWine') :
                            item === '1 Bouquet of fresh roses' ? t('included.bouquetRoses') :
                            item === '1 Spark fountain effect for a dramatic highlight' ? t('included.sparkFountain') :
                            item === 'Professional photo & video capture' ? t('included.photoVideoCapture') :
                            item === 'Private round-trip transfer within Phuket (Max 10 persons/van)' ? t('included.privateTransfer') :
                            item
                          ) : pkg.id === 'will-you-marry-me' ? (
                            item === 'Red Rose Bouquet' ? t('included.redRoseBouquet') :
                            item === 'Spark Fountain Effect' ? t('included.sparkFountainEffect') :
                            item === 'Heart-Shaped Rose Frame with "Will You Marry Me?" Neon Sign' ? t('included.heartShapedRoseFrame') :
                            item
                          ) : item}
                        </span>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>

              {/* Experience Highlights */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="p-8 bg-[#111] rounded-3xl border border-white/10"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-[#b1b94c]/20 rounded-xl flex items-center justify-center">
                    <Heart className="w-5 h-5 text-[#b1b94c]" />
                  </div>
                  <h2 className="text-2xl font-[family-name:var(--font-krona)] text-white normal-case">
                    {t('theExperience')}
                  </h2>
                </div>

                <div className="grid sm:grid-cols-3 gap-4">
                  {pkg.id === 'monkey-dome' ? (
                    <>
                      <div className="p-5 bg-gradient-to-br from-[#b1b94c]/10 to-transparent rounded-2xl border border-[#b1b94c]/20 text-center">
                        <div className="text-lg font-[family-name:var(--font-krona)] text-[#b1b94c] mb-1">
                          {t('romanticSpot')}
                        </div>
                        <div className="text-white/50 text-sm">{t('spot')}</div>
                      </div>
                      <div className="p-5 bg-gradient-to-br from-[#b1b94c]/10 to-transparent rounded-2xl border border-[#b1b94c]/20 text-center">
                        <div className="text-lg font-[family-name:var(--font-krona)] text-[#b1b94c] mb-1">
                          {t('natural')}
                        </div>
                        <div className="text-white/50 text-sm">{t('immersion')}</div>
                      </div>
                      <div className="p-5 bg-gradient-to-br from-[#b1b94c]/10 to-transparent rounded-2xl border border-[#b1b94c]/20 text-center">
                        <div className="text-3xl font-[family-name:var(--font-krona)] text-[#b1b94c] mb-1">
                          5.0
                        </div>
                        <div className="text-white/50 text-sm">{t('guestRating')}</div>
                      </div>
                    </>
                  ) : pkg.id === 'monkey-nest' ? (
                    <>
                      <div className="p-5 bg-gradient-to-br from-[#b1b94c]/10 to-transparent rounded-2xl border border-[#b1b94c]/20 text-center">
                        <div className="text-3xl font-[family-name:var(--font-krona)] text-[#b1b94c] mb-1">
                          360°
                        </div>
                        <div className="text-white/50 text-sm">Panoramic View</div>
                      </div>
                      <div className="p-5 bg-gradient-to-br from-[#b1b94c]/10 to-transparent rounded-2xl border border-[#b1b94c]/20 text-center">
                        <div className="text-3xl font-[family-name:var(--font-krona)] text-[#b1b94c] mb-1">
                          100%
                        </div>
                        <div className="text-white/50 text-sm">Natural Immersion</div>
                      </div>
                      <div className="p-5 bg-gradient-to-br from-[#b1b94c]/10 to-transparent rounded-2xl border border-[#b1b94c]/20 text-center">
                        <div className="text-3xl font-[family-name:var(--font-krona)] text-[#b1b94c] mb-1">
                          5.0
                        </div>
                        <div className="text-white/50 text-sm">Guest Rating</div>
                      </div>
                    </>
                  ) : pkg.id === 'bamboo-pavilion' ? (
                    <>
                      <div className="p-5 bg-gradient-to-br from-[#b1b94c]/10 to-transparent rounded-2xl border border-[#b1b94c]/20 text-center">
                        <div className="text-2xl font-[family-name:var(--font-krona)] text-[#b1b94c] mb-1">
                          Signature
                        </div>
                        <div className="text-white/50 text-sm">Decoration</div>
                      </div>
                      <div className="p-5 bg-gradient-to-br from-[#b1b94c]/10 to-transparent rounded-2xl border border-[#b1b94c]/20 text-center">
                        <div className="text-2xl font-[family-name:var(--font-krona)] text-[#b1b94c] mb-1">
                          Romantic
                        </div>
                        <div className="text-white/50 text-sm">Area</div>
                      </div>
                      <div className="p-5 bg-gradient-to-br from-[#b1b94c]/10 to-transparent rounded-2xl border border-[#b1b94c]/20 text-center">
                        <div className="text-3xl font-[family-name:var(--font-krona)] text-[#b1b94c] mb-1">
                          5.0
                        </div>
                        <div className="text-white/50 text-sm">Guest Rating</div>
                      </div>
                    </>
                  ) : pkg.id === 'exclusive-romantic-zone-7' ? (
                    <>
                      <div className="p-5 bg-gradient-to-br from-[#b1b94c]/10 to-transparent rounded-2xl border border-[#b1b94c]/20 text-center">
                        <div className="text-2xl font-[family-name:var(--font-krona)] text-[#b1b94c] mb-1">
                          Live Shows
                        </div>
                        <div className="text-white/50 text-sm">Entertainment</div>
                      </div>
                      <div className="p-5 bg-gradient-to-br from-[#b1b94c]/10 to-transparent rounded-2xl border border-[#b1b94c]/20 text-center">
                        <div className="text-2xl font-[family-name:var(--font-krona)] text-[#b1b94c] mb-1">
                          Good
                        </div>
                        <div className="text-white/50 text-sm">Ambience</div>
                      </div>
                      <div className="p-5 bg-gradient-to-br from-[#b1b94c]/10 to-transparent rounded-2xl border border-[#b1b94c]/20 text-center">
                        <div className="text-3xl font-[family-name:var(--font-krona)] text-[#b1b94c] mb-1">
                          5.0
                        </div>
                        <div className="text-white/50 text-sm">Guest Rating</div>
                      </div>
                    </>
                  ) : pkg.id === 'zone-6' ? (
                    <>
                      <div className="p-5 bg-gradient-to-br from-[#b1b94c]/10 to-transparent rounded-2xl border border-[#b1b94c]/20 text-center">
                        <div className="text-xl font-[family-name:var(--font-krona)] text-[#b1b94c] mb-1">
                          Iconic
                        </div>
                        <div className="text-white/50 text-sm">Giant Tree</div>
                      </div>
                      <div className="p-5 bg-gradient-to-br from-[#b1b94c]/10 to-transparent rounded-2xl border border-[#b1b94c]/20 text-center">
                        <div className="text-2xl font-[family-name:var(--font-krona)] text-[#b1b94c] mb-1">
                          Night
                        </div>
                        <div className="text-white/50 text-sm">Ambience</div>
                      </div>
                      <div className="p-5 bg-gradient-to-br from-[#b1b94c]/10 to-transparent rounded-2xl border border-[#b1b94c]/20 text-center">
                        <div className="text-3xl font-[family-name:var(--font-krona)] text-[#b1b94c] mb-1">
                          5.0
                        </div>
                        <div className="text-white/50 text-sm">Guest Rating</div>
                      </div>
                    </>
                  ) : pkg.id === 'zone-7' ? (
                    <>
                      <div className="p-5 bg-gradient-to-br from-[#b1b94c]/10 to-transparent rounded-2xl border border-[#b1b94c]/20 text-center">
                        <div className="text-xl font-[family-name:var(--font-krona)] text-[#b1b94c] mb-1">
                          {t('experience.liveShows')}
                        </div>
                        <div className="text-white/50 text-sm">Entertainment</div>
                      </div>
                      <div className="p-5 bg-gradient-to-br from-[#b1b94c]/10 to-transparent rounded-2xl border border-[#b1b94c]/20 text-center">
                        <div className="text-xl font-[family-name:var(--font-krona)] text-[#b1b94c] mb-1">
                          {t('experience.goodAmbience')}
                        </div>
                        <div className="text-white/50 text-sm">Atmosphere</div>
                      </div>
                      <div className="p-5 bg-gradient-to-br from-[#b1b94c]/10 to-transparent rounded-2xl border border-[#b1b94c]/20 text-center">
                        <div className="text-3xl font-[family-name:var(--font-krona)] text-[#b1b94c] mb-1">
                          5.0
                        </div>
                        <div className="text-white/50 text-sm">{t('guestRating')}</div>
                      </div>
                    </>
                  ) : pkg.id === 'rooftop-romantic' ? (
                    <>
                      <div className="p-5 bg-gradient-to-br from-[#b1b94c]/10 to-transparent rounded-2xl border border-[#b1b94c]/20 text-center">
                        <div className="text-lg font-[family-name:var(--font-krona)] text-[#b1b94c] mb-1">
                          Panoramic
                        </div>
                        <div className="text-white/50 text-sm">Views</div>
                      </div>
                      <div className="p-5 bg-gradient-to-br from-[#b1b94c]/10 to-transparent rounded-2xl border border-[#b1b94c]/20 text-center">
                        <div className="text-xl font-[family-name:var(--font-krona)] text-[#b1b94c] mb-1">
                          Live
                        </div>
                        <div className="text-white/50 text-sm">Shows</div>
                      </div>
                      <div className="p-5 bg-gradient-to-br from-[#b1b94c]/10 to-transparent rounded-2xl border border-[#b1b94c]/20 text-center">
                        <div className="text-3xl font-[family-name:var(--font-krona)] text-[#b1b94c] mb-1">
                          5.0
                        </div>
                        <div className="text-white/50 text-sm">Guest Rating</div>
                      </div>
                    </>
                  ) : pkg.id === 'monkey-hilltop' ? (
                    <>
                      <div className="p-5 bg-gradient-to-br from-[#b1b94c]/10 to-transparent rounded-2xl border border-[#b1b94c]/20 text-center">
                        <div className="text-lg font-[family-name:var(--font-krona)] text-[#b1b94c] mb-1">
                          Vibrant
                        </div>
                        <div className="text-white/50 text-sm">Atmosphere</div>
                      </div>
                      <div className="p-5 bg-gradient-to-br from-[#b1b94c]/10 to-transparent rounded-2xl border border-[#b1b94c]/20 text-center">
                        <div className="text-lg font-[family-name:var(--font-krona)] text-[#b1b94c] mb-1">
                          Ultimate
                        </div>
                        <div className="text-white/50 text-sm">Privacy</div>
                      </div>
                      <div className="p-5 bg-gradient-to-br from-[#b1b94c]/10 to-transparent rounded-2xl border border-[#b1b94c]/20 text-center">
                        <div className="text-3xl font-[family-name:var(--font-krona)] text-[#b1b94c] mb-1">
                          5.0
                        </div>
                        <div className="text-white/50 text-sm">Guest Rating</div>
                      </div>
                    </>
                  ) : pkg.id === 'indoor-seat' ? (
                    <>
                      <div className="p-5 bg-gradient-to-br from-[#b1b94c]/10 to-transparent rounded-2xl border border-[#b1b94c]/20 text-center">
                        <div className="text-lg font-[family-name:var(--font-krona)] text-[#b1b94c] mb-1">
                          Indoor
                        </div>
                        <div className="text-white/50 text-sm">Setting</div>
                      </div>
                      <div className="p-5 bg-gradient-to-br from-[#b1b94c]/10 to-transparent rounded-2xl border border-[#b1b94c]/20 text-center">
                        <div className="text-lg font-[family-name:var(--font-krona)] text-[#b1b94c] mb-1">
                          Climate
                        </div>
                        <div className="text-white/50 text-sm">Controlled</div>
                      </div>
                      <div className="p-5 bg-gradient-to-br from-[#b1b94c]/10 to-transparent rounded-2xl border border-[#b1b94c]/20 text-center">
                        <div className="text-3xl font-[family-name:var(--font-krona)] text-[#b1b94c] mb-1">
                          5.0
                        </div>
                        <div className="text-white/50 text-sm">Guest Rating</div>
                      </div>
                    </>
                  ) : pkg.id === 'outdoor-seat' ? (
                    <>
                      <div className="p-5 bg-gradient-to-br from-[#b1b94c]/10 to-transparent rounded-2xl border border-[#b1b94c]/20 text-center">
                        <div className="text-lg font-[family-name:var(--font-krona)] text-[#b1b94c] mb-1">
                          Outdoor
                        </div>
                        <div className="text-white/50 text-sm">Setting</div>
                      </div>
                      <div className="p-5 bg-gradient-to-br from-[#b1b94c]/10 to-transparent rounded-2xl border border-[#b1b94c]/20 text-center">
                        <div className="text-lg font-[family-name:var(--font-krona)] text-[#b1b94c] mb-1">
                          Fresh
                        </div>
                        <div className="text-white/50 text-sm">Air</div>
                      </div>
                      <div className="p-5 bg-gradient-to-br from-[#b1b94c]/10 to-transparent rounded-2xl border border-[#b1b94c]/20 text-center">
                        <div className="text-3xl font-[family-name:var(--font-krona)] text-[#b1b94c] mb-1">
                          5.0
                        </div>
                        <div className="text-white/50 text-sm">Guest Rating</div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="p-5 bg-gradient-to-br from-[#b1b94c]/10 to-transparent rounded-2xl border border-[#b1b94c]/20 text-center">
                        <div className="text-3xl font-[family-name:var(--font-krona)] text-[#b1b94c] mb-1">
                          {pkg.stats?.courses || '5'}
                        </div>
                        <div className="text-white/50 text-sm">{t('experience.courses')}</div>
                      </div>
                      <div className="p-5 bg-gradient-to-br from-[#b1b94c]/10 to-transparent rounded-2xl border border-[#b1b94c]/20 text-center">
                        <div className="text-3xl font-[family-name:var(--font-krona)] text-[#b1b94c] mb-1">
                          100%
                        </div>
                        <div className="text-white/50 text-sm">{t('experience.freshIngredients')}</div>
                      </div>
                      <div className="p-5 bg-gradient-to-br from-[#b1b94c]/10 to-transparent rounded-2xl border border-[#b1b94c]/20 text-center">
                        <div className="text-3xl font-[family-name:var(--font-krona)] text-[#b1b94c] mb-1">
                          {pkg.stats?.guestRating || '4.9'}
                        </div>
                        <div className="text-white/50 text-sm">{t('experience.guestRating')}</div>
                      </div>
                    </>
                  )}
                </div>
              </motion.div>

              {/* Requirements (if any) */}
              {pkg.requirements && pkg.requirements.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="p-6 bg-white/5 rounded-2xl border border-white/10"
                >
                  <h3 className="text-lg font-[family-name:var(--font-krona)] text-white mb-4 normal-case">
                    {t('goodToKnow')}
                  </h3>
                  <ul className="space-y-2">
                    {pkg.requirements.map((req, index) => (
                      <li key={index} className="flex items-start gap-3 text-white/60 text-sm">
                        <span className="text-[#b1b94c] mt-1">•</span>
                        {pkg.id === 'monkey-dome' ? (
                          req === '4,000 THB deposit per table (max 4 guests)' ? t('requirements.deposit4000') :
                          req === 'Redeemable; no refund on unused balance' ? t('requirements.redeemableNoRefund') :
                          req === '2-hour seating (for consecutive bookings)' ? t('requirements.twoHourSeating') :
                          req === '24-hour notice for cancellation/amendment (subject to availability)' ? t('requirements.cancellation24hr') :
                          req
                        ) : pkg.id === 'monkey-nest' ? (
                          req === '5,000 THB deposit per table' ? t('requirements.deposit5000') :
                          req === 'Maximum 6 guests per table' ? t('requirements.max6guests') :
                          req === 'Redeemable; no refund on unused balance' ? t('requirements.redeemableNoRefund') :
                          req === '2-hour seating (for consecutive bookings)' ? t('requirements.twoHourSeating') :
                          req === '24-hour notice for cancellation/amendment (subject to availability)' ? t('requirements.cancellation24hr') :
                          req
                        ) : pkg.id === 'zone-7' ? (
                          req === 'Deposit: 500 THB per person' ? t('requirements.deposit500perPerson') :
                          req === 'Suitable for up to 10 persons' ? t('requirements.suitableUpTo10') :
                          req === 'Redeemable; no refund on unused balance' ? t('requirements.redeemableNoRefund') :
                          req === '24-hour notice for cancellation/amendment (subject to availability)' ? t('requirements.cancellation24hr') :
                          req
                        ) : pkg.id === 'ultimate-dinner' ? (
                          req === 'Table setup will be arranged at Zone Z' ? t('requirements.tableSetupZoneZ') :
                          req === 'Food & drinks are NOT included — can be purchased separately' ? t('requirements.foodDrinksNotIncluded') :
                          req === 'Transfer service is available within Phuket area only (airport pickup is excluded)' ? t('requirements.transferPhuketOnly') :
                          req === 'Sparkling wine can be replaced with 4 mocktails for non-alcoholic preference' ? t('requirements.sparklingWineMocktails') :
                          req === 'Prices are exclusive of 7% VAT and 10% service charge' ? t('requirements.pricesExclusive') :
                          req === 'Reservation is required at least 1 day in advance' ? t('requirements.reservationOneDayAdvance') :
                          req === 'All cancellations are non-refundable' ? t('requirements.nonRefundable') :
                          req
                        ) : pkg.id === 'will-you-marry-me' ? (
                          req === 'Table setup will be arranged at Zone Z' ? t('requirements.tableSetupZoneZ') :
                          req === 'Food & drinks are NOT included — can be purchased separately' ? t('requirements.foodDrinksNotIncluded') :
                          req === 'Prices are exclusive of 7% VAT and 10% service charge' ? t('requirements.pricesExclusive') :
                          req === 'Reservation is required at least 1 day in advance' ? t('requirements.reservationOneDayAdvance') :
                          req === 'All cancellations are non-refundable' ? t('requirements.nonRefundable') :
                          req
                        ) : req}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              )}
            </div>

            {/* Sidebar - Booking Card */}
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="sticky top-32 space-y-6"
              >
                {/* Price Card */}
                <div className="p-6 bg-[#b1b94c] rounded-3xl">
                  <div className="mb-6">
                    <span className="text-black/60 text-sm">{t('startingFrom')}</span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl font-[family-name:var(--font-krona)] text-black">
                        {formatPrice(pkg.price)}
                      </span>
                      <span className="text-black/60">
                        {pkg.priceType === 'per-person' ? t('perPerson') : t('perTable')}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3 mb-6 pb-6 border-b border-black/10">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-black/60">{t('duration')}</span>
                      <span className="text-black font-medium">{pkg.duration}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-black/60">{t('capacity')}</span>
                      <span className="text-black font-medium">
                        {pkg.id === 'monkey-nest' ? '2-6 guests' : pkg.id === 'zone-7' ? 'up to 10 guests' : pkg.id === 'zone-6' ? 'up to 50 guests' : pkg.id === 'rooftop-romantic' ? 'up to 40 guests' : pkg.id === 'indoor-seat' || pkg.id === 'outdoor-seat' ? 'open seating' : '2-4 guests'}
                      </span>
                    </div>
                    {pkg.includesMeal && (
                      <div className="flex items-center gap-2 text-black/80 text-sm">
                        <Check className="w-4 h-4" />
                        <span>{t('mealIncluded')}</span>
                      </div>
                    )}
                    {pkg.includesTransfer && (
                      <div className="flex items-center gap-2 text-black/80 text-sm">
                        <Check className="w-4 h-4" />
                        <span>{t('transferIncluded')}</span>
                      </div>
                    )}
                  </div>

                  <Link href={`/booking?package=${pkg.id}`} className="block">
                    <button className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-black text-[#b1b94c] font-[family-name:var(--font-krona)] text-lg rounded-2xl hover:bg-black/80 transition-all">
                      <Calendar className="w-5 h-5" />
                      {t('reserveNow')}
                    </button>
                  </Link>
                </div>

                {/* Contact Card */}
                <div className="p-6 bg-[#111] rounded-2xl border border-white/10">
                  <h3 className="text-lg font-[family-name:var(--font-krona)] text-white mb-4 normal-case">
                    {t('questions')}
                  </h3>
                  <div className="space-y-4">
                    <a 
                      href="tel:+66980108838" 
                      className="flex items-center gap-3 text-white/60 hover:text-[#b1b94c] transition-colors"
                    >
                      <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center">
                        <Phone className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-white text-sm font-medium">+66 98-010-8838</div>
                        <div className="text-white/40 text-xs">{t('callReservations')}</div>
                      </div>
                    </a>
                    <a
                      href="https://wa.me/66980108838"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 text-white/60 hover:text-[#b1b94c] transition-colors"
                    >
                      <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center">
                        <MessageCircle className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-white text-sm font-medium">WhatsApp</div>
                        <div className="text-white/40 text-xs">{t('messageAnytime')}</div>
                      </div>
                    </a>
                    <a
                      href="mailto:enjoy@threemonkeysphuket.com"
                      className="flex items-center gap-3 text-white/60 hover:text-[#b1b94c] transition-colors"
                    >
                      <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center">
                        <Mail className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-white text-sm font-medium">enjoy@threemonkeysphuket.com</div>
                        <div className="text-white/40 text-xs">{t('emailInquiries')}</div>
                      </div>
                    </a>
                    <a
                      href="https://maps.app.goo.gl/hk5Z7PQUHnmz6tVB6"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 text-white/60 hover:text-[#b1b94c] transition-colors"
                    >
                      <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center">
                        <MapPin className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-white text-sm font-medium">Inside Hanuman World</div>
                        <div className="text-white/40 text-xs">Wichit, Phuket 83000</div>
                      </div>
                    </a>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Other Packages Section */}
      <section className="py-24 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <span className="text-[#b1b94c] text-sm font-medium uppercase tracking-[0.3em] mb-4 block">
              {t('moreOptions')}
            </span>
            <h2 className="text-3xl md:text-4xl font-[family-name:var(--font-krona)] text-white normal-case">
              {t('exploreOther')}
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {otherPackages.map((otherPkg, index) => (
              <motion.div
                key={otherPkg.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Link href={`/packages/${otherPkg.slug}`} className="group block">
                  <div className="relative aspect-[4/3] rounded-2xl overflow-hidden mb-4">
                    <Image
                      src={otherPkg.image}
                      alt={otherPkg.name}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                      unoptimized
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4">
                      <h3 className="text-xl font-[family-name:var(--font-krona)] text-white group-hover:text-[#b1b94c] transition-colors normal-case">
                        {otherPkg.name}
                      </h3>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-[#b1b94c] font-bold">{formatPrice(otherPkg.price)}</span>
                        <span className="text-white/60 text-sm">{otherPkg.duration}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mt-12"
          >
            <Link href="/packages">
              <button className="inline-flex items-center gap-3 px-8 py-4 bg-[#b1b94c] hover:bg-[#c4cc5a] text-black font-[family-name:var(--font-krona)] rounded-full transition-all">
                {t('viewAll')}
                <ArrowRight className="w-5 h-5" />
              </button>
            </Link>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
