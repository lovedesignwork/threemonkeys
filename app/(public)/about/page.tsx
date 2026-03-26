'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
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

const stats = [
  { value: '15+', label: 'Years of Excellence', icon: Award },
  { value: '500K+', label: 'Happy Guests', icon: Users },
  { value: '12', label: 'Culinary Awards', icon: Star },
  { value: '6', label: 'Unique Dining Zones', icon: TreePine },
];

const values = [
  {
    icon: Leaf,
    title: 'Farm to Table',
    description: 'We source the freshest ingredients daily from local farmers and the Andaman Sea.',
  },
  {
    icon: ChefHat,
    title: 'Culinary Mastery',
    description: 'Our chefs bring generations of Thai culinary wisdom to every dish we create.',
  },
  {
    icon: Mountain,
    title: 'Nature Immersion',
    description: 'Dine surrounded by ancient rainforest trees and breathtaking jungle views.',
  },
  {
    icon: Heart,
    title: 'Heartfelt Service',
    description: 'Every guest is family. We create memories that last a lifetime.',
  },
];

const experiences = [
  {
    title: 'Monkey Dome',
    description: 'Our signature treehouse dining with panoramic jungle views',
    image: '/images/Random images/44_resize.jpg',
  },
  {
    title: 'Rooftop Zone',
    description: 'Elevated dining under the stars with sunset views',
    image: '/images/Random images/45_resize.jpg',
  },
  {
    title: 'Bamboo Pavilion',
    description: 'Traditional Thai architecture meets modern comfort',
    image: '/images/Random images/46_resize.jpg',
  },
];

export default function AboutPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });
  
  const y1 = useTransform(scrollYProgress, [0, 1], [0, -100]);

  return (
    <main ref={containerRef} className="min-h-screen bg-[#0a0a0a]">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <motion.div 
          className="absolute inset-0"
          style={{ y: y1 }}
        >
          <Image
            src="/images/Random images/47_resize.jpg"
            alt="Rainforest"
            fill
            className="object-cover scale-110"
            priority
            unoptimized
          />
        </motion.div>
        
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-[#0a0a0a]" />
        
        <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
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
                Phuket&apos;s Only Rainforest Restaurant
              </span>
            </motion.div>
            
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-5xl md:text-7xl lg:text-8xl font-[family-name:var(--font-krona)] text-white mb-8 normal-case leading-[1.1]"
            >
              Dining Among
              <br />
              <span className="text-[#b1b94c]">The Trees</span>
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="text-xl md:text-2xl text-white/60 max-w-2xl mx-auto font-[family-name:var(--font-inter)] leading-relaxed"
            >
              Where authentic Southern Thai cuisine meets the magic of nature
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
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="p-6 bg-[#111] rounded-2xl border border-white/10 text-center group hover:border-[#b1b94c]/30 transition-colors"
              >
                <div className="w-12 h-12 bg-[#b1b94c]/10 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:bg-[#b1b94c]/20 transition-colors">
                  <stat.icon className="w-6 h-6 text-[#b1b94c]" />
                </div>
                <p className="text-3xl font-[family-name:var(--font-krona)] text-white mb-1">
                  {stat.value}
                </p>
                <p className="text-white/50 text-sm font-[family-name:var(--font-inter)]">
                  {stat.label}
                </p>
              </motion.div>
            ))}
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
                  Est. 2010
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
                Our Story
              </span>
              <h2 className="text-4xl md:text-5xl font-[family-name:var(--font-krona)] text-white mb-8 normal-case leading-tight">
                A Culinary Journey
                <br />
                <span className="text-[#b1b94c]">Born in Nature</span>
              </h2>
              
              <div className="space-y-6 text-white/60 text-lg font-[family-name:var(--font-inter)] leading-relaxed">
                <p>
                  Three Monkeys was born from a simple dream: to create a dining experience 
                  that connects people with nature while celebrating the rich flavors of 
                  Southern Thai cuisine.
                </p>
                <p>
                  Nestled within Hanuman World&apos;s ancient rainforest, our restaurant offers 
                  something truly unique—the chance to dine among towering trees, with the 
                  sounds of nature as your soundtrack and the jungle canopy as your ceiling.
                </p>
                <p>
                  Every dish we serve is a tribute to our heritage, crafted with locally-sourced 
                  ingredients and prepared with techniques passed down through generations.
                </p>
              </div>

              <div className="mt-10">
                <Link href="/seats">
                  <button className="inline-flex items-center gap-3 px-8 py-4 bg-[#b1b94c] text-black font-[family-name:var(--font-krona)] rounded-full hover:bg-[#c4cc5a] transition-all">
                    Explore Our Dining Zones
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
              What We Stand For
            </span>
            <h2 className="text-4xl md:text-5xl font-[family-name:var(--font-krona)] text-white normal-case">
              Our Values
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="p-8 bg-[#0a0a0a] rounded-3xl border border-white/10 group hover:border-[#b1b94c]/30 transition-all"
              >
                <div className="w-14 h-14 bg-[#b1b94c]/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-[#b1b94c]/20 transition-colors">
                  <value.icon className="w-7 h-7 text-[#b1b94c]" />
                </div>
                <h3 className="text-xl font-[family-name:var(--font-krona)] text-white mb-3 normal-case">
                  {value.title}
                </h3>
                <p className="text-white/50 font-[family-name:var(--font-inter)] leading-relaxed">
                  {value.description}
                </p>
              </motion.div>
            ))}
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
              Unique Dining Zones
            </span>
            <h2 className="text-4xl md:text-5xl font-[family-name:var(--font-krona)] text-white normal-case mb-4">
              Choose Your Experience
            </h2>
            <p className="text-white/50 text-lg font-[family-name:var(--font-inter)] max-w-2xl mx-auto">
              Each zone offers a different atmosphere, from intimate treehouses to open-air pavilions
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {experiences.map((exp, index) => (
              <motion.div
                key={exp.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group relative rounded-3xl overflow-hidden"
              >
                <div className="relative aspect-[4/5]">
                  <Image
                    src={exp.image}
                    alt={exp.title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                    unoptimized
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                </div>
                
                <div className="absolute bottom-0 left-0 right-0 p-8">
                  <h3 className="text-2xl font-[family-name:var(--font-krona)] text-white mb-2 normal-case">
                    {exp.title}
                  </h3>
                  <p className="text-white/60 font-[family-name:var(--font-inter)]">
                    {exp.description}
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
                View All 6 Dining Zones
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
            src="/images/Random images/48_resize.jpg"
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
              Ready for an
              <br />
              <span className="text-[#b1b94c]">Unforgettable Experience?</span>
            </h2>
            <p className="text-xl text-white/60 mb-12 font-[family-name:var(--font-inter)] max-w-2xl mx-auto">
              Book your table and discover why Three Monkeys is Phuket&apos;s most unique dining destination
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/booking">
                <button className="inline-flex items-center gap-3 px-10 py-5 bg-[#b1b94c] text-black font-[family-name:var(--font-krona)] rounded-full hover:bg-[#c4cc5a] transition-all">
                  Reserve Your Table
                  <ArrowRight className="w-5 h-5" />
                </button>
              </Link>
              <Link href="/special-packages">
                <button className="inline-flex items-center gap-2 px-10 py-5 border-2 border-white/30 text-white font-[family-name:var(--font-krona)] rounded-full hover:bg-white hover:text-black transition-all">
                  Special Packages
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
                Find Us
              </span>
              <h2 className="text-4xl md:text-5xl font-[family-name:var(--font-krona)] text-white mb-8 normal-case">
                Visit Three Monkeys
              </h2>
              
              <div className="space-y-6">
                <div className="flex items-start gap-4 p-5 bg-[#0a0a0a] rounded-2xl">
                  <div className="w-12 h-12 bg-[#b1b94c]/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-6 h-6 text-[#b1b94c]" />
                  </div>
                  <div>
                    <p className="text-white font-medium mb-1">Location</p>
                    <p className="text-white/50 font-[family-name:var(--font-inter)]">
                      Inside Hanuman World<br />
                      105 Moo 4, Muang Chao Fa Rd.<br />
                      Wichit, Mueang Phuket, Phuket 83000
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4 p-5 bg-[#0a0a0a] rounded-2xl">
                  <div className="w-12 h-12 bg-[#b1b94c]/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Phone className="w-6 h-6 text-[#b1b94c]" />
                  </div>
                  <div>
                    <p className="text-white font-medium mb-1">Contact</p>
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
                    <p className="text-white font-medium mb-1">Opening Hours</p>
                    <p className="text-white/50 font-[family-name:var(--font-inter)]">
                      Daily: 10AM – 01AM<br />
                      Last Order: 12AM
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex gap-4">
                <Link href="/contact">
                  <button className="inline-flex items-center gap-2 px-6 py-3 bg-[#b1b94c] text-black font-medium rounded-full hover:bg-[#c4cc5a] transition-all">
                    Contact Us
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </Link>
                <a
                  href="https://maps.google.com/?q=Three+Monkeys+Restaurant+Phuket"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 border border-white/20 text-white font-medium rounded-full hover:bg-white hover:text-black transition-all"
                >
                  Get Directions
                </a>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </main>
  );
}
