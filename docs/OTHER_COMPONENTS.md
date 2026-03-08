# Other Components Reference

---

## Header.tsx

```tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';

const navigation = [
  { name: 'COMBINED ZIPLINE', href: '/packages/combined' },
  { name: 'ZIPLINE', href: '/packages/zipline' },
  { name: 'ROLLER', href: '/packages/roller' },
  { name: 'SKYWALK', href: '/packages/skywalk' },
  { name: 'SLINGSHOT', href: '/packages/slingshot' },
  { name: 'BLOG', href: '/blog' },
  { name: 'FAQ', href: '/faq' },
  { name: 'CONTACT', href: '/contact' },
];

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-primary-dark/95 backdrop-blur-md shadow-lg' : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <Image 
              src="/images/HW Logo.png" 
              alt="Hanuman World" 
              width={150} 
              height={50} 
              className="h-12 w-auto"
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="font-[family-name:var(--font-oswald)] font-normal tracking-wide text-[22px] text-white/90 hover:text-accent transition-colors uppercase"
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden text-white p-2"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-primary-dark/95 backdrop-blur-md"
          >
            <nav className="px-4 py-4 space-y-2">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block font-[family-name:var(--font-oswald)] font-normal tracking-wide text-[18px] text-white/90 hover:text-accent py-2 uppercase"
                >
                  {item.name}
                </Link>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
```

---

## HeroSlideshow.tsx

```tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui';

const slides = [
  {
    id: 1,
    image: '/images/Hero%20Image/Combined%20Zipline.jpg',
    title: 'Thailand\'s Biggest',
    subtitle: 'ZIPLINE ADVENTURE',
    description: 'Experience the ultimate jungle adventure with over 30 platforms and 16 ziplines through the ancient rainforest.',
  },
  {
    id: 2,
    image: '/images/Hero%20Image/Zipline%2032%20Platform.jpg',
    title: '32 Platform Experience',
    subtitle: 'ULTIMATE ZIPLINE',
    description: 'Our most comprehensive adventure featuring all 32 platforms, sky bridges, and the famous dual zipline.',
  },
  {
    id: 3,
    image: '/images/Hero%20Image/Roller%20Zipline.jpg',
    title: 'First in Thailand',
    subtitle: 'UNIQUE ROLLER ZIPLINE',
    description: 'Experience the thrilling roller coaster zipline - a unique combination of speed and excitement through the treetops.',
  },
  {
    id: 4,
    image: '/images/Hero%20Image/Skywalk.jpg',
    title: 'Walk Among the Clouds',
    subtitle: 'BREATHTAKING SKYWALK',
    description: 'Elevated walkways offer stunning panoramic views of the Phuket jungle. Perfect for nature lovers and photographers.',
  },
  {
    id: 5,
    image: '/images/Hero%20Image/Slingshot2.jpg',
    title: 'Maximum Adrenaline',
    subtitle: 'EXTREME SLINGSHOT',
    description: 'Feel the ultimate rush as you are launched into the jungle canopy. For true thrill-seekers only!',
  },
];

export function HeroSlideshow() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  }, []);

  useEffect(() => {
    if (!isAutoPlaying) return;
    const interval = setInterval(nextSlide, 6000);
    return () => clearInterval(interval);
  }, [isAutoPlaying, nextSlide]);

  return (
    <section className="relative h-screen min-h-[700px] overflow-hidden">
      {/* Slides */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.7 }}
          className="absolute inset-0"
        >
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${slides[currentSlide].image})` }}
          />
          {/* Overlay */}
          <div className="absolute inset-0 hero-overlay" />
        </motion.div>
      </AnimatePresence>

      {/* Top gradient for menu visibility */}
      <div className="absolute top-0 left-0 right-0 h-28 bg-gradient-to-b from-primary-dark via-primary-dark/60 to-transparent z-10 pointer-events-none" />

      {/* Bottom gradient for slider panel visibility */}
      <div className="absolute bottom-0 left-0 right-0 h-28 bg-gradient-to-t from-primary-dark via-primary-dark/60 to-transparent z-10 pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 h-full flex items-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.5 }}
            className="max-w-2xl"
            style={{
              textShadow: '0 2px 10px rgba(0,0,0,0.8), 0 4px 20px rgba(0,0,0,0.6), 0 0 40px rgba(0,0,0,0.4)'
            }}
          >
            <p className="text-accent font-semibold text-lg mb-2">
              {slides[currentSlide].title}
            </p>
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 font-[family-name:var(--font-oswald)] tracking-wide">
              {slides[currentSlide].subtitle}
            </h1>
            <p className="text-xl text-white/90 mb-8 leading-relaxed">
              {slides[currentSlide].description}
            </p>
            <div className="flex gap-4">
              <Link href="/booking">
                <Button size="lg">Book Your Adventure</Button>
              </Link>
              <Link href="/packages">
                <Button variant="secondary" size="lg">Explore Packages</Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={() => { prevSlide(); setIsAutoPlaying(false); }}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-3 bg-white/10 hover:bg-white/20 rounded-full backdrop-blur-sm transition-all"
      >
        <ChevronLeft className="w-6 h-6 text-white" />
      </button>
      <button
        onClick={() => { nextSlide(); setIsAutoPlaying(false); }}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-3 bg-white/10 hover:bg-white/20 rounded-full backdrop-blur-sm transition-all"
      >
        <ChevronRight className="w-6 h-6 text-white" />
      </button>

      {/* Slide Indicators */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-3">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => { setCurrentSlide(index); setIsAutoPlaying(false); }}
            className={`w-3 h-3 rounded-full transition-all ${
              index === currentSlide ? 'bg-accent w-8' : 'bg-white/50 hover:bg-white/70'
            }`}
          />
        ))}
      </div>

      {/* Slide Counter */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="absolute bottom-8 right-8 z-20 hidden lg:block"
      >
        <div className="text-white/60 text-sm">
          {String(currentSlide + 1).padStart(2, '0')}/{String(slides.length).padStart(2, '0')}
        </div>
      </motion.div>
    </section>
  );
}
```

---

## WhyChooseUs.tsx

```tsx
'use client';

import { motion } from 'framer-motion';
import { Shield, Award, Users, Leaf, Clock, Heart } from 'lucide-react';
import { Container, Section, SectionHeader, Card } from '@/components/ui';
import { staggerContainer, staggerItem } from '@/lib/animations';

const features = [
  {
    icon: Shield,
    title: '100% SAFETY',
    description: 'European CE-certified equipment and professionally trained guides ensure your complete safety throughout the adventure.',
  },
  {
    icon: Award,
    title: '#1 RATED PARK',
    description: 'Consistently rated as one of the top attractions in Phuket with thousands of 5-star reviews on TripAdvisor.',
  },
  {
    icon: Users,
    title: 'FAMILY FRIENDLY',
    description: 'Perfect for all ages from 4 to 80 years old. Our experienced guides make everyone feel comfortable and safe.',
  },
  {
    icon: Leaf,
    title: 'ECO-FRIENDLY',
    description: 'We operate with minimal environmental impact, preserving the ancient rainforest for future generations.',
  },
  {
    icon: Clock,
    title: 'FREE TRANSFERS',
    description: 'Complimentary round-trip hotel transfers included with all packages. Sit back and enjoy the ride!',
  },
  {
    icon: Heart,
    title: 'UNFORGETTABLE',
    description: 'Create memories that last a lifetime. Our unique jungle adventure is unlike anything else in Thailand.',
  },
];

export function WhyChooseUs() {
  return (
    <Section className="relative overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-100"
        style={{ backgroundImage: 'url(/images/BG_resize.jpg)' }}
      />
      
      {/* Black Overlay */}
      <div className="absolute inset-0 bg-black/15" />
      
      <Container className="relative z-10">
        <SectionHeader
          title="Why Choose Hanuman World?"
          subtitle="Discover what makes us Thailand's premier adventure destination"
        />

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {features.map((feature) => (
            <motion.div key={feature.title} variants={staggerItem}>
              <Card
                hover
                className="h-full text-center group transition-all duration-300 hover:border-accent/30"
              >
                {/* Dark blue overlay on card */}
                <div className="absolute inset-0 bg-primary-dark/30 rounded-2xl" />
                
                <div className="relative z-10">
                  <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-accent/10 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                    <feature.icon className="w-8 h-8 text-accent" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3 font-[family-name:var(--font-oswald)]">
                    {feature.title}
                  </h3>
                  <p className="text-foreground-muted leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </Container>
    </Section>
  );
}
```

---

## PhotoGallery.tsx

```tsx
'use client';

import { motion } from 'framer-motion';
import { Section } from '@/components/ui';

const galleryImages = [
  // Row 1 (12 images)
  [
    '/images/Gallery/Hanuman%20World%20Phuket%201%20Zipline.JPG',
    '/images/Gallery/Hanuman%20World%20Phuket%202%20Zipline.jpg',
    '/images/Gallery/Hanuman%20World%20Phuket%203%20Zipline.jpg',
    '/images/Gallery/Hanuman%20World%20Phuket%204%20Zipline.JPG',
    '/images/Gallery/Hanuman%20World%20Phuket%205%20Zipline.JPG',
    '/images/Gallery/Hanuman%20World%20Phuket%206%20Zipline.JPG',
    '/images/Gallery/Hanuman%20World%20Phuket%207%20Zipline.JPG',
    '/images/Gallery/Hanuman%20World%20Phuket%208%20Zipline.JPG',
    '/images/Gallery/Hanuman%20World%20Phuket%209%20Zipline.JPG',
    '/images/Gallery/Hanuman%20World%20Phuket%2010%20Zipline.JPG',
    '/images/Gallery/Hanuman%20World%20Phuket%2011%20Zipline.JPG',
    '/images/Gallery/Hanuman%20World%20Phuket%2012%20Zipline.JPG',
  ],
  // Row 2 (12 images)
  [
    '/images/Gallery/Hanuman%20World%20Phuket%2013%20Zipline.JPG',
    '/images/Gallery/Hanuman%20World%20Phuket%2014%20Zipline.JPG',
    '/images/Gallery/Hanuman%20World%20Phuket%2015%20Zipline.JPG',
    '/images/Gallery/Hanuman%20World%20Phuket%2016%20Zipline.JPG',
    '/images/Gallery/Hanuman%20World%20Phuket%2017%20Zipline.JPG',
    '/images/Gallery/Hanuman%20World%20Phuket%2018%20Zipline.JPG',
    '/images/Gallery/Hanuman%20World%20Phuket%2019%20Zipline.JPG',
    '/images/Gallery/Hanuman%20World%20Phuket%2020%20Zipline.jpg',
    '/images/Gallery/Hanuman%20World%20Phuket%2021%20Zipline.jpg',
    '/images/Gallery/Hanuman%20World%20Phuket%2022%20Zipline.JPG',
    '/images/Gallery/Hanuman%20World%20Phuket%2023%20Zipline.jpg',
    '/images/Gallery/Hanuman%20World%20Phuket%2024%20Zipline.JPG',
  ],
  // Row 3 (12 images)
  [
    '/images/Gallery/Hanuman%20World%20Phuket%2025%20Zipline.JPG',
    '/images/Gallery/Hanuman%20World%20Phuket%2026%20Zipline.JPG',
    '/images/Gallery/Hanuman%20World%20Phuket%2027%20Zipline.JPG',
    '/images/Gallery/Hanuman%20World%20Phuket%2028%20Zipline.JPG',
    '/images/Gallery/Hanuman%20World%20Phuket%2029%20Zipline.JPG',
    '/images/Gallery/Hanuman%20World%20Phuket%2030%20Zipline.JPG',
    '/images/Gallery/Hanuman%20World%20Phuket%2031%20Zipline.jpg',
    '/images/Gallery/Hanuman%20World%20Phuket%2032%20Zipline.jpg',
    '/images/Gallery/Hanuman%20World%20Phuket%2033%20Zipline.jpeg',
    '/images/Gallery/Hanuman%20World%20Phuket%2034%20Zipline.jpg',
    '/images/Gallery/Hanuman%20World%20Phuket%201%20Zipline.JPG',
    '/images/Gallery/Hanuman%20World%20Phuket%202%20Zipline.jpg',
  ],
];

export function PhotoGallery() {
  return (
    <Section className="!py-0 !pt-[30px] overflow-hidden">
      <div className="space-y-4">
        {galleryImages.map((row, rowIndex) => (
          <div key={rowIndex} className="relative overflow-hidden">
            <motion.div
              className="flex gap-4"
              animate={{
                x: rowIndex % 2 === 0 ? ['0%', '-50%'] : ['-50%', '0%'],
              }}
              transition={{
                x: {
                  repeat: Infinity,
                  repeatType: 'loop',
                  duration: rowIndex === 0 ? 42 : rowIndex === 1 ? 137 : 47,
                  ease: 'linear',
                },
              }}
              style={{
                width: 'fit-content',
              }}
            >
              {/* Duplicate images for seamless loop */}
              {[...row, ...row].map((image, imageIndex) => (
                <div
                  key={imageIndex}
                  className="relative flex-shrink-0 w-[25vw] h-[280px] overflow-hidden rounded-2xl"
                >
                  <div
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-500 hover:scale-110 rounded-2xl"
                    style={{ backgroundImage: `url(${image})` }}
                  />
                  <div className="absolute inset-0 bg-primary-dark/20 hover:bg-transparent transition-colors duration-300 rounded-2xl" />
                </div>
              ))}
            </motion.div>
          </div>
        ))}
      </div>
    </Section>
  );
}
```

---

## Homepage (app/(public)/page.tsx)

```tsx
import { HeroSlideshow, FeaturedPackages, WhyChooseUs, PhotoGallery } from '@/components/home';

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <HeroSlideshow />
      <FeaturedPackages />
      <WhyChooseUs />
      <PhotoGallery />
    </main>
  );
}
```
