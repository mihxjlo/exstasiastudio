# API Contract

Base URL: `http://localhost:8080` (local) / `https://api.yourdomain.com` (prod)  
All endpoints prefixed with `/api`  
Protected endpoints require: `Authorization: Bearer <token>`

---

## Auth

| Method | Endpoint | Auth | Request body | Response |
|--------|----------|------|-------------|----------|
| POST | `/api/auth/login` | Public | `{ email, password }` | `{ token, expiresIn }` |

---

## Galleries

| Method | Endpoint | Auth | Description | Response |
|--------|----------|------|-------------|----------|
| GET | `/api/galleries` | Public | List all four galleries | `Gallery[]` |
| GET | `/api/galleries/{slug}` | Public | Get gallery + all media sorted for rendering | `Gallery & { media: Media[] }` |
| PUT | `/api/galleries/{id}` | JWT | Update cover image path | `Gallery` |

**Note:** Galleries are fixed — `portrait`, `editorial`, `campaign`, `events`. They are seeded on startup. No POST or DELETE exists for galleries.

---

## Media

| Method | Endpoint | Auth | Description | Response |
|--------|----------|------|-------------|----------|
| GET | `/api/galleries/{id}/media` | Public | All media sorted by `row_group` ASC, `display_order` ASC | `Media[]` |
| POST | `/api/galleries/{id}/media` | JWT | Upload image file(s) — detects orientation, auto-assigns row_group | `Media[]` |
| DELETE | `/api/media/{id}` | JWT | Delete media record + file from volume | `204 No Content` |
| PUT | `/api/media/{id}` | JWT | Update `row_group` and `display_order` for one item | `Media` |
| PUT | `/api/media/layout` | JWT | Batch update layout for multiple items | `200 OK` |
| PUT | `/api/galleries/{id}/media/auto-arrange` | JWT | Re-run auto-arrange for entire gallery | `200 OK` |

---

## Hero Image

| Method | Endpoint | Auth | Description | Response |
|--------|----------|------|-------------|----------|
| GET | `/api/hero` | Public | Get current homepage hero image path | `{ filePath: string \| null }` |
| POST | `/api/hero` | JWT | Upload new hero image (multipart `file`); replaces existing + deletes old file | `{ filePath: string }` |

The hero image is **independent of gallery media**. `gallery.coverImagePath` is used only for admin card thumbnails, not the homepage.

---

## Files

| Method | Endpoint | Auth | Description | Response |
|--------|----------|------|-------------|----------|
| GET | `/api/files/{filename}` | Public | Stream image file from uploads volume | File stream |

---

## DTO shapes

### LoginRequest
```json
{ "email": "string", "password": "string" }
```

### LoginResponse
```json
{ "token": "string", "expiresIn": 86400000 }
```

### Gallery
```json
{
  "id": 1,
  "title": "Portrait",
  "slug": "portrait",
  "coverImagePath": "string | null",
  "displayOrder": 0,
  "createdAt": "ISO string",
  "updatedAt": "ISO string"
}
```

### Media
```json
{
  "id": 1,
  "galleryId": 1,
  "filePath": "string",
  "originalFilename": "string",
  "mimeType": "image/jpeg",
  "fileSizeBytes": 204800,
  "widthPx": 1200,
  "heightPx": 1600,
  "orientation": "PORTRAIT | LANDSCAPE",
  "rowGroup": 0,
  "displayOrder": 0,
  "createdAt": "ISO string"
}
```

### HeroImage
```json
{ "filePath": "string | null" }
```

### LayoutUpdateRequest (batch)
```json
{
  "updates": [
    { "id": 1, "rowGroup": 0, "displayOrder": 0 },
    { "id": 2, "rowGroup": 0, "displayOrder": 1 }
  ]
}
```

---

## Frontend API client (`lib/api.ts`) — implemented functions

```ts
getGalleries(): Promise<Gallery[]>
getGallery(slug: string): Promise<GalleryWithMedia>
getGalleryMedia(galleryId: number): Promise<Media[]>
uploadMedia(galleryId: number, files: FileList | File[]): Promise<Media[]>
deleteMedia(mediaId: number): Promise<void>
updateMediaLayout(updates: LayoutUpdate[]): Promise<void>
autoArrange(galleryId: number): Promise<void>
updateGalleryCover(galleryId: number, filePath: string): Promise<Gallery>
getHero(): Promise<HeroImage>
uploadHero(file: File): Promise<HeroImage>
login(email: string, password: string): Promise<LoginResponse>
```

All functions throw on non-2xx responses. `Authorization` header is added automatically when JWT is in localStorage. The internal `request()` helper uses `response.text()` + conditional `JSON.parse` — never `response.json()` directly — because `PUT /api/media/layout` and `PUT /api/galleries/{id}/media/auto-arrange` return `200 OK` with an empty body.
