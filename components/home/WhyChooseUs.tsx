'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { Leaf, TreePine, Heart, Sparkles, ArrowRight } from 'lucide-react';

const features = [
  {
    icon: TreePine,
    title: 'Rainforest Setting',
    description: 'Dine surrounded by lush tropical rainforest',
  },
  {
    icon: Sparkles,
    title: 'Unique Ambiance',
    description: 'Traditional Thai meets modern design',
  },
  {
    icon: Heart,
    title: 'Romantic Dining',
    description: 'Perfect for special celebrations',
  },
  {
    icon: Leaf,
    title: 'Fresh & Local',
    description: 'Daily sourced from local markets',
  },
];

export function WhyChooseUs() {
  return (
    <section className="relative py-32 overflow-hidden">
      {/* Leaves Background with Dark Overlay */}
      <div className="absolute inset-0">
        <Image
          src="https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=1920"
          alt=""
          fill
          className="object-cover"
          unoptimized
        />
        <div className="absolute inset-0 bg-black/85" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/50" />
      </div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Section - Bento Grid */}
        <div className="grid lg:grid-cols-3 gap-6 mb-6">
          
          {/* Main Feature Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-2 relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#b1b94c]/20 to-[#b1b94c]/5 border border-[#b1b94c]/20 p-10 lg:p-14"
          >
            <div className="relative z-10 max-w-xl">
              <span className="text-[#b1b94c] text-sm font-medium uppercase tracking-[0.3em]">
                Why Choose Us
              </span>
              <h2 className="mt-4 text-4xl md:text-5xl font-[family-name:var(--font-krona)] text-white leading-tight normal-case">
                An Experience
                <br />
                <span className="text-[#b1b94c]">Unlike Any Other</span>
              </h2>
              <p className="mt-6 text-white/60 text-lg leading-relaxed">
                At Three Monkeys, every meal becomes a cherished memory. Our sophisticated 
                setting seamlessly blends traditional Thai decor with modern design.
              </p>
              <Link
                href="/about"
                className="mt-8 inline-flex items-center gap-3 text-[#b1b94c] hover:text-white transition-colors group"
              >
                <span className="font-medium">Discover Our Story</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
            
            {/* Decorative Element */}
            <div className="absolute -right-20 -bottom-20 w-80 h-80 rounded-full bg-[#b1b94c]/10 blur-3xl" />
          </motion.div>

          {/* Stats Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="relative overflow-hidden rounded-3xl bg-[#b1b94c] p-8 flex flex-col justify-between"
          >
            <div>
              <div className="text-7xl md:text-8xl font-[family-name:var(--font-krona)] text-black leading-none">
                15+
              </div>
              <div className="mt-2 text-black/70 text-lg font-medium">
                Years of Culinary Excellence
              </div>
            </div>
            <div className="mt-8 pt-8 border-t border-black/10">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-3xl font-[family-name:var(--font-krona)] text-black">50K+</div>
                  <div className="text-black/60 text-sm">Happy Guests</div>
                </div>
                <div>
                  <div className="text-3xl font-[family-name:var(--font-krona)] text-black">4.9</div>
                  <div className="text-black/60 text-sm">Rating</div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Bottom Section - Features + Image */}
        <div className="grid lg:grid-cols-3 gap-6">
          
          {/* Features Grid */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-1 grid grid-cols-2 gap-4"
          >
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 + index * 0.1 }}
                className="group p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-[#b1b94c]/40 hover:bg-white/10 transition-all cursor-pointer"
              >
                <div className="w-10 h-10 rounded-xl bg-[#b1b94c]/20 flex items-center justify-center mb-4 group-hover:bg-[#b1b94c]/30 transition-colors">
                  <feature.icon className="w-5 h-5 text-[#b1b94c]" />
                </div>
                <h3 className="text-white font-semibold text-sm mb-1">{feature.title}</h3>
                <p className="text-white/40 text-xs leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>

          {/* Large Image */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-2 relative overflow-hidden rounded-3xl aspect-[16/9] lg:aspect-auto lg:h-full min-h-[300px]"
          >
            <Image
              src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200"
              alt="Three Monkeys Restaurant Interior"
              fill
              className="object-cover"
              unoptimized
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            
            {/* Floating Label */}
            <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between">
              <div>
                <div className="text-white/60 text-sm mb-1">Featured in</div>
                <div className="text-white font-semibold">Phuket&apos;s Top 10 Restaurants</div>
              </div>
              <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-white text-sm">
                <span className="w-2 h-2 rounded-full bg-[#b1b94c] animate-pulse" />
                Open Now
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
