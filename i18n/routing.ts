import { defineRouting } from 'next-intl/routing';

/**
 * Three Monkeys i18n routing config.
 *
 * - English (`en`) is the default and lives at the bare URL (`/`).
 * - Every other locale gets a prefixed URL (`/th`, `/cn`, `/ja`, …).
 * - Locale codes are short slugs the customer types/shares, not strict
 *   BCP-47 tags. Internally we still load `messages/<slug>.json`.
 */
export const routing = defineRouting({
  locales: ['en', 'th', 'cn', 'ja', 'ko', 'ru', 'fr', 'es', 'ar'] as const,
  defaultLocale: 'en',
  localePrefix: 'as-needed',
});

export type Locale = (typeof routing.locales)[number];

/**
 * Metadata for each supported locale — used by the language switcher and
 * the "we noticed you speak X" suggestion banner. Kept here so adding
 * a language is a single-file change.
 */
export interface LocaleMeta {
  code: Locale;
  /** Display name in English (admin-friendly) */
  english: string;
  /** Native name shown in the switcher dropdown */
  native: string;
  /** Optional ISO flag emoji for visual scan-ability */
  flag: string;
  /** Set true for languages that read right-to-left. */
  rtl?: boolean;
}

export const LOCALES: readonly LocaleMeta[] = [
  { code: 'en', english: 'English',  native: 'English',    flag: '🇬🇧' },
  { code: 'th', english: 'Thai',     native: 'ภาษาไทย',     flag: '🇹🇭' },
  { code: 'cn', english: 'Chinese',  native: '中文',         flag: '🇨🇳' },
  { code: 'ja', english: 'Japanese', native: '日本語',       flag: '🇯🇵' },
  { code: 'ko', english: 'Korean',   native: '한국어',        flag: '🇰🇷' },
  { code: 'ru', english: 'Russian',  native: 'Русский',     flag: '🇷🇺' },
  { code: 'fr', english: 'French',   native: 'Français',    flag: '🇫🇷' },
  { code: 'es', english: 'Spanish',  native: 'Español',     flag: '🇪🇸' },
  { code: 'ar', english: 'Arabic',   native: 'العربية',     flag: '🇸🇦', rtl: true },
] as const;

export function getLocaleMeta(code: string): LocaleMeta | undefined {
  return LOCALES.find((l) => l.code === code);
}
