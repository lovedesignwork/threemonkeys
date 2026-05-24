import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },

  /**
   * URL redirects.
   *
   * - `/th` and `/th/*` go back to the English site root. We don't yet
   *   serve a Thai locale, so anyone landing on a /th link from a
   *   share/QR/legacy source still ends up on a working page.
   */
  async redirects() {
    return [
      {
        source: '/th',
        destination: '/',
        permanent: false,
      },
      {
        source: '/th/:path*',
        destination: '/',
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
