'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { Leaf, ChefHat, Utensils, Users } from 'lucide-react';

const qualitySteps = [
  {
    step: '01',
    icon: Leaf,
    title: 'Fresh Ingredients',
    description: 'We source only the freshest local ingredients daily from trusted local farmers and markets. Our seafood arrives fresh each morning.',
  },
  {
    step: '02',
    icon: ChefHat,
    title: 'Expert Chefs',
    description: 'Our chefs have decades of combined experience in authentic Thai cuisine. Each dish is prepared with passion and expertise.',
  },
  {
    step: '03',
    icon: Utensils,
    title: 'Kitchen Hygiene',
    description: 'Our kitchen maintains the highest standards of cleanliness and food safety. Regular inspections ensure we exceed health regulations.',
  },
  {
    step: '04',
    icon: Users,
    title: 'Attentive Service',
    description: 'Our staff is trained to provide exceptional service. From dietary accommodations to special occasions, we ensure every detail is perfect.',
  },
];

export function SafetyCertifications() {
  return (
    <section className="relative py-24 overflow-hidden">
      {/* Leaves Background with Green Overlay */}
      <div className="absolute inset-0">
        <Image
          src="/images/Random images/44_resize.jpg"
          alt=""
          fill
          className="object-cover"
          unoptimized
        />
        <div className="absolute inset-0 bg-[#b1b94c]/90" />
      </div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left - Content */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-black text-[#b1b94c] rounded-full text-sm font-medium mb-6"
            >
              <Leaf className="w-4 h-4" />
              Quality & Excellence
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-5xl font-[family-name:var(--font-krona)] text-black mb-6"
            >
              World-Class
              <br />
              Quality Standards
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-black/70 text-lg mb-10"
            >
              At Three Monkeys, we believe dining should be an exceptional experience. 
              Our commitment to quality, freshness, and hygiene ensures you can 
              focus on enjoying your meal while we handle everything else.
            </motion.p>

            {/* Safety Steps */}
            <div className="space-y-6">
              {qualitySteps.map((item, index) => (
                <motion.div
                  key={item.step}
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  className="flex gap-5 group"
                >
                  {/* Step Number */}
                  <div className="flex-shrink-0">
                    <div className="w-14 h-14 rounded-2xl bg-black flex items-center justify-center group-hover:bg-[#1a1a1a] transition-colors">
                      <span className="text-[#b1b94c] font-[family-name:var(--font-krona)] text-lg">
                        {item.step}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div>
                    <h3 className="text-black font-semibold text-lg mb-1">
                      {item.title}
                    </h3>
                    <p className="text-black/60 text-sm leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Right - Visual */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative hidden lg:block"
          >
            {/* Main Image */}
            <div className="relative h-[600px] rounded-3xl overflow-hidden shadow-2xl">
              <Image
                src="/images/Random images/45_resize.jpg"
                alt="Restaurant Kitchen"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
            </div>

            {/* Floating Cards */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 }}
              className="absolute -bottom-6 -left-6 p-6 bg-black rounded-2xl shadow-2xl max-w-xs"
            >
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-[#b1b94c] rounded-xl flex items-center justify-center">
                  <Leaf className="w-8 h-8 text-black" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-[#b1b94c]">Fresh</div>
                  <div className="text-white/60 text-sm">Daily Ingredients</div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: -30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.6 }}
              className="absolute -top-6 -right-6 p-4 bg-black rounded-2xl shadow-2xl"
            >
              <div className="flex items-center gap-3">
                <ChefHat className="w-8 h-8 text-[#b1b94c]" />
                <div className="text-white">
                  <div className="font-bold text-sm">Expert</div>
                  <div className="text-xs text-white/60">Thai Chefs</div>
                </div>
              </div>
            </motion.div>

          </motion.div>
        </div>

      </div>
    </section>
  );
}
