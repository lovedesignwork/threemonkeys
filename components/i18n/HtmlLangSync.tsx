'use client';

import { useEffect } from 'react';

/**
 * Keeps the root <html lang="..." dir="..."> attributes in sync with the
 * active locale. The root layout owns the <html> element with a static
 * `lang="en"`, so we update it from the client once we know the locale.
 *
 * For SEO this isn't perfect (crawlers see the SSR value), but Google
 * uses the page content for language detection regardless. We'd need a
 * full per-locale <html> route group to get this right at SSR — not
 * worth the refactor for Phase 1.
 */
export function HtmlLangSync({ lang, dir }: { lang: string; dir: 'ltr' | 'rtl' }) {
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = lang;
      document.documentElement.dir = dir;
    }
  }, [lang, dir]);
  return null;
}
