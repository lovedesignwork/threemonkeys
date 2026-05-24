'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Menu,
  X,
  Phone,
  Mail,
  MessageCircle,
  ArrowUpRight,
  CalendarHeart,
  Home,
  UtensilsCrossed,
  Armchair,
  Sparkles,
  Info,
  HelpCircle,
  AtSign,
} from 'lucide-react';

interface NavItem {
  name: string;
  href: string;
  lines: string[];
  icon: React.ComponentType<{ className?: string }>;
  hidden?: boolean;
}

const navigation: NavItem[] = [
  { name: 'Home',             href: '/',                 lines: ['Home'],                  icon: Home },
  { name: 'Menu',             href: '/menu',             lines: ['Menu'],                  icon: UtensilsCrossed },
  { name: 'Our Seats',        href: '/seats',            lines: ['Our', 'Seats'],          icon: Armchair },
  { name: 'Special Packages', href: '/special-packages', lines: ['Special', 'Packages'],   icon: Sparkles },
  { name: 'About',            href: '/about',            lines: ['About'],                 icon: Info },
  { name: 'Blog',             href: '/blog',             lines: ['Blog'],                  icon: AtSign, hidden: true },
  { name: 'FAQ',              href: '/faq',              lines: ['FAQ'],                   icon: HelpCircle },
  { name: 'Contact',          href: '/contact',          lines: ['Contact'],               icon: Mail },
];

export function Header() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isStaticHeader = pathname?.startsWith('/booking') || pathname?.startsWith('/checkout');

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // Lock body scroll when menu open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  const visibleNav = navigation.filter((item) => !item.hidden);

  return (
    <>
      <header
        className={`${isStaticHeader ? 'relative' : 'fixed top-0 left-0 right-0'} z-50 transition-all duration-300 ${
          isStaticHeader
            ? 'bg-[#0a0a0a] border-b border-white/10 py-4'
            : isScrolled
              ? 'bg-black/80 backdrop-blur-xl border-b border-white/10 py-3 shadow-2xl'
              : 'bg-transparent py-6'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="relative z-10 flex shrink-0 items-center">
              <Image
                src="/images/3M logo.png"
                alt="Three Monkeys"
                width={120}
                height={40}
                className={`h-auto transition-all duration-300 ${
                  isScrolled || isStaticHeader ? 'w-[64px] sm:w-[72px]' : 'w-[80px] sm:w-[94px]'
                }`}
                priority
              />
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-5">
              {visibleNav.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex flex-col items-center justify-center py-2 font-[family-name:var(--font-krona)] text-xs font-medium uppercase tracking-widest transition-colors leading-tight text-center ${
                    pathname === item.href
                      ? 'text-[#b1b94c]'
                      : 'text-white/80 hover:text-white'
                  }`}
                >
                  {item.lines.map((line, idx) => (
                    <span key={idx}>{line}</span>
                  ))}
                </Link>
              ))}
            </nav>

            {/* Right CTA & Mobile Toggle */}
            <div className="relative z-10 flex items-center gap-3 sm:gap-6">
              <Link href="/booking" className="hidden sm:block">
                <button className="group relative overflow-hidden rounded-full border border-[#b1b94c] bg-transparent px-6 sm:px-8 py-2 sm:py-2.5 font-[family-name:var(--font-krona)] text-xs sm:text-sm font-semibold uppercase tracking-widest text-[#b1b94c] transition-all hover:bg-[#b1b94c] hover:text-black">
                  <span className="relative z-10">Reserve</span>
                </button>
              </Link>

              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white transition-all hover:bg-white/10 hover:border-[#b1b94c]/50 lg:hidden"
                aria-label="Open menu"
              >
                <Menu className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ───────────────────────────────────────────────
          FULL-SCREEN MOBILE MENU
          ─────────────────────────────────────────────── */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[100] lg:hidden"
          >
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/70 backdrop-blur-md"
              onClick={() => setIsMobileMenuOpen(false)}
            />

            {/* Drawer */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.45, ease: [0.32, 0.72, 0, 1] }}
              className="absolute inset-y-0 right-0 w-full sm:max-w-md bg-[#0a0a0a] flex flex-col overflow-hidden"
            >
              {/* Atmospheric background — radial lime glow + texture */}
              <div className="pointer-events-none absolute inset-0 opacity-60">
                <div className="absolute -top-1/4 right-0 h-[500px] w-[500px] rounded-full bg-[#b1b94c]/15 blur-[120px]" />
                <div className="absolute bottom-0 left-0 h-[400px] w-[400px] rounded-full bg-[#b1b94c]/8 blur-[100px]" />
                <div
                  className="absolute inset-0 opacity-[0.04]"
                  style={{
                    backgroundImage:
                      'radial-gradient(circle at 1px 1px, rgba(177, 185, 76, 1) 1px, transparent 0)',
                    backgroundSize: '28px 28px',
                  }}
                />
              </div>

              {/* Drawer header */}
              <div className="relative flex items-center justify-between px-6 py-5 border-b border-white/10">
                <Link
                  href="/"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-3 min-w-0"
                >
                  <Image
                    src="/images/3M logo.png"
                    alt="Three Monkeys Restaurant"
                    width={56}
                    height={56}
                    className="h-12 w-auto flex-shrink-0"
                    priority
                  />
                  <div className="leading-tight min-w-0">
                    <p className="font-[family-name:var(--font-krona)] text-white text-xs sm:text-sm tracking-wide truncate">
                      THREE MONKEYS RESTAURANT
                    </p>
                    <p className="text-[10px] text-[#b1b94c] uppercase tracking-[0.25em]">
                      Phuket — Thailand
                    </p>
                  </div>
                </Link>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white transition-all hover:bg-white/10 hover:border-[#b1b94c]/50 flex-shrink-0 ml-3"
                  aria-label="Close menu"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Navigation list */}
              <nav className="relative flex-1 overflow-y-auto px-3 py-5">
                <ul className="space-y-1">
                  {visibleNav.map((item, idx) => {
                    const isActive = pathname === item.href;
                    const Icon = item.icon;
                    return (
                      <motion.li
                        key={item.name}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.08 + idx * 0.04, duration: 0.35, ease: 'easeOut' }}
                      >
                        <Link
                          href={item.href}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className={`group flex items-center justify-between px-4 py-3 rounded-2xl transition-all duration-200 ${
                            isActive
                              ? 'bg-[#b1b94c] text-black'
                              : 'text-white hover:bg-white/5 active:bg-white/10'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span
                              className={`flex h-9 w-9 items-center justify-center rounded-xl transition-all ${
                                isActive
                                  ? 'bg-black/15 text-black'
                                  : 'bg-white/5 text-[#b1b94c] group-hover:bg-[#b1b94c]/15'
                              }`}
                            >
                              <Icon className="h-4 w-4" />
                            </span>
                            <span className="font-[family-name:var(--font-krona)] text-xs tracking-[0.15em] uppercase">
                              {item.name}
                            </span>
                          </div>
                          <ArrowUpRight
                            className={`h-4 w-4 transition-all ${
                              isActive
                                ? 'text-black/70 translate-x-0'
                                : 'text-white/30 -translate-x-1 opacity-0 group-hover:translate-x-0 group-hover:opacity-100'
                            }`}
                          />
                        </Link>
                      </motion.li>
                    );
                  })}
                </ul>
              </nav>

              {/* Bottom action panel */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.4 }}
                className="relative border-t border-white/10 bg-[#0a0a0a]/80 backdrop-blur p-5 pb-7 space-y-4"
              >
                {/* Reserve CTA — big lime pill */}
                <Link
                  href="/booking"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex w-full items-center justify-center gap-3 rounded-2xl bg-[#b1b94c] px-6 py-4 font-[family-name:var(--font-krona)] text-base font-bold uppercase tracking-widest text-black shadow-[0_10px_30px_rgba(177,185,76,0.25)] transition-all hover:bg-[#c4cc5a] active:scale-[0.98]"
                >
                  <CalendarHeart className="h-5 w-5" />
                  Reserve a Table
                </Link>

                {/* Quick contact row */}
                <div className="grid grid-cols-3 gap-2">
                  <a
                    href="tel:+66980108838"
                    className="flex flex-col items-center justify-center gap-1.5 rounded-2xl border border-white/10 bg-white/5 px-2 py-3 text-white/80 transition-all hover:border-[#b1b94c]/40 hover:bg-white/10 hover:text-[#b1b94c]"
                  >
                    <Phone className="h-5 w-5 text-[#b1b94c]" />
                    <span className="text-[10px] font-medium uppercase tracking-wider">Call</span>
                  </a>
                  <a
                    href="https://wa.me/66980108838"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center justify-center gap-1.5 rounded-2xl border border-white/10 bg-white/5 px-2 py-3 text-white/80 transition-all hover:border-emerald-500/40 hover:bg-white/10 hover:text-emerald-400"
                  >
                    <MessageCircle className="h-5 w-5 text-emerald-400" />
                    <span className="text-[10px] font-medium uppercase tracking-wider">
                      WhatsApp
                    </span>
                  </a>
                  <a
                    href="mailto:enjoy@threemonkeysphuket.com"
                    className="flex flex-col items-center justify-center gap-1.5 rounded-2xl border border-white/10 bg-white/5 px-2 py-3 text-white/80 transition-all hover:border-blue-500/40 hover:bg-white/10 hover:text-blue-400"
                  >
                    <Mail className="h-5 w-5 text-blue-400" />
                    <span className="text-[10px] font-medium uppercase tracking-wider">Email</span>
                  </a>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
