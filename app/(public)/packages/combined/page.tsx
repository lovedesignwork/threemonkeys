'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { Utensils, Bus, Clock, Users, ArrowRight, Star, Check } from 'lucide-react';
import { Container, Section } from '@/components/ui';
import { packages as allPackages } from '@/lib/data/packages';
import { formatPrice } from '@/lib/utils';

const statLabels: Record<string, string> = {
  courses: 'Courses',
  meals: 'Meals',
  servings: 'Servings',
  duration: 'Duration',
  canopyWalk: 'Canopy Walk',
  parks: 'Parks',
};

export default function CombinedPackagesPage() {
  const packages = allPackages.filter(pkg => pkg.category !== 'transfer');

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-24 bg-[#1a1a1a] overflow-hidden">
        <div className="absolute inset-0 bg-[url('/images/Random images/43_resize.jpg')] bg-cover bg-center opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#1a1a1a] via-transparent to-[#1a1a1a]" />
        
        <Container className="relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-3xl mx-auto"
          >
            <span className="inline-block px-4 py-2 bg-[#b1b94c]/10 text-[#b1b94c] rounded-full text-sm font-medium mb-6">
              Best Value Packages
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-[family-name:var(--font-krona)] text-white mb-6">
              All <span className="text-[#b1b94c]">Packages</span>
            </h1>
            <p className="text-lg text-white/70">
Explore our complete range of dining packages. From tasting menus to cooking classes,
              find the perfect culinary experience for you.
            </p>
          </motion.div>
        </Container>
      </section>

      {/* Packages Section */}
      <Section className="bg-[#0f0f0f] py-20">
        <Container>
          <div className="space-y-8">
            {packages.map((pkg, index) => (
              <motion.div
                key={pkg.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group"
              >
                <div className="relative bg-[#1a1a1a] rounded-2xl overflow-hidden border border-white/10 hover:border-[#b1b94c]/30 transition-all duration-300">
                  <div className="flex flex-col lg:flex-row">
                    {/* Image Section */}
                    <div className="relative h-72 lg:h-auto lg:w-[40%] overflow-hidden">
                      <Image
                        src={pkg.image}
                        alt={pkg.name}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#1a1a1a]/50 lg:block hidden" />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a1a] to-transparent lg:hidden" />
                      
                      {/* Badges */}
                      <div className="absolute top-4 left-4 flex gap-2">
                        <span className="px-3 py-1 bg-[#b1b94c] text-black text-sm font-medium rounded-full flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {pkg.duration}
                        </span>
                      </div>
                      {pkg.popular && (
                        <div className="absolute top-4 right-4">
                          <span className="px-3 py-1 bg-orange-500 text-white text-sm font-medium rounded-full flex items-center gap-1">
                            <Star className="w-3 h-3 fill-current" />
                            Most Popular
                          </span>
                        </div>
                      )}
                    </div>
                    
                    {/* Content Section */}
                    <div className="relative p-8 lg:p-10 lg:w-[60%]">
                      {/* Package Name */}
                      <h2 className="text-3xl lg:text-4xl font-[family-name:var(--font-krona)] text-white mb-4 group-hover:text-[#b1b94c] transition-colors">
                        {pkg.name}
                      </h2>
                      
                      {/* Stats Grid */}
                      {pkg.stats && (
                        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-4 mb-6">
                          {Object.entries(pkg.stats).slice(0, 5).map(([key, value]) => (
                            <div key={key} className="text-center p-3 bg-white/5 rounded-xl">
                              <div className="text-2xl font-bold text-[#b1b94c]">{value}</div>
                              <div className="text-xs text-white/60 uppercase tracking-wider">{statLabels[key] || key}</div>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {/* Includes */}
                      <div className="flex flex-wrap gap-3 mb-6">
                        {pkg.includesMeal && (
                          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 text-green-400 text-sm">
                            <Utensils className="w-4 h-4" />
                            Free Meal Included
                          </span>
                        )}
                        {pkg.includesTransfer && (
                          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#b1b94c]/10 text-[#b1b94c] text-sm">
                            <Bus className="w-4 h-4" />
                            Free Round-Trip Transfer
                          </span>
                        )}
                      </div>
                      
                      {/* Features List */}
                      {pkg.highlights && pkg.highlights.length > 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-6">
                          {pkg.highlights.slice(0, 4).map((highlight, idx) => (
                            <div key={idx} className="flex items-center gap-2 text-white/70 text-sm">
                              <Check className="w-4 h-4 text-[#b1b94c] flex-shrink-0" />
                              {highlight}
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {/* Price & CTA */}
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-6 border-t border-white/10">
                        <div>
                          <span className="text-white/60 text-sm">Starting from</span>
                          <div className="text-3xl font-bold text-[#b1b94c]">
                            {formatPrice(pkg.price)}
                            <span className="text-lg text-white/60 font-normal"> / person</span>
                          </div>
                        </div>
                        <Link href={`/packages/${pkg.slug}`}>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="flex items-center gap-2 px-8 py-4 bg-[#b1b94c] hover:bg-[#d4c91e] text-black font-medium rounded-full transition-all shadow-lg hover:shadow-[#b1b94c]/30"
                          >
                            View Details
                            <ArrowRight className="w-5 h-5" />
                          </motion.button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </Container>
      </Section>

      {/* Why Choose Section */}
      <Section className="bg-[#1a1a1a] py-16">
        <Container>
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-[family-name:var(--font-krona)] text-white mb-4">
              Why Choose <span className="text-[#b1b94c]">Three Monkeys</span>?
            </h2>
            <p className="text-white/60 mb-8">
Experience Phuket&apos;s finest Thai cuisine. Our packages offer incredible value with
              fresh local ingredients, expert chefs, and unforgettable dining experiences.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 bg-[#0f0f0f] rounded-xl border border-white/10">
                <div className="w-12 h-12 bg-[#b1b94c]/10 rounded-xl flex items-center justify-center mb-4 mx-auto">
                  <Star className="w-6 h-6 text-[#b1b94c]" />
                </div>
                <h3 className="text-white font-medium mb-2">Best Value</h3>
                <p className="text-white/60 text-sm">Save up to 30% compared to booking activities separately</p>
              </div>
              <div className="p-6 bg-[#0f0f0f] rounded-xl border border-white/10">
                <div className="w-12 h-12 bg-[#b1b94c]/10 rounded-xl flex items-center justify-center mb-4 mx-auto">
                  <Bus className="w-6 h-6 text-[#b1b94c]" />
                </div>
                <h3 className="text-white font-medium mb-2">Free Transfers</h3>
                <p className="text-white/60 text-sm">Complimentary hotel pickup and drop-off included</p>
              </div>
              <div className="p-6 bg-[#0f0f0f] rounded-xl border border-white/10">
                <div className="w-12 h-12 bg-[#b1b94c]/10 rounded-xl flex items-center justify-center mb-4 mx-auto">
                  <Users className="w-6 h-6 text-[#b1b94c]" />
                </div>
                <h3 className="text-white font-medium mb-2">All Ages Welcome</h3>
                <p className="text-white/60 text-sm">Perfect for families, couples, and solo diners</p>
              </div>
            </div>
          </div>
        </Container>
      </Section>
    </main>
  );
}
