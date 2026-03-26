'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Facebook, Instagram, Youtube, ArrowUpRight, MapPin, Phone, Mail, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

const navLinks = [
  { name: 'Home', href: '/' },
  { name: 'Our Seats', href: '/packages' },
  { name: 'About', href: '/about' },
  { name: 'Blog', href: '/blog' },
  { name: 'FAQ', href: '/faq' },
  { name: 'Contact', href: '/contact' },
];

const legalLinks = [
  { name: 'Privacy', href: '/privacy' },
  { name: 'Terms', href: '/terms' },
  { name: 'Refund', href: '/refund' },
];

const socialLinks = [
  { name: 'Facebook', icon: Facebook, href: 'https://facebook.com/threemonkeys' },
  { name: 'Instagram', icon: Instagram, href: 'https://www.instagram.com/threemonkeysrestaurant/' },
  { name: 'YouTube', icon: Youtube, href: 'https://youtube.com/threemonkeys' },
];

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative bg-[#0a0a0a]">
      {/* Top CTA Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-[#b1b94c]/20 via-[#b1b94c]/10 to-[#b1b94c]/20" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div>
              <h3 className="text-2xl md:text-3xl font-[family-name:var(--font-krona)] text-white mb-2 normal-case">
                Ready for an unforgettable meal?
              </h3>
              <p className="text-white/50 font-[family-name:var(--font-inter)]">
                Reserve your table in the rainforest today
              </p>
            </div>
            <Link href="/booking">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-3 px-8 py-4 bg-[#b1b94c] text-black font-[family-name:var(--font-krona)] rounded-full hover:bg-[#c4cc5a] transition-all"
              >
                RESERVE A TABLE
                <ArrowUpRight className="w-5 h-5" />
              </motion.button>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12">
            {/* Brand Section */}
            <div className="lg:col-span-4">
              <Link href="/" className="inline-block mb-6">
                <Image
                  src="/images/3M logo.png"
                  alt="Three Monkeys"
                  width={100}
                  height={100}
                  className="h-16 w-auto"
                  unoptimized
                />
              </Link>
              <p className="text-white/40 text-sm leading-relaxed mb-6 max-w-xs font-[family-name:var(--font-inter)]">
                Authentic Southern Thai cuisine nestled in Phuket&apos;s rainforest. 
                A dining experience unlike any other.
              </p>
              
              {/* Social Links */}
              <div className="flex gap-3">
                {socialLinks.map((social) => (
                  <a
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-[#b1b94c] hover:border-[#b1b94c] transition-all group"
                    aria-label={social.name}
                  >
                    <social.icon className="w-4 h-4 text-white/50 group-hover:text-black transition-colors" />
                  </a>
                ))}
              </div>
            </div>

            {/* Quick Links */}
            <div className="lg:col-span-2">
              <h4 className="text-white font-semibold text-sm uppercase tracking-wider mb-5">
                Explore
              </h4>
              <ul className="space-y-3">
                {navLinks.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-white/40 hover:text-[#b1b94c] transition-colors text-sm font-[family-name:var(--font-inter)]"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal Links */}
            <div className="lg:col-span-2">
              <h4 className="text-white font-semibold text-sm uppercase tracking-wider mb-5">
                Legal
              </h4>
              <ul className="space-y-3">
                {legalLinks.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-white/40 hover:text-[#b1b94c] transition-colors text-sm font-[family-name:var(--font-inter)]"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact Info */}
            <div className="lg:col-span-4">
              <h4 className="text-white font-semibold text-sm uppercase tracking-wider mb-5">
                Visit Us
              </h4>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-[#b1b94c] mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-white/70 text-sm font-[family-name:var(--font-inter)]">Inside Hanuman World</p>
                    <p className="text-white/40 text-sm font-[family-name:var(--font-inter)]">Wichit, Phuket 83000, Thailand</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-[#b1b94c] flex-shrink-0" />
                  <a href="tel:+66980108838" className="text-white/70 hover:text-[#b1b94c] text-sm transition-colors font-[family-name:var(--font-inter)]">
                    +66 98-010-8838
                  </a>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-[#b1b94c] flex-shrink-0" />
                  <a href="mailto:enjoy@threemonkeysphuket.com" className="text-white/70 hover:text-[#b1b94c] text-sm transition-colors font-[family-name:var(--font-inter)]">
                    enjoy@threemonkeysphuket.com
                  </a>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="w-4 h-4 text-[#b1b94c] flex-shrink-0" />
                  <p className="text-white/70 text-sm font-[family-name:var(--font-inter)]">
                    Open Daily 10AM – 01AM
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-white/30 text-xs font-[family-name:var(--font-inter)]">
              © {currentYear} Three Monkeys Restaurant. All rights reserved.
            </p>
            <p className="text-white/30 text-xs font-[family-name:var(--font-inter)]">
              Powered by{' '}
              <a 
                href="https://onebooking.co" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-white/50 hover:text-[#b1b94c] transition-colors"
              >
                ONEBOOKING
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
