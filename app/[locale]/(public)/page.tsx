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
import { localizePageMetadata, generatePageMetadata, siteConfig } from '@/lib/seo/config';

const pageMetadata: Metadata = {
  ...generatePageMetadata(
    `${siteConfig.name} - Authentic Thai Cuisine in Phuket`,
    'Experience Southern Thai cuisine in the rainforest at Three Monkeys Restaurant Phuket. Choose your dining zone or a celebration package and reserve your table online.',
    '/',
  ),
  alternates: {
    canonical: siteConfig.url,
  },
};

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return localizePageMetadata(pageMetadata, locale);
}

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
