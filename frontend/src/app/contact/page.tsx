import Link from 'next/link';
import Image from 'next/image';
import { getHero } from '@/lib/api';
import { Metadata } from 'next';

const FALLBACK_HERO = 'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?q=80&w=2070';
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export const metadata: Metadata = {
  title: 'Contact | Exstasia Studio',
  description: 'Get in touch with Anastasia Jorgusheska (Exstasia Studio) for portrait, editorial, campaign, and event photography inquiries.',
};

export const revalidate = 0;

export default async function ContactPage() {
  let heroImage = FALLBACK_HERO;

  try {
    const hero = await getHero();
    if (hero.filePath) {
      heroImage = `${API_BASE_URL}/api/files/${hero.filePath}`;
    }
  } catch (error) {
    console.error('Failed to load hero image for contact background, using fallback', error);
  }

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center bg-ex-bg select-none px-4 overflow-hidden">
      {/* Background image for mobile only */}
      <div className="absolute inset-0 block md:hidden z-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={heroImage}
          alt="Background"
          className="w-full h-full object-cover opacity-20"
        />
        <div className="absolute inset-0 bg-black bg-opacity-60" />
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center gap-6 md:gap-8 max-w-md w-full">
        <Link href="/">
          <Image
            src="/logo.png"
            alt="Exstasia Studio"
            width={80}
            height={80}
            className="object-contain hover:opacity-80 transition-opacity duration-150"
          />
        </Link>

        <div className="flex flex-col items-center gap-3">
          <span className="uppercase tracking-[0.25em] text-[10px] font-semibold text-ex-blue">
            for inquiries
          </span>
          
          <a
            href="mailto:anastasiajorgusheska@gmail.com"
            className="text-ex-text text-sm md:text-base font-light tracking-wide hover:text-ex-pink transition-colors duration-150 border-b border-zinc-800 pb-1"
          >
            anastasiajorgusheska@gmail.com
          </a>
        </div>

        <a
          href="https://instagram.com/byexstasia"
          target="_blank"
          rel="noopener noreferrer"
          className="text-ex-text hover:text-ex-pink transition-colors duration-150 p-2"
          aria-label="Instagram Profile"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            viewBox="0 0 24 24"
            className="w-6 h-6 md:w-7 md:h-7"
          >
            <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
            <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37zM17.5 6.5h.01" />
          </svg>
        </a>
      </div>
    </div>
  );
}
