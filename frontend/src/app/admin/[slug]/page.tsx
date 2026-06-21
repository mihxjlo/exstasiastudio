'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import UploadZone from '@/components/admin/UploadZone';
import MediaEditor from '@/components/admin/MediaEditor';
import { GalleryWithMedia } from '@/types';
import { getGallery, uploadMedia, autoArrange } from '@/lib/api';

export default function AdminGalleryEditorPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [gallery, setGallery] = useState<GalleryWithMedia | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [arranging, setArranging] = useState(false);

  const loadGallery = useCallback(async () => {
    try {
      const data = await getGallery(slug);
      setGallery(data);
    } catch (err) {
      console.error('Failed to load gallery:', err);
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    loadGallery();
  }, [loadGallery]);

  const handleFilesSelected = async (files: FileList) => {
    if (!gallery) return;
    setUploading(true);
    try {
      await uploadMedia(gallery.id, files);
      await loadGallery();
    } catch (err) {
      console.error('Upload failed:', err);
    } finally {
      setUploading(false);
    }
  };

  const handleAutoArrange = async () => {
    if (!gallery) return;
    setArranging(true);
    try {
      await autoArrange(gallery.id);
      await loadGallery();
    } catch (err) {
      console.error('Auto-arrange failed:', err);
    } finally {
      setArranging(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-ex-pink border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!gallery) {
    return (
      <div className="text-zinc-500 text-center py-12">
        Gallery not found.
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-ex-text text-xl font-medium">{gallery.title}</h1>
          <span className="text-zinc-500 text-xs">/{gallery.slug} — {gallery.media.length} images</span>
        </div>
        <button
          onClick={handleAutoArrange}
          disabled={arranging || gallery.media.length === 0}
          className="bg-zinc-800 text-ex-text text-xs uppercase tracking-wider px-4 py-2 rounded hover:bg-zinc-700 transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {arranging ? (
            <span className="flex items-center gap-2">
              <div className="w-3 h-3 border border-ex-pink border-t-transparent rounded-full animate-spin" />
              Arranging...
            </span>
          ) : (
            'Auto-Arrange'
          )}
        </button>
      </div>

      {/* Upload Zone */}
      <div className="mb-6">
        <UploadZone onFilesSelected={handleFilesSelected} uploading={uploading} />
      </div>

      {/* Media Editor with Drag & Drop */}
      <MediaEditor
        media={gallery.media}
        onMediaChange={loadGallery}
      />
    </div>
  );
}
