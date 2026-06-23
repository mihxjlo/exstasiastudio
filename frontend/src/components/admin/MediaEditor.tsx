'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Media, LayoutUpdate } from '@/types';
import { deleteMedia, updateMediaLayout } from '@/lib/api';

interface MediaEditorProps {
  media: Media[];
  onMediaChange: () => void;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

// Group a flat media list into ordered rows (by rowGroup, then displayOrder).
function toRows(mediaList: Media[]): Media[][] {
  const map = new Map<number, Media[]>();
  for (const m of mediaList) {
    if (!map.has(m.rowGroup)) map.set(m.rowGroup, []);
    map.get(m.rowGroup)!.push(m);
  }
  return Array.from(map.keys())
    .sort((a, b) => a - b)
    .map((k) => map.get(k)!.slice().sort((a, b) => a.displayOrder - b.displayOrder));
}

export default function MediaEditor({ media, onMediaChange }: MediaEditorProps) {
  const [deleting, setDeleting] = useState<number | null>(null);
  const [localMedia, setLocalMedia] = useState<Media[]>(media);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  // Keep local order in sync when the parent refetches (upload, delete, auto-arrange)
  useEffect(() => {
    setLocalMedia(media);
  }, [media]);

  const rows = toRows(localMedia);

  // Locate the currently selected image so we can enable/disable the move controls
  let selPos: { r: number; c: number; rowLen: number; numRows: number } | null = null;
  if (selectedId !== null) {
    for (let r = 0; r < rows.length; r++) {
      const c = rows[r].findIndex((m) => m.id === selectedId);
      if (c !== -1) {
        selPos = { r, c, rowLen: rows[r].length, numRows: rows.length };
        break;
      }
    }
  }

  // Persist a freshly reordered row structure: renumber, flatten, optimistic update, save.
  const commitRows = useCallback((nextRows: Media[][]) => {
    const cleaned = nextRows.filter((r) => r.length > 0);
    const newMedia: Media[] = [];
    const updates: LayoutUpdate[] = [];
    cleaned.forEach((rowItems, r) => {
      rowItems.forEach((m, c) => {
        newMedia.push({ ...m, rowGroup: r, displayOrder: c });
        updates.push({ id: m.id, rowGroup: r, displayOrder: c });
      });
    });

    setLocalMedia(newMedia);
    updateMediaLayout(updates).catch((err) => {
      console.error('Failed to update layout:', err);
      onMediaChange();
    });
  }, [onMediaChange]);

  const move = useCallback((direction: 'left' | 'right' | 'up' | 'down') => {
    if (selectedId === null) return;
    const next = toRows(localMedia);

    let rowIndex = -1;
    let colIndex = -1;
    for (let r = 0; r < next.length; r++) {
      const c = next[r].findIndex((m) => m.id === selectedId);
      if (c !== -1) {
        rowIndex = r;
        colIndex = c;
        break;
      }
    }
    if (rowIndex === -1) return;

    const item = next[rowIndex][colIndex];

    if (direction === 'left') {
      if (colIndex === 0) return;
      [next[rowIndex][colIndex - 1], next[rowIndex][colIndex]] =
        [next[rowIndex][colIndex], next[rowIndex][colIndex - 1]];
    } else if (direction === 'right') {
      if (colIndex === next[rowIndex].length - 1) return;
      [next[rowIndex][colIndex + 1], next[rowIndex][colIndex]] =
        [next[rowIndex][colIndex], next[rowIndex][colIndex + 1]];
    } else if (direction === 'up') {
      if (rowIndex === 0 && next[rowIndex].length === 1) return;
      next[rowIndex].splice(colIndex, 1);
      if (rowIndex === 0) next.unshift([item]);
      else next[rowIndex - 1].push(item);
    } else if (direction === 'down') {
      if (rowIndex === next.length - 1 && next[rowIndex].length === 1) return;
      next[rowIndex].splice(colIndex, 1);
      if (rowIndex === next.length - 1) next.push([item]);
      else next[rowIndex + 1].push(item);
    }

    commitRows(next);
  }, [selectedId, localMedia, commitRows]);

  const handleDelete = useCallback(async (mediaId: number) => {
    if (!window.confirm('Delete this image? This cannot be undone.')) return;
    setDeleting(mediaId);
    try {
      await deleteMedia(mediaId);
      setSelectedId((cur) => (cur === mediaId ? null : cur));
      onMediaChange();
    } catch (err) {
      console.error('Failed to delete media:', err);
    } finally {
      setDeleting(null);
    }
  }, [onMediaChange]);

  if (media.length === 0) {
    return (
      <div className="text-center text-zinc-500 py-12">
        <p className="text-sm">No images uploaded yet.</p>
        <p className="text-xs mt-1">Use the upload zone above to add images.</p>
      </div>
    );
  }

  const ctrlBtn =
    'px-3 py-2 rounded text-xs uppercase tracking-wider bg-zinc-800 text-ex-text ' +
    'hover:bg-zinc-700 transition-colors duration-150 disabled:opacity-30 disabled:cursor-not-allowed';

  return (
    <div>
      {/* Reorder toolbar */}
      <div className="flex flex-wrap items-center gap-2 mb-4 p-2 bg-zinc-900 rounded-lg border border-zinc-800 sticky top-0 z-10">
        {selectedId === null ? (
          <span className="text-zinc-500 text-xs px-1">
            Tap an image to select it, then move it with these controls.
          </span>
        ) : (
          <>
            <span className="text-zinc-400 text-xs px-1">Move:</span>
            <button type="button" className={ctrlBtn} onClick={() => move('left')} disabled={!selPos || selPos.c === 0}>
              ◀ Left
            </button>
            <button type="button" className={ctrlBtn} onClick={() => move('right')} disabled={!selPos || selPos.c === selPos.rowLen - 1}>
              Right ▶
            </button>
            <button type="button" className={ctrlBtn} onClick={() => move('up')} disabled={!selPos || (selPos.r === 0 && selPos.rowLen === 1)}>
              ▲ Up a row
            </button>
            <button type="button" className={ctrlBtn} onClick={() => move('down')} disabled={!selPos || (selPos.r === selPos.numRows - 1 && selPos.rowLen === 1)}>
              ▼ Down a row
            </button>
            <button type="button" className={`${ctrlBtn} ml-auto`} onClick={() => setSelectedId(null)}>
              Done
            </button>
          </>
        )}
      </div>

      {/* Rows */}
      <div className="flex flex-col gap-2">
        {rows.map((rowItems, rowIndex) => (
          <div key={rowIndex} className="flex items-stretch gap-1 mb-2">
            <span className="text-zinc-600 text-[10px] uppercase tracking-wider self-start mt-3 select-none flex-shrink-0 w-6">
              R{rowIndex}
            </span>
            <div className="flex gap-2 p-2 border border-zinc-800 rounded-lg min-h-[100px] flex-1">
              {rowItems.map((item) => (
                <div
                  key={item.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => setSelectedId((cur) => (cur === item.id ? null : item.id))}
                  style={{ height: 96, width: Math.round(96 * item.widthPx / item.heightPx) }}
                  className={`rounded overflow-hidden relative flex-shrink-0 cursor-pointer transition-shadow duration-150 ${
                    selectedId === item.id ? 'ring-2 ring-ex-pink shadow-lg' : 'ring-1 ring-transparent hover:ring-zinc-600'
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`${API_BASE_URL}/api/files/${item.filePath}`}
                    alt={item.originalFilename}
                    className="w-full h-full object-contain pointer-events-none"
                    draggable={false}
                  />
                  {/* Orientation badge */}
                  <span className="absolute bottom-1 left-1 bg-black/70 text-[8px] text-zinc-300 px-1 py-0.5 rounded pointer-events-none">
                    {item.orientation === 'PORTRAIT' ? 'P' : 'L'}
                  </span>
                  {/* Delete button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(item.id);
                    }}
                    disabled={deleting === item.id}
                    className="absolute top-1 right-1 bg-black bg-opacity-70 rounded p-1 text-white hover:text-red-400 transition-colors duration-150"
                    aria-label={`Delete ${item.originalFilename}`}
                  >
                    {deleting === item.id ? (
                      <div className="w-3 h-3 border border-red-400 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth="1.5"
                        stroke="currentColor"
                        className="w-3 h-3"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                      </svg>
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
