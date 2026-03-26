'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Phone, Mail } from 'lucide-react';

const navigation = [
  { name: 'Home', href: '/' },
  { name: 'Our Seats', href: '/seats' },
  { name: 'Special Packages', href: '/special-packages' },
  { name: 'About', href: '/about' },
  { name: 'Blog', href: '/blog' },
  { name: 'FAQ', href: '/faq' },
  { name: 'Contact', href: '/contact' },
];

export function Header() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Pages where header should not be sticky
  const isStaticHeader = pathname?.startsWith('/booking') || pathname?.startsWith('/checkout');

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  return (
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
                isScrolled || isStaticHeader ? 'w-[72px]' : 'w-[94px]'
              }`}
              priority
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-6">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`block py-2 font-[family-name:var(--font-krona)] text-sm font-medium uppercase tracking-widest transition-colors ${
                  pathname === item.href
                    ? 'text-[#b1b94c]'
                    : 'text-white/80 hover:text-white'
                }`}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Right CTA & Mobile Toggle */}
          <div className="relative z-10 flex items-center gap-6">
            <Link href="/booking" className="hidden sm:block">
              <button className="group relative overflow-hidden rounded-full border border-[#b1b94c] bg-transparent px-8 py-2.5 font-[family-name:var(--font-krona)] text-sm font-semibold uppercase tracking-widest text-[#b1b94c] transition-all hover:bg-[#b1b94c] hover:text-black">
                <span className="relative z-10">Reserve</span>
              </button>
            </Link>

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="flex h-10 w-10 items-center justify-center rounded-full text-white transition-colors hover:bg-white/10 lg:hidden"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: '100vh' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="absolute left-0 right-0 top-full overflow-hidden border-t border-white/10 bg-black/95 backdrop-blur-2xl lg:hidden"
          >
            <div className="flex h-full flex-col justify-between p-6 pb-24">
              <nav className="flex flex-col space-y-4">
                {navigation.map((item) => (
                  <div key={item.name} className="border-b border-white/10 pb-4">
                    <Link
                      href={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`block font-[family-name:var(--font-krona)] text-2xl font-semibold transition-colors ${
                        pathname === item.href ? 'text-[#b1b94c]' : 'text-white'
                      }`}
                    >
                      {item.name}
                    </Link>
                  </div>
                ))}
              </nav>

              <div className="mt-8 flex flex-col gap-6">
                <Link
                  href="/booking"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex w-full items-center justify-center rounded-full bg-[#b1b94c] px-6 py-4 font-[family-name:var(--font-krona)] text-lg font-bold uppercase tracking-widest text-black transition-colors"
                >
                  Reserve A Table
                </Link>

                <div className="flex flex-col gap-4">
                  <a href="tel:+66980108838" className="flex items-center gap-3 text-sm font-medium text-white/60 hover:text-[#b1b94c]">
                    <Phone className="h-5 w-5" />
                    +66 98-010-8838
                  </a>
                  <a href="mailto:enjoy@threemonkeysphuket.com" className="flex items-center gap-3 text-sm font-medium text-white/60 hover:text-[#b1b94c]">
                    <Mail className="h-5 w-5" />
                    enjoy@threemonkeysphuket.com
                  </a>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
