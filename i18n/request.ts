import { getRequestConfig } from 'next-intl/server';
import { hasLocale } from 'next-intl';
import { routing } from './routing';

/**
 * Loads the right translation file for the current request. Anything not
 * found in the locale's bundle falls back to the English bundle so
 * partially-translated locales don't crash with missing keys.
 */
export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;

  const messages = (await import(`../messages/${locale}.json`)).default;

  return {
    locale,
    messages,
    // Asia/Bangkok everywhere so date/time formatting stays consistent
    // with the restaurant's local time.
    timeZone: 'Asia/Bangkok',
    now: new Date(),
  };
});
