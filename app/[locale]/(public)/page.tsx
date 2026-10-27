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
      <LatestArticles />
      <Testimonials />
      <SafetyCertifications />
      <CTABanner />
      <Location />
    </main>
  );
}
