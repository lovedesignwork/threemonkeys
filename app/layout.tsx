import type { Metadata, Viewport } from 'next';
import { Inter, Oswald, Krona_One } from 'next/font/google';
import './globals.css';
import { defaultMetadata } from '@/lib/seo/config';
import { OrganizationSchema, WebsiteSchema, LocalBusinessSchema, RestaurantSchema, SpeakableSchema, HowToBookSchema } from '@/lib/seo/structured-data';
import { TrackingScriptsHead, TrackingScriptsBody } from '@/components/TrackingScripts';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const oswald = Oswald({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-oswald',
  display: 'swap',
});

const krona = Krona_One({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-krona',
  display: 'swap',
});

export const metadata: Metadata = defaultMetadata;

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#b1b94c',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${oswald.variable} ${krona.variable}`}>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        <OrganizationSchema />
        <WebsiteSchema />
        <LocalBusinessSchema />
        <RestaurantSchema />
        <SpeakableSchema />
        <HowToBookSchema />
      </head>
      <body className="antialiased font-[family-name:var(--font-inter)]">
        <TrackingScriptsBody />
        {children}
        <TrackingScriptsHead />
      </body>
    </html>
  );
}
