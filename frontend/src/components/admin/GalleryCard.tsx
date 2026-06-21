'use client';

import { Gallery } from '@/types';
import Link from 'next/link';

interface GalleryCardProps {
  gallery: Gallery;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export default function GalleryCard({ gallery }: GalleryCardProps) {
  const coverUrl = gallery.coverImagePath
    ? `${API_BASE_URL}/api/files/${gallery.coverImagePath}`
    : null;

  return (
    <Link href={`/admin/${gallery.slug}`} className="block group">
      <div className="bg-zinc-900 rounded-lg overflow-hidden transition-all duration-200 hover:ring-1 hover:ring-ex-pink/30">
        {/* Cover Image */}
        <div className="aspect-[4/3] bg-zinc-800 relative overflow-hidden">
          {coverUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={coverUrl}
              alt={`${gallery.title} cover`}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-zinc-600">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1"
                stroke="currentColor"
                className="w-12 h-12"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0 0 22.5 18.75V5.25A2.25 2.25 0 0 0 20.25 3H3.75A2.25 2.25 0 0 0 1.5 5.25v13.5A2.25 2.25 0 0 0 3.75 21Z" />
              </svg>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 flex items-center justify-between">
          <span className="text-ex-text text-sm font-medium">{gallery.title}</span>
          <span className="text-zinc-500 text-xs">/{gallery.slug}</span>
        </div>
      </div>
    </Link>
  );
}
