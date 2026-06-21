'use client';

import React, { useEffect, useState, useRef } from 'react';
import { getHero, uploadHero } from '@/lib/api';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export default function AdminHeroPage() {
  const [filePath, setFilePath] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    getHero()
      .then((h) => setFilePath(h.filePath))
      .catch(() => setError('Failed to load current hero image.'))
      .finally(() => setLoading(false));
  }, []);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const result = await uploadHero(file);
      setFilePath(result.filePath);
    } catch {
      setError('Upload failed. Please try again.');
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-ex-pink border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-ex-text text-xl font-medium">Hero Image</h1>
        <p className="text-zinc-500 text-xs mt-1">
          This image appears full-screen on the homepage. Uploading a new one replaces the current one.
        </p>
      </div>

      {/* Current preview */}
      <div className="mb-6">
        <span className="text-zinc-400 text-xs uppercase tracking-wider block mb-2">Current</span>
        <div className="w-full max-w-lg aspect-video bg-zinc-900 rounded-lg overflow-hidden border border-zinc-800">
          {filePath ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={`${API_BASE_URL}/api/files/${filePath}`}
              alt="Current hero"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-zinc-600 text-xs">
              No hero image set
            </div>
          )}
        </div>
      </div>

      {/* Upload control */}
      <div>
        <span className="text-zinc-400 text-xs uppercase tracking-wider block mb-2">Replace</span>
        <label
          className={`inline-flex items-center gap-2 cursor-pointer bg-zinc-800 hover:bg-zinc-700 text-ex-text text-xs uppercase tracking-wider px-4 py-2 rounded transition-colors duration-150 ${
            uploading ? 'opacity-50 pointer-events-none' : ''
          }`}
        >
          {uploading ? (
            <>
              <div className="w-3 h-3 border border-ex-pink border-t-transparent rounded-full animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
              </svg>
              Upload Image
            </>
          )}
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="sr-only"
            onChange={handleFileChange}
            disabled={uploading}
          />
        </label>

        {error && <p className="text-red-400 text-xs mt-3">{error}</p>}
      </div>
    </div>
  );
}
