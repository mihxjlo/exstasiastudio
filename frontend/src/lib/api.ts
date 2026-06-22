import { getAuthToken } from './auth';
import { Gallery, GalleryWithMedia, Media, LayoutUpdate, LoginResponse, HeroImage } from '../types';

const API_BASE_URL = typeof window === 'undefined'
  ? (process.env.INTERNAL_API_URL || 'http://localhost:8080')
  : (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080');

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  
  const headers = new Headers(options.headers);
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  
  const config = {
    ...options,
    headers,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

  if (!response.ok) {
    let errorMessage = `HTTP error! status: ${response.status}`;
    try {
      const errorData = await response.json();
      errorMessage = errorData.error || errorData.message || errorMessage;
    } catch {
      // Ignore body parse errors
    }
    throw new Error(errorMessage);
  }

  if (response.status === 204) {
    return {} as T;
  }

  const text = await response.text();
  if (!text) {
    return {} as T;
  }
  return JSON.parse(text) as T;
}

export function getGalleries(): Promise<Gallery[]> {
  return request<Gallery[]>('/api/galleries', { method: 'GET', cache: 'no-store' });
}

export function getGallery(slug: string): Promise<GalleryWithMedia> {
  return request<GalleryWithMedia>(`/api/galleries/${slug}`, { method: 'GET', cache: 'no-store' });
}

export function getGalleryMedia(galleryId: number): Promise<Media[]> {
  return request<Media[]>(`/api/galleries/${galleryId}/media`, { method: 'GET', cache: 'no-store' });
}

export function uploadMedia(galleryId: number, files: FileList | File[]): Promise<Media[]> {
  const formData = new FormData();
  for (let i = 0; i < files.length; i++) {
    formData.append('files', files[i]);
  }
  
  return request<Media[]>(`/api/galleries/${galleryId}/media`, {
    method: 'POST',
    body: formData,
  });
}

export function deleteMedia(mediaId: number): Promise<void> {
  return request<void>(`/api/media/${mediaId}`, { method: 'DELETE' });
}

export function updateMediaLayout(updates: LayoutUpdate[]): Promise<void> {
  return request<void>('/api/media/layout', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ updates }),
  });
}

export function autoArrange(galleryId: number): Promise<void> {
  return request<void>(`/api/galleries/${galleryId}/media/auto-arrange`, { method: 'PUT' });
}

export function updateGalleryCover(galleryId: number, filePath: string): Promise<Gallery> {
  return request<Gallery>(`/api/galleries/${galleryId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ coverImagePath: filePath }),
  });
}

export function getHero(): Promise<HeroImage> {
  return request<HeroImage>('/api/hero', { method: 'GET', cache: 'no-store' });
}

export function uploadHero(file: File): Promise<HeroImage> {
  const formData = new FormData();
  formData.append('file', file);
  return request<HeroImage>('/api/hero', { method: 'POST', body: formData });
}

export async function login(email: string, password: string): Promise<LoginResponse> {
  return request<LoginResponse>('/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });
}
