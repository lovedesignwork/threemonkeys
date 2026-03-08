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
    <main className="min-h-screen bg-[#0f0f0f]">
      <HeroSlideshow />
      <SpecialPackages />
      <FeaturedPackages />
      <WhyChooseUs />
      <MenuShowcase />
      <PhotoGallery />
      <Testimonials />
      <SafetyCertifications />
      <CTABanner />
      <Location />
    </main>
  );
}
