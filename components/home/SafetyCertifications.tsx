'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { Leaf, CheckCircle, Award, ChefHat, Utensils, Users, Shield } from 'lucide-react';

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
          src="https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=1920"
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
                src="https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800&q=80"
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
                  <CheckCircle className="w-8 h-8 text-black" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-[#b1b94c]">100%</div>
                  <div className="text-white/60 text-sm">Guest Satisfaction</div>
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
                <Award className="w-8 h-8 text-[#b1b94c]" />
                <div className="text-white">
                  <div className="font-bold text-sm">5-Star</div>
                  <div className="text-xs text-white/60">Hygiene Rating</div>
                </div>
              </div>
            </motion.div>

            {/* Petzl Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.7 }}
              className="absolute top-1/2 -right-4 transform -translate-y-1/2"
            >
              <div className="w-24 h-24 bg-black rounded-full flex items-center justify-center shadow-xl">
                <Award className="w-10 h-10 text-[#b1b94c]" />
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Insurance Banner */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-20 p-8 bg-black rounded-3xl shadow-2xl"
        >
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-[#b1b94c] rounded-2xl flex items-center justify-center">
                <Shield className="w-8 h-8 text-black" />
              </div>
              <div>
                <h3 className="text-[#b1b94c] font-semibold text-xl">Satisfaction Guaranteed</h3>
                <p className="text-white/60">We ensure every dining experience exceeds expectations</p>
              </div>
            </div>
            <div className="flex items-center gap-6 text-white/60">
              <div className="text-center">
                <div className="text-2xl font-bold text-[#b1b94c]">4.9</div>
                <div className="text-xs">Rating</div>
              </div>
              <div className="w-px h-12 bg-white/20" />
              <div className="text-center">
                <div className="text-2xl font-bold text-[#b1b94c]">24/7</div>
                <div className="text-xs">Support</div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
