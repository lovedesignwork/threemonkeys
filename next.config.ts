import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

const nextConfig: NextConfig = {
  images: {
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
