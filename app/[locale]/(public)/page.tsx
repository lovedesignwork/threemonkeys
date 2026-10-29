import { 
  HeroSlideshow,
  SpecialPackages,
  FeaturedPackages, 
  WhyChooseUs,
  MenuShowcase,
  PhotoGallery,
  Testimonials,
  SafetyCertifications,
  CTABanner,
  Location,
} from '@/components/home';
import { createPageMetadata } from '@/lib/seo/config';
import { LatestArticles } from '@/components/home/LatestArticles';
import { Suspense } from 'react';
export const dynamic = 'force-dynamic';

export const generateMetadata = createPageMetadata(
  'Rainforest Dining in Phuket',
  'Experience Southern Thai cuisine at Three Monkeys Restaurant in Phuket’s rainforest. Explore our menu, dining zones, and special packages. Reserve online.',
  '/',
);

export default function HomePage() {
  return (
    // overflow-x-clip prevents the hero slideshow scale-up animation
    // (initial { scale: 1.05 }) from briefly extending past the viewport
    // on mobile, which was nudging the fixed header — and the hamburger
    // button — slightly off the right edge.
    <main className="min-h-screen bg-[#0f0f0f] overflow-x-clip">
      <HeroSlideshow />
      <MenuShowcase />
      <FeaturedPackages />
      <SpecialPackages />
      <WhyChooseUs />
      <PhotoGallery />
      <Suspense fallback={
        <div aria-hidden="true" className="bg-[#121511] px-5 py-20 sm:px-8 lg:py-28">
          <div className="mx-auto max-w-7xl">
            <div className="mb-12 h-24" />
            <div className="grid gap-10 md:grid-cols-3">
              {[0, 1, 2].map((item) => (
                <div key={item}>
                  <div className="aspect-[16/11] bg-white/5" />
                  <div className="h-56" />
                </div>
              ))}
            </div>
          </div>
        </div>
      }>
        <LatestArticles />
      </Suspense>
      <Testimonials />
      <SafetyCertifications />
      <CTABanner />
      <Location />
    </main>
  );
}
