'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Globe, X, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter, usePathname } from '@/i18n/navigation';
import { LOCALES, type Locale } from '@/i18n/routing';
import { Flag } from './Flag';

const STORAGE_KEY = 'tm_locale_banner_dismissed_v1';

/**
 * "We noticed you speak X" banner.
 *
 * Logic:
 *   1. Wait until the page has hydrated.
 *   2. If the user has already dismissed the banner (localStorage) — skip.
 *   3. Inspect `navigator.languages`. Pick the first one that maps to a
 *      supported locale AND isn't the locale they're currently on.
 *   4. Show a slim banner pinned to the bottom-right with two buttons:
 *      "Switch to <Native>" and "Keep English".
 *   5. Either button writes the dismissal flag so we never nag again.
 */
export function LocaleSuggestionBanner({ currentLocale }: { currentLocale: string }) {
  const t = useTranslations('localeBanner');
  const router = useRouter();
  const pathname = usePathname();
  const [suggested, setSuggested] = useState<Locale | null>(null);

  useEffect(() => {
    try {
      if (typeof window === 'undefined') return;
      if (window.localStorage.getItem(STORAGE_KEY)) return;

      const langs = window.navigator.languages || [window.navigator.language];
      const candidate = langs
        .map((l) => {
          const base = l.toLowerCase().split('-')[0];
          // Special-case Chinese ('zh') → our slug 'cn'.
          if (base === 'zh') return 'cn';
          return base;
        })
        .find((slug) =>
          LOCALES.some((meta) => meta.code === slug) && slug !== currentLocale,
        );

      if (candidate) {
        setSuggested(candidate as Locale);
      }
    } catch {
      // localStorage / navigator can throw in private/incognito modes —
      // silently skip the banner.
    }
  }, [currentLocale]);

  const dismiss = () => {
    try {
      window.localStorage.setItem(STORAGE_KEY, '1');
    } catch {
      // ignore
    }
    setSuggested(null);
  };

  const switchLocale = () => {
    if (!suggested) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, '1');
    } catch {
      // ignore
    }
    router.replace(pathname, { locale: suggested });
  };

  const meta = suggested ? LOCALES.find((l) => l.code === suggested) : null;
  if (!meta) return null;

  return (
    <AnimatePresence>
      <motion.div
        key="locale-banner"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 24 }}
        transition={{ duration: 0.3 }}
        className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:bottom-6 z-[60] sm:max-w-sm"
      >
        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#0a0a0a]/95 backdrop-blur-xl shadow-2xl shadow-black/40">
          <div className="absolute -top-12 -right-12 h-32 w-32 rounded-full bg-[#b1b94c]/20 blur-3xl" />

          <div className="relative p-4 sm:p-5">
            <button
              onClick={dismiss}
              aria-label="Dismiss"
              className="absolute top-3 right-3 flex h-7 w-7 items-center justify-center rounded-full text-white/40 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex items-start gap-3 pr-8">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#b1b94c]/15 border border-[#b1b94c]/30 flex-shrink-0">
                <Globe className="h-5 w-5 text-[#b1b94c]" />
              </span>
              <div className="min-w-0">
                <p className="text-white text-sm font-medium leading-tight">
                  {t('we_noticed', { language: meta.english })}
                </p>
                <p className="text-white/55 text-xs mt-1 leading-snug">
                  {t('switch_to', { native: meta.native })}
                </p>
              </div>
            </div>

            <div className="mt-4 flex items-center gap-2">
              <button
                onClick={switchLocale}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-[#b1b94c] hover:bg-[#c4cc5a] text-black text-sm font-semibold py-2.5 px-3 transition-colors"
              >
                <Flag locale={meta.code} className="h-3.5 w-5 rounded-sm overflow-hidden ring-1 ring-black/20" />
                {t('switch_cta')}
                <ArrowRight className="h-4 w-4" />
              </button>
              <button
                onClick={dismiss}
                className="rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white/70 text-xs font-medium py-2.5 px-3 transition-colors"
              >
                {t('dismiss')}
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
