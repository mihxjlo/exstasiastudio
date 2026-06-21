# Database Schema

PostgreSQL 15. **Four tables.** Schema auto-created by Hibernate (`ddl-auto=update`) on first run.  
On first backend startup, `DataInitializer` seeds the four galleries and the admin user.

---

## admin_users

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | BIGSERIAL | PK, NOT NULL | Auto-increment |
| email | VARCHAR(255) | UNIQUE, NOT NULL | Admin login email |
| hashed_password | VARCHAR(255) | NOT NULL | BCrypt hashed |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | |

**JPA entity:** `AdminUser`  
**Repository:** `AdminUserRepository` — needs `findByEmail(String email)`

---

## galleries

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | BIGSERIAL | PK, NOT NULL | |
| title | VARCHAR(255) | NOT NULL | Display name e.g. "Portrait" |
| slug | VARCHAR(50) | UNIQUE, NOT NULL | URL slug: portrait / editorial / campaign / events |
| cover_image_path | VARCHAR(500) | NULLABLE | Relative path to cover image file |
| display_order | INTEGER | DEFAULT 0 | Nav ordering |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | |
| updated_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Updated on cover change |

**JPA entity:** `Gallery`  
**Repository:** `GalleryRepository` — needs `findBySlug(String slug)`, `findAllByOrderByDisplayOrderAsc()`

**Seed data (inserted by DataInitializer on startup):**
```
{ title: "Portrait",   slug: "portrait",   display_order: 0 }
{ title: "Editorial",  slug: "editorial",  display_order: 1 }
{ title: "Campaign",   slug: "campaign",   display_order: 2 }
{ title: "Events",     slug: "events",     display_order: 3 }
```

---

## media

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | BIGSERIAL | PK, NOT NULL | |
| gallery_id | BIGINT | FK → galleries.id, NOT NULL | Cascade delete |
| file_path | VARCHAR(500) | NOT NULL | Relative path on uploads volume |
| original_filename | VARCHAR(255) | NOT NULL | Original name at upload |
| mime_type | VARCHAR(100) | NOT NULL | e.g. image/jpeg, image/webp |
| file_size_bytes | BIGINT | NOT NULL | |
| width_px | INTEGER | NOT NULL | Detected on upload via ImageIO |
| height_px | INTEGER | NOT NULL | Detected on upload via ImageIO |
| orientation | VARCHAR(10) | NOT NULL | PORTRAIT or LANDSCAPE — derived, never changes |
| row_group | INTEGER | NOT NULL, DEFAULT 0 | Groups images into the same display row |
| display_order | INTEGER | NOT NULL, DEFAULT 0 | Left-to-right order within a row_group |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | |

**JPA entity:** `Media`  
**Repository:** `MediaRepository` — needs:
- `findByGalleryIdOrderByRowGroupAscDisplayOrderAsc(Long galleryId)`
- `findByGalleryId(Long galleryId)`
- `deleteById(Long id)`

**Orientation rule:**
- `width > height` → LANDSCAPE
- `height >= width` → PORTRAIT

**Auto-arrange algorithm (LayoutService):**
1. Fetch all media for the gallery ordered by `created_at`
2. Separate into LANDSCAPE list and PORTRAIT list
3. LANDSCAPE: each gets its own unique `row_group` (incrementing integer)
4. PORTRAIT: pair consecutive portraits into groups of 2, each pair shares a `row_group`
5. Interleave rows by `created_at` to preserve rough upload order
6. Assign final `row_group` and `display_order` values, batch save

---

## Relationship diagram

```
admin_users          galleries            media
───────────          ─────────            ─────
id                   id ◄──────────────── gallery_id
email                title                file_path
hashed_password      slug                 orientation
created_at           cover_image_path     row_group
                     display_order        display_order
                     created_at           width_px
                     updated_at           height_px
                                          ...
```

No foreign key from `admin_users` to anything — admin is a standalone auth entity.

---

## hero_image

Single-row table. Always exactly one row (id=1). Created by Hibernate on first backend startup; the row is written on first hero upload — no seed needed.

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | BIGINT | PK, NOT NULL | Always 1 |
| file_path | VARCHAR(500) | NULLABLE | Relative path on uploads volume; null until first upload |
| updated_at | TIMESTAMP | NULLABLE | Set on every upload |

**JPA entity:** `HeroImage`  
**Repository:** `HeroImageRepository`  
**Service:** `HeroService` — `getHero()` returns `{ filePath }` (null if no row yet); `uploadHero(file)` deletes the old file then stores the new one.

**This table has nothing to do with `galleries.cover_image_path`.** Gallery cover is used only for admin card thumbnails. The homepage always reads from `hero_image`.
