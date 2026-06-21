'use client';

import React, { useState } from 'react';
import { GalleryWithMedia, Media } from '@/types';
import Lightbox from '@/components/Lightbox';

interface CategoryPageClientProps {
  gallery: GalleryWithMedia;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export default function CategoryPageClient({ gallery }: CategoryPageClientProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  // Group media array into rows by rowGroup
  const rows = gallery.media.reduce((acc, item) => {
    if (!acc[item.rowGroup]) acc[item.rowGroup] = [];
    acc[item.rowGroup].push(item);
    return acc;
  }, {} as Record<number, Media[]>);

  // Sort rows by rowGroup
  const sortedRows = Object.values(rows).sort(
    (a, b) => Math.min(...a.map(i => i.rowGroup)) - Math.min(...b.map(i => i.rowGroup))
  );

  // Flattened media list for Lightbox navigation
  const flattenedMedia = sortedRows.flat();

  // Find index in flattened media
  const handleImageClick = (image: Media) => {
    const idx = flattenedMedia.findIndex((m) => m.id === image.id);
    if (idx !== -1) {
      setLightboxIndex(idx);
    }
  };

  return (
    <div className="category-page min-h-screen pt-[80px] pb-12 px-4 md:px-6 bg-ex-bg text-ex-text select-none">
      <h2 className="text-xs uppercase tracking-[0.25em] font-semibold text-ex-pink mb-8">
        {gallery.title}
      </h2>

      {/* Rows Container */}
      <div className="flex flex-col gap-[8px] w-full">
        {sortedRows.map((row, rowIdx) => (
          <div key={rowIdx} className="flex gap-[4px] w-full items-start">
            {row.map((image) => {
              const imageUrl = `${API_BASE_URL}/api/files/${image.filePath}`;
              return (
                <div
                  key={image.id}
                  style={{
                    flexGrow: image.widthPx / image.heightPx,
                    flexShrink: 0,
                    flexBasis: 0,
                    aspectRatio: `${image.widthPx} / ${image.heightPx}`,
                  }}
                  className="overflow-hidden cursor-pointer min-w-0"
                  onClick={() => handleImageClick(image)}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={imageUrl}
                    alt={image.originalFilename || "portfolio image"}
                    className="w-full h-full object-contain hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <Lightbox
          images={flattenedMedia}
          initialIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      )}
    </div>
  );
}
