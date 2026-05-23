/**
 * /maintenance — shown by middleware.ts when MAINTENANCE_MODE=true.
 *
 * Owners can bypass by visiting any URL with ?preview=<PIN> (where PIN
 * matches MAINTENANCE_BYPASS_PIN env var). A cookie is then set for 30 days.
 *
 * Admin URLs (/admin/*) are always allowed through — staff log in normally.
 */

import type { Metadata } from 'next';
import Image from 'next/image';

export const metadata: Metadata = {
  title: 'Under Maintenance · Three Monkeys Restaurant Phuket',
  description: 'Three Monkeys Restaurant is preparing something special. We\'ll be back online very soon.',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

export default function MaintenancePage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#0a0a0a] text-white">
      {/* Decorative background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-1/2 left-1/2 h-[800px] w-[800px] -translate-x-1/2 rounded-full bg-[#b1b94c]/10 blur-[140px]" />
        <div className="absolute bottom-0 left-0 h-[400px] w-[400px] rounded-full bg-[#b1b94c]/5 blur-[100px]" />
        <div className="absolute bottom-1/4 right-0 h-[500px] w-[500px] rounded-full bg-[#b1b94c]/5 blur-[120px]" />
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              'radial-gradient(circle at 1px 1px, rgba(177, 185, 76, 0.2) 1px, transparent 0)',
            backgroundSize: '32px 32px',
          }}
        />
      </div>

      <section className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6 py-12">
        {/* Logo */}
        <div className="mb-10 flex items-center justify-center">
          <Image
            src="/images/3M logo.png"
            alt="Three Monkeys Restaurant Phuket"
            width={220}
            height={73}
            priority
            unoptimized
            className="h-auto w-auto max-w-[200px] sm:max-w-[240px]"
          />
        </div>

        {/* Status pill */}
        <div className="mb-8 flex items-center gap-2 rounded-full border border-[#b1b94c]/30 bg-[#b1b94c]/10 px-4 py-2">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#b1b94c] opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-[#b1b94c]" />
          </span>
          <span className="text-xs font-medium uppercase tracking-[0.2em] text-[#b1b94c]">
            Scheduled Maintenance
          </span>
        </div>

        {/* Headline */}
        <h1 className="mb-6 text-center text-3xl font-[family-name:var(--font-krona)] normal-case leading-tight sm:text-5xl lg:text-6xl">
          We&apos;re polishing
          <br />
          <span className="text-[#b1b94c]">something special</span>
        </h1>

        {/* Subline */}
        <p className="max-w-xl text-center text-base text-white/60 sm:text-lg">
          Our website is briefly offline while we update the experience.
          We&apos;ll be back very soon.
        </p>

        {/* Footer */}
        <p className="mt-16 text-center text-xs text-white/30">
          © {new Date().getFullYear()} Three Monkeys Restaurant Phuket. Authentic Southern Thai Cuisine.
        </p>
      </section>
    </main>
  );
}
