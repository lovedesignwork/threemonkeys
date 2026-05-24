import { Metadata } from 'next';
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
import { generatePageMetadata, siteConfig } from '@/lib/seo/config';

export const metadata: Metadata = {
  ...generatePageMetadata(
    `${siteConfig.name} - Authentic Thai Cuisine in Phuket`,
    'Experience authentic Southern Thai cuisine at Three Monkeys Restaurant Phuket. Enjoy exquisite dining in our beautiful garden setting with tasting menus, cooking classes, and private dining experiences. Book your table today!',
    '/',
  ),
  alternates: {
    canonical: siteConfig.url,
  },
};

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
      <Testimonials />
      <SafetyCertifications />
      <CTABanner />
      <Location />
    </main>
  );
}
