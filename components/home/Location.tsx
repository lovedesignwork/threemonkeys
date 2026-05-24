'use client';

import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { MapPin, Phone, Mail, Clock, Navigation, ArrowUpRight } from 'lucide-react';

// Travel times are place names — left untranslated by design (they're
// proper nouns on every map the visitor will use).
const travelTimes = [
  { location: 'Patong Beach', time: '25', unit: 'min' },
  { location: 'Phuket Town', time: '20', unit: 'min' },
  { location: 'Kata Beach', time: '35', unit: 'min' },
  { location: 'Phuket Airport', time: '45', unit: 'min' },
];

export function Location() {
  const t = useTranslations('home.location');
  const tActions = useTranslations('actions');

  // Built inside the component so labels/values pull from the active locale.
  // Phone, email and physical address themselves stay as-is — they're
  // identifiers, not translatable copy.
  const contactDetails = [
    {
      icon: MapPin,
      label: t('label_location'),
      value: t('value_location'),
      detail: 'Wichit, Phuket 83000',
      href: 'https://maps.app.goo.gl/hk5Z7PQUHnmz6tVB6',
    },
    {
      icon: Phone,
      label: t('label_reservations'),
      value: '+66 98-010-8838',
      detail: t('detail_reservations'),
      href: 'tel:+66980108838',
    },
    {
      icon: Mail,
      label: t('label_email'),
      value: 'enjoy@threemonkeysphuket.com',
      detail: t('detail_email'),
      href: 'mailto:enjoy@threemonkeysphuket.com',
    },
    {
      icon: Clock,
      label: t('label_hours'),
      value: t('value_hours'),
      detail: t('detail_hours'),
    },
  ];

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
                {t('eyebrow')}
              </span>
            </div>

            <h2 className="text-5xl md:text-6xl lg:text-7xl font-[family-name:var(--font-krona)] text-white leading-[1.1] mb-8 normal-case">
              {t('title_a')}
              <br />
              <span className="text-[#b1b94c]">{t('title_b')}</span>
            </h2>

            <p className="text-white/60 text-lg leading-relaxed mb-10 max-w-md font-[family-name:var(--font-inter)]">
              {t('description')}
            </p>

            {/* Quick Stats */}
            <div className="flex gap-8">
              <div>
                <div className="text-4xl font-[family-name:var(--font-krona)] text-[#b1b94c]">100+</div>
                <div className="text-white/40 text-sm mt-1">{t('stat_trees')}</div>
              </div>
              <div>
                <div className="text-4xl font-[family-name:var(--font-krona)] text-[#b1b94c]">80m</div>
                <div className="text-white/40 text-sm mt-1">{t('stat_sea')}</div>
              </div>
              <div>
                <div className="text-4xl font-[family-name:var(--font-krona)] text-[#b1b94c]">25°</div>
                <div className="text-white/40 text-sm mt-1">{t('stat_temp')}</div>
              </div>
            </div>
          </motion.div>

          {/* Right - Directions block.
              Mobile/tablet: a static photo card + "Get Directions" button
              that opens the user's native map app. We deliberately do NOT
              render the OpenStreetMap iframe on small screens — it
              captures touch events and makes the page hard to scroll.
              Desktop (lg+): full interactive iframe with floating CTA. */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            {/* ── Mobile / Tablet: photo + Get Directions ── */}
            <a
              href="https://maps.app.goo.gl/hk5Z7PQUHnmz6tVB6"
              target="_blank"
              rel="noopener noreferrer"
              className="lg:hidden block relative aspect-[5/4] sm:aspect-[16/10] rounded-3xl overflow-hidden border border-white/10 shadow-2xl group"
            >
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                style={{
                  backgroundImage:
                    "url('/images/new/threemonkeys035.jpg')",
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />

              <div className="absolute top-4 right-4 px-3 py-1.5 bg-black/40 backdrop-blur rounded-full border border-white/10 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#b1b94c]" />
                <span className="text-white text-[10px] uppercase tracking-widest font-medium">
                  Phuket · Thailand
                </span>
              </div>

              <div className="absolute inset-x-4 bottom-4 sm:inset-x-6 sm:bottom-6">
                <div className="text-white text-xs uppercase tracking-[0.3em] mb-2 opacity-80">
                  {t('value_location')}
                </div>
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <div className="text-white font-[family-name:var(--font-krona)] text-lg sm:text-xl truncate">
                      Three Monkeys Restaurant
                    </div>
                    <div className="text-white/60 text-xs sm:text-sm">
                      Wichit, Phuket 83000
                    </div>
                  </div>
                  <span className="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-full bg-[#b1b94c] shadow-lg shadow-[#b1b94c]/30 flex-shrink-0 transition-transform group-hover:scale-110">
                    <Navigation className="h-5 w-5 sm:h-6 sm:w-6 text-black" />
                  </span>
                </div>

                <div className="mt-3 flex items-center justify-center gap-2 rounded-full bg-[#b1b94c] py-3 text-black font-[family-name:var(--font-krona)] text-sm tracking-wide">
                  <span>{tActions('directions')}</span>
                  <ArrowUpRight className="w-4 h-4" />
                </div>
              </div>
            </a>

            {/* ── Desktop: interactive map iframe ── */}
            <div className="hidden lg:block relative aspect-[4/3] rounded-3xl overflow-hidden border border-white/10 shadow-2xl bg-[#1a1a1a]">
              <iframe
                title="Three Monkeys location map"
                src="https://www.openstreetmap.org/export/embed.html?bbox=98.30%2C7.90%2C98.35%2C7.95&layer=mapnik&marker=7.9267%2C98.3256"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                loading="lazy"
                className="grayscale-[30%] hover:grayscale-0 transition-all duration-700"
              />
              <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/40 via-transparent to-transparent" />
            </div>

            {/* Floating Get Directions Card — desktop only */}
            <motion.a
              href="https://maps.app.goo.gl/hk5Z7PQUHnmz6tVB6"
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.02 }}
              className="hidden lg:flex absolute -bottom-6 -left-6 items-center gap-4 p-5 bg-[#b1b94c] rounded-2xl shadow-xl hover:bg-[#c4cc5a] transition-colors group"
            >
              <div className="w-14 h-14 bg-black/10 rounded-xl flex items-center justify-center">
                <Navigation className="w-7 h-7 text-black" />
              </div>
              <div>
                <div className="text-black font-[family-name:var(--font-krona)] text-lg">{tActions('directions')}</div>
                <div className="text-black/60 text-sm">Google Maps</div>
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
                <div className="text-white font-[family-name:var(--font-krona)] text-lg normal-case">{t('travel_times')}</div>
                <div className="text-white/40 text-xs">{t('by_car')}</div>
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
              <span className="text-white/60 text-sm font-[family-name:var(--font-inter)]">{t('free_parking')}</span>
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
            {t('tagline')}
          </p>
        </motion.div>
      </div>
    </section>
  );
}
