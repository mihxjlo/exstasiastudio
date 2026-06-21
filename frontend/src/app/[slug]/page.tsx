import { getGallery } from '@/lib/api';
import CategoryPageClient from '@/components/CategoryPageClient';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';

interface Props {
  params: {
    slug: string;
  };
}

export const revalidate = 0;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = params;
  const title = slug.charAt(0).toUpperCase() + slug.slice(1);
  return {
    title: `${title} | Exstasia Studio`,
    description: `Browse the ${title} photography collection by Anastasia Jorgusheska (Exstasia Studio).`,
  };
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = params;
  
  const allowedSlugs = ['portrait', 'editorial', 'campaign', 'events'];
  if (!allowedSlugs.includes(slug)) {
    notFound();
  }

  try {
    const gallery = await getGallery(slug);
    return <CategoryPageClient gallery={gallery} />;
  } catch (error) {
    console.error(`Failed to load gallery for slug: ${slug}`, error);
    notFound();
  }
}
