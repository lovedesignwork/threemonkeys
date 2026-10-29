import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

const nextConfig: NextConfig = {
  // Exact legacy navigation URLs verified in Search Console's 404 report.
  // Do not redirect deleted articles, attachments or arbitrary locale paths.
  redirects() {
    return [
      { source: '/home', destination: '/', permanent: true },
      { source: '/contact-phuket-three-monkeys-restaurant', destination: '/contact', permanent: true },
      { source: '/faq-three-monkeys-restaurant-phuket', destination: '/faq', permanent: true },
      { source: '/menu-three-monkeys-phuket-diner-thailand', destination: '/menu', permanent: true },
    ];
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },

  // NOTE: The `/th` → `/` redirect previously defined here was removed
  // when Thai became a real locale. The next-intl middleware now owns
  // every `/<locale>` route.
};

export default withNextIntl(nextConfig);
