'use client';

import { motion } from 'framer-motion';
import { MapPin, Phone, Mail, Clock, Navigation, ArrowUpRight } from 'lucide-react';

const contactDetails = [
  {
    icon: MapPin,
    label: 'Location',
    value: 'Inside Hanuman World',
    detail: 'Kathu, Phuket 83120',
    href: 'https://maps.app.goo.gl/threemonkeys',
  },
  {
    icon: Phone,
    label: 'Reservations',
    value: '+66 76 323 264',
    detail: 'Call for bookings',
    href: 'tel:+6676323264',
  },
  {
    icon: Mail,
    label: 'Email',
    value: 'hello@threemonkeys.com',
    detail: 'We reply within 24h',
    href: 'mailto:hello@threemonkeys.com',
  },
  {
    icon: Clock,
    label: 'Open Hours',
    value: '11:00 AM - 10:00 PM',
    detail: 'Open daily',
  },
];

const travelTimes = [
  { location: 'Patong Beach', time: '25', unit: 'min' },
  { location: 'Phuket Town', time: '20', unit: 'min' },
  { location: 'Kata Beach', time: '35', unit: 'min' },
  { location: 'Phuket Airport', time: '45', unit: 'min' },
];

export function Location() {
  return (
    <section className="relative py-24 lg:py-32 bg-[#0f0f0f] overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Section - Header & Map Preview */}
        <div className="grid lg:grid-cols-2 gap-16 items-center mb-24">
          {/* Left - Header Content */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-[2px] bg-[#b1b94c]" />
              <span className="text-[#b1b94c] text-sm font-medium uppercase tracking-[0.3em]">
                Find Us
              </span>
            </div>
            
            <h2 className="text-5xl md:text-6xl lg:text-7xl font-[family-name:var(--font-krona)] text-white leading-[1.1] mb-8 normal-case">
              Dine in the
              <br />
              <span className="text-[#b1b94c]">Rainforest</span>
            </h2>
            
            <p className="text-white/60 text-lg leading-relaxed mb-10 max-w-md font-[family-name:var(--font-inter)]">
              Nestled within Hanuman World, our restaurant offers a unique dining 
              experience surrounded by Phuket&apos;s ancient rainforest canopy.
            </p>

            {/* Quick Stats */}
            <div className="flex gap-8">
              <div>
                <div className="text-4xl font-[family-name:var(--font-krona)] text-[#b1b94c]">100+</div>
                <div className="text-white/40 text-sm mt-1">Year Old Trees</div>
              </div>
              <div>
                <div className="text-4xl font-[family-name:var(--font-krona)] text-[#b1b94c]">80m</div>
                <div className="text-white/40 text-sm mt-1">Above Sea Level</div>
              </div>
              <div>
                <div className="text-4xl font-[family-name:var(--font-krona)] text-[#b1b94c]">25°</div>
                <div className="text-white/40 text-sm mt-1">Avg Temperature</div>
              </div>
            </div>
          </motion.div>

          {/* Right - Map Card */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <div className="relative aspect-[4/3] rounded-3xl overflow-hidden border border-white/10 shadow-2xl bg-[#1a1a1a]">
              {/* OpenStreetMap Embed */}
              <iframe
                src="https://www.openstreetmap.org/export/embed.html?bbox=98.30%2C7.90%2C98.35%2C7.95&layer=mapnik&marker=7.9267%2C98.3256"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                loading="lazy"
                className="grayscale-[30%] hover:grayscale-0 transition-all duration-700"
              />
              
              {/* Map Overlay */}
              <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/40 via-transparent to-transparent" />
            </div>

            {/* Floating Get Directions Card */}
            <motion.a
              href="https://maps.app.goo.gl/threemonkeys"
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.02 }}
              className="absolute -bottom-6 -left-6 flex items-center gap-4 p-5 bg-[#b1b94c] rounded-2xl shadow-xl hover:bg-[#c4cc5a] transition-colors group"
            >
              <div className="w-14 h-14 bg-black/10 rounded-xl flex items-center justify-center">
                <Navigation className="w-7 h-7 text-black" />
              </div>
              <div>
                <div className="text-black font-[family-name:var(--font-krona)] text-lg">Get Directions</div>
                <div className="text-black/60 text-sm">Open in Google Maps</div>
              </div>
              <ArrowUpRight className="w-5 h-5 text-black/60 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </motion.a>
          </motion.div>
        </div>

        {/* Bottom Section - Contact Grid & Travel Times */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Contact Cards - 2 columns */}
          <div className="lg:col-span-2 grid sm:grid-cols-2 gap-4">
            {contactDetails.map((item, index) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                {item.href ? (
                  <a
                    href={item.href}
                    target={item.href.startsWith('http') ? '_blank' : undefined}
                    rel={item.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                    className="block h-full p-6 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 hover:border-[#b1b94c]/40 hover:bg-white/10 transition-all group"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-12 h-12 bg-[#b1b94c]/10 rounded-xl flex items-center justify-center group-hover:bg-[#b1b94c]/20 transition-colors">
                        <item.icon className="w-5 h-5 text-[#b1b94c]" />
                      </div>
                      <ArrowUpRight className="w-4 h-4 text-white/30 group-hover:text-[#b1b94c] group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
                    </div>
                    <div className="text-white/40 text-xs uppercase tracking-wider mb-2">{item.label}</div>
                    <div className="text-white font-medium text-lg group-hover:text-[#b1b94c] transition-colors">{item.value}</div>
                    <div className="text-white/40 text-sm mt-1">{item.detail}</div>
                  </a>
                ) : (
                  <div className="h-full p-6 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10">
                    <div className="w-12 h-12 bg-[#b1b94c]/10 rounded-xl flex items-center justify-center mb-4">
                      <item.icon className="w-5 h-5 text-[#b1b94c]" />
                    </div>
                    <div className="text-white/40 text-xs uppercase tracking-wider mb-2">{item.label}</div>
                    <div className="text-white font-medium text-lg">{item.value}</div>
                    <div className="text-white/40 text-sm mt-1">{item.detail}</div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>

          {/* Travel Times Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="p-6 bg-gradient-to-br from-[#b1b94c]/20 to-[#b1b94c]/5 backdrop-blur-sm rounded-2xl border border-[#b1b94c]/20"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-[#b1b94c] rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <div className="text-white font-[family-name:var(--font-krona)] text-lg normal-case">Travel Times</div>
                <div className="text-white/40 text-xs">By car</div>
              </div>
            </div>

            <div className="space-y-4">
              {travelTimes.map((item, index) => (
                <div key={item.location} className="flex items-center justify-between">
                  <span className="text-white/60 font-[family-name:var(--font-inter)]">{item.location}</span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-[#b1b94c] text-2xl font-[family-name:var(--font-krona)]">{item.time}</span>
                    <span className="text-[#b1b94c]/60 text-sm">{item.unit}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Divider */}
            <div className="my-6 h-px bg-white/10" />

            {/* Free Parking Note */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-[#b1b94c]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className="text-white/60 text-sm font-[family-name:var(--font-inter)]">Free parking available</span>
            </div>
          </motion.div>
        </div>

        {/* Bottom Tagline */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6 }}
          className="mt-20 text-center"
        >
          <p className="text-white/30 text-sm tracking-widest uppercase font-[family-name:var(--font-inter)]">
            Where nature meets gastronomy
          </p>
        </motion.div>
      </div>
    </section>
  );
}
