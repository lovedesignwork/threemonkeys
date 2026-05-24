import GB from 'country-flag-icons/react/3x2/GB';
import TH from 'country-flag-icons/react/3x2/TH';
import CN from 'country-flag-icons/react/3x2/CN';
import JP from 'country-flag-icons/react/3x2/JP';
import KR from 'country-flag-icons/react/3x2/KR';
import RU from 'country-flag-icons/react/3x2/RU';
import FR from 'country-flag-icons/react/3x2/FR';
import ES from 'country-flag-icons/react/3x2/ES';
import SA from 'country-flag-icons/react/3x2/SA';
import type { Locale } from '@/i18n/routing';

/**
 * Locale → ISO 3166-1 alpha-2 country code used to pick the right flag.
 * `en` shows the UK flag — most recognisable English association.
 * `ar` shows the Saudi Arabia flag — most recognisable Arabic association.
 */
const FLAGS: Record<Locale, React.ComponentType<{ className?: string; title?: string }>> = {
  en: GB,
  th: TH,
  cn: CN,
  ja: JP,
  ko: KR,
  ru: RU,
  fr: FR,
  es: ES,
  ar: SA,
};

interface FlagProps {
  locale: Locale;
  /** Tailwind class — provide a width and aspect ratio. Defaults to a small rounded chip. */
  className?: string;
  title?: string;
}

/**
 * Renders an SVG country flag for the given locale. Replaces the unreliable
 * emoji flags (which render as text on Windows and inconsistently elsewhere)
 * with proper crisp vectors that look identical on every platform.
 */
export function Flag({ locale, className = 'h-3.5 w-5 rounded-sm overflow-hidden ring-1 ring-black/10', title }: FlagProps) {
  const Component = FLAGS[locale];
  if (!Component) return null;
  return <Component className={className} title={title} />;
}
