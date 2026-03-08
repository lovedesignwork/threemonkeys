'use client';

import { motion } from 'framer-motion';
import { Section, Container } from '@/components/ui';

const partners = [
  { name: 'TripAdvisor', text: 'TripAdvisor' },
  { name: 'Viator', text: 'Viator' },
  { name: 'GetYourGuide', text: 'GetYourGuide' },
  { name: 'Klook', text: 'Klook' },
  { name: 'Agoda', text: 'Agoda' },
  { name: 'Booking.com', text: 'Booking.com' },
];

const mediaFeatures = [
  'CNN Travel',
  'Lonely Planet',
  'Bangkok Post',
  'The Nation',
  'TAT',
  'Phuket News',
];

export function Partners() {
  return (
    <Section className="relative overflow-hidden py-12" style={{ backgroundColor: '#080b2e' }}>
      <Container>
        {/* Partners */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <p className="text-white/50 uppercase tracking-widest text-sm mb-6">Book With Our Partners</p>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12">
            {partners.map((partner, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-white/30 hover:text-white/60 transition-colors duration-300 text-xl md:text-2xl font-bold font-[family-name:var(--font-oswald)] cursor-pointer"
              >
                {partner.text}
              </motion.div>
            ))}
          </div>
        </motion.div>

        <div className="border-t border-white/10 my-8" />

        {/* Media Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <p className="text-white/50 uppercase tracking-widest text-sm mb-6">As Featured In</p>
          <div className="flex flex-wrap justify-center items-center gap-6 md:gap-10">
            {mediaFeatures.map((media, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-white/25 hover:text-white/50 transition-colors duration-300 text-lg md:text-xl font-semibold cursor-pointer"
              >
                {media}
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Awards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="mt-10 flex flex-wrap justify-center items-center gap-8"
        >
          <div className="flex items-center gap-3 px-5 py-3 rounded-full bg-white/5 border border-white/10">
            <div className="w-8 h-8 rounded-full bg-yellow-500/20 flex items-center justify-center">
              <span className="text-yellow-400 text-lg">🏆</span>
            </div>
            <span className="text-white/70 text-sm">TripAdvisor Travellers&apos; Choice 2024</span>
          </div>
          <div className="flex items-center gap-3 px-5 py-3 rounded-full bg-white/5 border border-white/10">
            <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
              <span className="text-green-400 text-lg">✓</span>
            </div>
            <span className="text-white/70 text-sm">TAT Certified</span>
          </div>
          <div className="flex items-center gap-3 px-5 py-3 rounded-full bg-white/5 border border-white/10">
            <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
              <span className="text-blue-400 text-lg">★</span>
            </div>
            <span className="text-white/70 text-sm">Best Thai Restaurant 2023</span>
          </div>
        </motion.div>
      </Container>
    </Section>
  );
}
