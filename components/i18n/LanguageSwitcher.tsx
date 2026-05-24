'use client';

import { useEffect, useRef, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, Check, ChevronDown } from 'lucide-react';
import { useRouter, usePathname } from '@/i18n/navigation';
import { LOCALES, type Locale } from '@/i18n/routing';
import { Flag } from './Flag';

interface LanguageSwitcherProps {
  /** Visual variant — compact for mobile menus, mobile for drawer header, default for desktop header. */
  variant?: 'default' | 'compact' | 'mobile';
}

export function LanguageSwitcher({ variant = 'default' }: LanguageSwitcherProps) {
  const t = useTranslations('switcher');
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  // Close on outside click + Escape
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const current = LOCALES.find((l) => l.code === locale) ?? LOCALES[0];

  const handlePick = (code: string) => {
    setOpen(false);
    router.replace(pathname, { locale: code });
  };

  // Mobile variant — dropdown with native language names
  if (variant === 'mobile') {
    return (
      <div ref={rootRef} className="relative">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label={t('aria')}
          aria-expanded={open}
          className="flex items-center gap-2.5 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 hover:border-[#b1b94c]/50 text-white px-4 py-2.5 transition-all"
        >
          <Flag locale={current.code} className="h-4 w-5 rounded-[3px] overflow-hidden ring-1 ring-black/20 flex-shrink-0" />
          <span className="text-sm font-medium">{current.native}</span>
          <ChevronDown className={`h-4 w-4 text-white/60 transition-transform ${open ? 'rotate-180' : ''}`} />
        </button>

        <AnimatePresence>
          {open && (
            <motion.ul
              initial={{ opacity: 0, y: -8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute left-0 top-full mt-2 w-64 max-h-[60vh] overflow-y-auto rounded-2xl border border-white/10 bg-[#0a0a0a]/98 backdrop-blur-xl shadow-2xl shadow-black/50 p-2 z-[110]"
              role="listbox"
              aria-label={t('label')}
            >
              {LOCALES.map((l) => {
                const active = l.code === locale;
                return (
                  <li key={l.code}>
                    <button
                      type="button"
                      onClick={() => handlePick(l.code)}
                      aria-selected={active}
                      role="option"
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors ${
                        active
                          ? 'bg-[#b1b94c] text-black'
                          : 'text-white hover:bg-white/10'
                      }`}
                    >
                      <Flag locale={l.code} className="h-4 w-5 rounded-[3px] overflow-hidden ring-1 ring-black/20 flex-shrink-0" />
                      <span className="flex-1 min-w-0">
                        <span className="block text-sm font-medium leading-tight">{l.native}</span>
                        <span className={`block text-[10px] uppercase tracking-widest ${active ? 'text-black/50' : 'text-white/40'}`}>
                          {l.english}
                        </span>
                      </span>
                      {active && <Check className="h-4 w-4 text-black/70" />}
                    </button>
                  </li>
                );
              })}
            </motion.ul>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={t('aria')}
        aria-expanded={open}
        className={
          variant === 'compact'
            ? 'flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white transition-all hover:bg-white/10 hover:border-[#b1b94c]/50'
            : 'flex items-center gap-2 rounded-full border border-white/15 bg-white/5 hover:bg-white/10 hover:border-[#b1b94c]/50 text-white/85 px-3 py-2 text-xs uppercase tracking-widest font-medium transition-all'
        }
      >
        {variant === 'compact' ? (
          <Globe className="h-5 w-5" />
        ) : (
          <>
            <Flag locale={current.code} className="h-3 w-[18px] rounded-[2px] overflow-hidden ring-1 ring-black/20" />
            <span className="font-[family-name:var(--font-krona)]">{current.code.toUpperCase()}</span>
            <ChevronDown className={`h-3 w-3 transition-transform ${open ? 'rotate-180' : ''}`} />
          </>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.ul
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-56 max-h-[70vh] overflow-y-auto rounded-2xl border border-white/10 bg-[#0a0a0a]/95 backdrop-blur-xl shadow-2xl shadow-black/40 p-1.5 z-50"
            role="listbox"
            aria-label={t('label')}
          >
            {LOCALES.map((l) => {
              const active = l.code === locale;
              return (
                <li key={l.code}>
                  <button
                    type="button"
                    onClick={() => handlePick(l.code)}
                    aria-selected={active}
                    role="option"
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left text-sm transition-colors ${
                      active
                        ? 'bg-[#b1b94c]/15 text-[#b1b94c]'
                        : 'text-white/80 hover:bg-white/5'
                    }`}
                  >
                    <Flag locale={l.code} className="h-3.5 w-5 rounded-sm overflow-hidden ring-1 ring-black/20 flex-shrink-0" />
                    <span className="flex-1 min-w-0">
                      <span className="block leading-tight">{l.native}</span>
                      <span className="block text-[10px] uppercase tracking-widest text-white/35">
                        {l.english}
                      </span>
                    </span>
                    {active && <Check className="h-4 w-4 text-[#b1b94c]" />}
                  </button>
                </li>
              );
            })}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}
