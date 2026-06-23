'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Media, LayoutUpdate } from '@/types';
import { deleteMedia, updateMediaLayout } from '@/lib/api';

interface MediaEditorProps {
  media: Media[];
  onMediaChange: () => void;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export default function MediaEditor({ media, onMediaChange }: MediaEditorProps) {
  const [deleting, setDeleting] = useState<number | null>(null);
  const [localMedia, setLocalMedia] = useState<Media[]>(media);

  // Keep local order in sync when the parent refetches (upload, delete, auto-arrange)
  useEffect(() => {
    setLocalMedia(media);
  }, [media]);

  // Group media into rows by rowGroup
  const rows = localMedia.reduce((acc, item) => {
    if (!acc[item.rowGroup]) acc[item.rowGroup] = [];
    acc[item.rowGroup].push(item);
    return acc;
  }, {} as Record<number, Media[]>);

  const sortedRowKeys = Object.keys(rows)
    .map(Number)
    .sort((a, b) => a - b);

  const handleDelete = useCallback(async (mediaId: number) => {
    if (!window.confirm('Delete this image? This cannot be undone.')) return;
    setDeleting(mediaId);
    try {
      await deleteMedia(mediaId);
      onMediaChange();
    } catch (err) {
      console.error('Failed to delete media:', err);
    } finally {
      setDeleting(null);
    }
  }, [onMediaChange]);

  const handleDragEnd = useCallback((result: DropResult) => {
    if (!result.destination) return;

    const sourceRowKey = parseInt(result.source.droppableId, 10);
    const destRowKey = parseInt(result.destination.droppableId, 10);
    const sourceIndex = result.source.index;
    const destIndex = result.destination.index;

    // No-op if dropped in the same spot
    if (sourceRowKey === destRowKey && sourceIndex === destIndex) return;

    // Deep copy current rows
    const newRows: Record<number, Media[]> = {};
    for (const key of Object.keys(rows)) {
      newRows[parseInt(key, 10)] = [...rows[parseInt(key, 10)]];
    }

    // Remove from source
    const [movedItem] = newRows[sourceRowKey].splice(sourceIndex, 1);

    // Ensure destination row exists
    if (!newRows[destRowKey]) {
      newRows[destRowKey] = [];
    }

    // Insert at destination
    newRows[destRowKey].splice(destIndex, 0, movedItem);

    // Flatten back into a media array, stamping new rowGroup + displayOrder
    const updates: LayoutUpdate[] = [];
    const newMedia: Media[] = [];
    const orderedKeys = Object.keys(newRows).map(Number).sort((a, b) => a - b);
    for (const rowKey of orderedKeys) {
      newRows[rowKey].forEach((item, idx) => {
        newMedia.push({ ...item, rowGroup: rowKey, displayOrder: idx });
        updates.push({ id: item.id, rowGroup: rowKey, displayOrder: idx });
      });
    }

    // Optimistic update — reflect the move immediately, no waiting on the network
    setLocalMedia(newMedia);

    // Persist in the background; on failure, refetch the authoritative order
    updateMediaLayout(updates).catch((err) => {
      console.error('Failed to update layout:', err);
      onMediaChange();
    });
  }, [rows, onMediaChange]);

  if (media.length === 0) {
    return (
      <div className="text-center text-zinc-500 py-12">
        <p className="text-sm">No images uploaded yet.</p>
        <p className="text-xs mt-1">Use the upload zone above to add images.</p>
      </div>
    );
  }

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="flex flex-col gap-2">
        {sortedRowKeys.map((rowKey) => (
          <div key={rowKey} className="flex items-stretch gap-1 mb-2">
            <span className="text-zinc-600 text-[10px] uppercase tracking-wider self-start mt-3 select-none flex-shrink-0 w-6">
              R{rowKey}
            </span>
            <Droppable droppableId={String(rowKey)} direction="horizontal">
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`flex gap-2 p-2 border rounded-lg min-h-[100px] flex-1 transition-colors duration-150 ${
                    snapshot.isDraggingOver ? 'border-ex-pink bg-ex-pink/5' : 'border-zinc-800'
                  }`}
                >
                {rows[rowKey].map((item, index) => (
                  <Draggable key={item.id} draggableId={String(item.id)} index={index}>
                    {(dragProvided, dragSnapshot) => (
                      <div
                        ref={dragProvided.innerRef}
                        {...dragProvided.draggableProps}
                        {...dragProvided.dragHandleProps}
                        style={{ height: 96, width: Math.round(96 * item.widthPx / item.heightPx) }}
                        className={`rounded overflow-hidden relative flex-shrink-0 ${
                          dragSnapshot.isDragging ? 'ring-2 ring-ex-pink shadow-lg' : ''
                        }`}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={`${API_BASE_URL}/api/files/${item.filePath}`}
                          alt={item.originalFilename}
                          className="w-full h-full object-contain"
                          draggable={false}
                        />
                        {/* Orientation badge */}
                        <span className="absolute bottom-1 left-1 bg-black/70 text-[8px] text-zinc-300 px-1 py-0.5 rounded">
                          {item.orientation === 'PORTRAIT' ? 'P' : 'L'}
                        </span>
                        {/* Delete button */}
                        <button
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
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
                </div>
              )}
            </Droppable>
          </div>
        ))}
      </div>
    </DragDropContext>
  );
}
