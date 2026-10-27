export interface BlogMedia {
  id: string;
  src: string;
  width: number;
  height: number;
  variants: { src: string; width: number }[];
  alt: string;
  caption: string;
  generated: boolean;
}
export interface PublicPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  tags: string[];
  featured_image: string;
  seo_title: string;
  seo_description: string;
  focus_keyword: string;
  image_manifest: BlogMedia[];
}
