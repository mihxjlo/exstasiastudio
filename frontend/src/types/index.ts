export interface Gallery {
  id: number;
  title: string;
  slug: string;
  coverImagePath: string | null;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface Media {
  id: number;
  galleryId: number;
  filePath: string;
  originalFilename: string;
  mimeType: string;
  fileSizeBytes: number;
  widthPx: number;
  heightPx: number;
  orientation: 'PORTRAIT' | 'LANDSCAPE';
  rowGroup: number;
  displayOrder: number;
  createdAt: string;
}

export interface GalleryWithMedia extends Gallery {
  media: Media[];
}

export interface LayoutUpdate {
  id: number;
  rowGroup: number;
  displayOrder: number;
}

export interface LoginResponse {
  token: string;
  expiresIn: number;
}

export interface HeroImage {
  filePath: string | null;
}
