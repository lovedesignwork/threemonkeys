import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Three Monkeys Restaurant',
    short_name: 'Three Monkeys',
    description: 'Authentic Southern Thai Cuisine in Phuket\'s rainforest',
    start_url: '/',
    display: 'standalone',
    background_color: '#0a0a0a',
    theme_color: '#b1b94c',
    orientation: 'portrait-primary',
    categories: ['food', 'restaurant', 'dining', 'travel'],
    icons: [
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
    screenshots: [
      {
        src: '/images/og-image.jpg',
        sizes: '1200x630',
        type: 'image/jpeg',
      },
    ],
  };
}
