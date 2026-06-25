import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { siteConfig } from '@/lib/seo/config';
import { getPackageBySlug } from '@/lib/data/packages';
import { ProductSchema, BreadcrumbSchema } from '@/lib/seo/structured-data';

interface Props {
  params: Promise<{ slug: string; locale: string }>;
  children: React.ReactNode;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, locale } = await params;
  const pkg = getPackageBySlug(slug);

  if (!pkg) {
    return {
      title: 'Package Not Found',
    };
  }

  const localePath = locale === 'en' ? '' : `/${locale}`;
  const url = `${siteConfig.url}${localePath}/packages/${slug}`;
  const image = pkg.image?.startsWith('http') ? pkg.image : `${siteConfig.url}${pkg.image}`;

  const priceText = pkg.priceType === 'per-person' 
    ? `฿${pkg.price.toLocaleString()} per person`
    : `฿${pkg.price.toLocaleString()} per table`;

  return {
    title: `${pkg.name} - ${priceText}`,
    description: pkg.description.length > 160 
      ? `${pkg.description.substring(0, 157)}...` 
      : pkg.description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      type: 'website',
      title: `${pkg.name} | Three Monkeys Restaurant`,
      description: pkg.shortDescription || pkg.description,
      url,
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: pkg.name,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${pkg.name} | Three Monkeys Restaurant`,
      description: pkg.shortDescription || pkg.description,
      images: [image],
    },
  };
}

export default async function PackageLayout({ params, children }: Props) {
  const { slug } = await params;
  const pkg = getPackageBySlug(slug);

  if (!pkg) {
    notFound();
  }

  const url = `${siteConfig.url}/packages/${slug}`;
  const image = pkg.image?.startsWith('http') ? pkg.image : `${siteConfig.url}${pkg.image}`;

  return (
    <>
      <ProductSchema
        product={{
          name: pkg.name,
          description: pkg.description,
          price: pkg.price,
          currency: 'THB',
          image,
          url,
        }}
      />
      <BreadcrumbSchema
        items={[
          { name: 'Home', url: siteConfig.url },
          { name: 'Packages', url: `${siteConfig.url}/packages` },
          { name: pkg.name, url },
        ]}
      />
      {children}
    </>
  );
}
