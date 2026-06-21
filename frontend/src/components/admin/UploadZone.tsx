'use client';

import React, { useRef, useState } from 'react';

interface UploadZoneProps {
  onFilesSelected: (files: FileList) => void;
  uploading: boolean;
}

export default function UploadZone({ onFilesSelected, uploading }: UploadZoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files.length > 0) {
      onFilesSelected(e.dataTransfer.files);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFilesSelected(e.target.files);
      // Reset so the same files can be selected again
      e.target.value = '';
    }
  };

  return (
    <div
      onClick={handleClick}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors duration-150 ${
        isDragOver
          ? 'border-ex-pink bg-ex-pink/5'
          : 'border-zinc-700 hover:border-ex-pink/50'
      } ${uploading ? 'opacity-50 pointer-events-none' : ''}`}
    >
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/jpeg,image/jpg,image/png,image/webp"
        className="hidden"
        onChange={handleFileChange}
      />

      {uploading ? (
        <div className="flex flex-col items-center gap-2">
          <div className="w-6 h-6 border-2 border-ex-pink border-t-transparent rounded-full animate-spin" />
          <span className="text-zinc-400 text-sm">Uploading...</span>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1"
            stroke="currentColor"
            className="w-8 h-8 text-zinc-500"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
          </svg>
          <span className="text-zinc-400 text-sm">
            Drop images here or <span className="text-ex-pink">browse</span>
          </span>
          <span className="text-zinc-600 text-xs">
            JPG, PNG, WebP — Max 50MB each
          </span>
        </div>
      )}
    </div>
  );
}
