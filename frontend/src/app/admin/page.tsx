'use client';

import React, { useEffect, useState, useCallback } from 'react';
import GalleryCard from '@/components/admin/GalleryCard';
import { Gallery } from '@/types';
import { getGalleries } from '@/lib/api';

export default function AdminDashboardPage() {
  const [galleries, setGalleries] = useState<Gallery[]>([]);
  const [loading, setLoading] = useState(true);

  const loadGalleries = useCallback(async () => {
    try {
      const data = await getGalleries();
      setGalleries(data);
    } catch (err) {
      console.error('Failed to load galleries:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadGalleries();
  }, [loadGalleries]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-ex-pink border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-ex-text text-xl font-medium mb-6">Galleries</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {galleries.map((gallery) => (
          <GalleryCard key={gallery.id} gallery={gallery} />
        ))}
      </div>
    </div>
  );
}
