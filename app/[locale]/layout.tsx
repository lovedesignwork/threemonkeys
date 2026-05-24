import { notFound } from 'next/navigation';
import { hasLocale, NextIntlClientProvider } from 'next-intl';
import { setRequestLocale, getMessages } from 'next-intl/server';
import { routing, getLocaleMeta } from '@/i18n/routing';
import { HtmlLangSync } from '@/components/i18n/HtmlLangSync';
import { LocaleSuggestionBanner } from '@/components/i18n/LocaleSuggestionBanner';

interface LocaleLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

/**
 * Pre-render every supported locale at build time.
 * The root `app/layout.tsx` still owns the <html>/<body> tags; this
 * layout just hands the locale + messages down through Context.
 */
export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({ children, params }: LocaleLayoutProps) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);
  const messages = await getMessages();
  const meta = getLocaleMeta(locale);

  return (
    <NextIntlClientProvider locale={locale} messages={messages} timeZone="Asia/Bangkok">
      <HtmlLangSync lang={locale} dir={meta?.rtl ? 'rtl' : 'ltr'} />
      <LocaleSuggestionBanner currentLocale={locale} />
      {children}
    </NextIntlClientProvider>
  );
}
