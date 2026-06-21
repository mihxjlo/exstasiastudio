import { getHero } from '@/lib/api';

const FALLBACK_HERO = 'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?q=80&w=2070';
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export const revalidate = 0;

export default async function Home() {
  let heroImage = FALLBACK_HERO;

  try {
    const hero = await getHero();
    if (hero.filePath) {
      heroImage = `${API_BASE_URL}/api/files/${hero.filePath}`;
    }
  } catch (error) {
    console.error('Failed to load hero image, using fallback', error);
  }

  return (
    <div className="homepage w-screen h-screen overflow-hidden relative bg-black select-none">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={heroImage}
        alt="Exstasia Studio Hero"
        className="object-cover w-full h-full absolute inset-0"
      />
      <div className="absolute inset-0 bg-black bg-opacity-20" />
      
      <h1 className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-ex-text text-lg tracking-[0.15em] lowercase font-light whitespace-nowrap">
        exstasia studio
      </h1>
    </div>
  );
}
