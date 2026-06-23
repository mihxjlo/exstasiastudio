# Exstasia Studio — Claude Code Context

## Project
Full-stack photography portfolio site for Anastasia Jorgusheska (Exstasia Studio).
Three-service architecture: Next.js 14 frontend + Spring Boot 3 backend + PostgreSQL 15.

## Stack
- **Frontend:** Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Backend:** Java 17, Spring Boot 3, Spring Data JPA, Spring Security + JWT (JJWT)
- **Database:** PostgreSQL 15
- **File storage:** Docker volume mounted at `/uploads` inside the backend container

## Repo structure
```
/
├── docs/              # all project docs live here
│   ├── CLAUDE.md
│   ├── api-contract.md
│   ├── db-schema.md
│   ├── design-tokens.md
│   └── exstasia-studio-prd.docx
├── MOCKUPS/           # design reference screenshots
├── frontend/          # Next.js app
│   ├── Dockerfile
│   ├── .dockerignore
│   └── .env.example
├── backend/           # Spring Boot app
│   ├── Dockerfile
│   └── .env.example
├── k8s/               # Kubernetes manifests (not yet built)
├── uploads/           # runtime image volume — gitignored
├── .gitignore
├── .env               # real secrets — gitignored, never commit
└── docker-compose.yml
```

## Backend conventions
- Package root: `com.exstasia.portfolio`
- Sub-packages: `config`, `controller`, `service`, `repository`, `entity`, `dto`, `security`, `exception`
- All REST endpoints prefixed with `/api`
- JWT passed as `Authorization: Bearer <token>` header
- Files served via `GET /api/files/{filename}` from the uploads volume
- Four galleries are **seeded on startup** by `DataInitializer` — never created via API
- Gallery slugs are fixed: `portrait`, `editorial`, `campaign`, `events`
- Orientation detected on upload via `javax.imageio.ImageIO` — never changes after upload
- `LayoutService` owns the auto-arrange algorithm — keep it separate from `MediaService`
- File upload + DB write must be wrapped so partial failures don't leave orphaned data
- **`JWT_SECRET` must be explicitly set in every environment — there is no safe fallback.** The `application.properties` fallback is `REPLACE_ME_SET_JWT_SECRET_ENV_VAR`, which will cause JJWT to throw on startup if `JWT_SECRET` is not set to a real value. Add it to IntelliJ run config, Docker Compose env, and K8s Secret. Generate with: `node -e "require('crypto').randomBytes(32).toString('base64')" | pbcopy`
- **Hero image** is stored in the `hero_image` table (single row, id=1) via `HeroService` / `HeroController` — completely separate from gallery media. `GET /api/hero` is public; `POST /api/hero` requires JWT. Uploading a new hero deletes the old file from the volume.

## Frontend conventions
- All backend calls go through `lib/api.ts` — never fetch directly in components
- JWT stored in `localStorage` AND as a cookie (`exstasia_jwt`) — login writes both; logout must clear both or the middleware will keep admitting a logged-out user
- Use Next.js server components for public data fetching where possible
- Admin routes: all under `/admin`, protected by middleware (cookie check) + client-side layout guard (localStorage check)
- No UI component libraries — pure Tailwind only
- Color tokens defined in `tailwind.config.ts` — always use token names not raw hex values
- Mobile menu state managed in a `MobileMenuContext` provider in root layout
- Drag-and-drop in admin: use `@hello-pangea/dnd` (NOT react-beautiful-dnd)
- Logo image is at `frontend/public/logo.png` — used in `Nav` via `next/image` with `priority`, and as a centered homepage link on the contact page
- **Nav is suppressed on admin routes** — `Nav` checks `pathname.startsWith('/admin')` and returns `null`. This prevents the public nav from overlapping the admin UI.
- **Admin sidebar is collapsible on mobile** — `Sidebar` is `position: fixed` on mobile (slides in/out via translate), `md:static` on desktop (always visible in normal flow). State (`isOpen`) lives in `AdminLayout` and is passed as props. `<main>` in admin layout needs `min-w-0` to prevent flex overflow on narrow screens.
- `api.ts` request() uses `response.text()` then `JSON.parse` — never `.json()` directly — because some 200 responses (layout, auto-arrange) have empty bodies

## Do not
- Install shadcn, MUI, Chakra, Radix, or any other UI component library
- Use raw hex color values in components — use Tailwind tokens
- Add features not in the PRD
- Store contact or booking data in the database — all contact is via mailto:
- Create or delete galleries via the API — they are fixed and seeded
- Use `any` type in TypeScript

## Image aspect ratios
Only two ratios are supported: **16:9 (landscape)** and **9:16 (portrait)**. No other ratios will be uploaded.

- Category grid rows: no fixed height — row height derives from `aspect-ratio` CSS on each cell, with `flex-grow` proportional to aspect ratio. Use `object-contain` (not `object-cover`) so nothing is ever cropped.
- Admin media editor thumbnails: fixed height (96 px), width = `96 * widthPx/heightPx`, `object-contain`.
- `html` has `overflow-x: hidden` (globals.css) — **not `body`**. Putting `overflow-x: hidden` on `body` makes `@hello-pangea/dnd` detect it as a scroll container, which breaks desktop mouse drag auto-scroll. Keep it on `html` only.

## Key behaviors to get right
- Homepage has `overflow: hidden` — it must not scroll under any circumstances
- Homepage hero image comes from `GET /api/hero`, NOT from gallery covers. Managed at `/admin/hero`.
- `galleries.cover_image_path` is used only for the admin gallery card thumbnails — not the homepage.
- Category pages scroll vertically — `overflow: visible`
- Image rows: `flex-grow` proportional to aspect ratio, `aspect-ratio` CSS on each cell, `items-start` on the row container — never a fixed row height
- Lightbox navigates through ALL images in the current category, not just the clicked row
- Admin layout changes auto-save on drag-end via `PUT /api/media/layout`
- Mobile overlay: backdrop `onClick` closes the menu; inner links container has `stopPropagation` so link clicks aren't intercepted

## Docker
- **Two API URL env vars exist** — `NEXT_PUBLIC_API_URL` (baked at build time, used by the browser) and `INTERNAL_API_URL` (runtime, used by the Next.js SSR server). `api.ts` branches on `typeof window === 'undefined'`. In Compose, `NEXT_PUBLIC_API_URL=http://localhost:8080` is a build arg; `INTERNAL_API_URL=http://backend:8080` is a runtime env var on the frontend service.
- **`sharp` is not in `package.json`** — installed via `RUN npm install --no-save sharp` in the Dockerfile runner stage after the standalone output is copied in. Required by Next.js standalone for `next/image` optimization.
- **`/app/.next/cache` permissions** — COPY commands in the runner stage must use `--chown=nextjs:nextjs`. The cache dir must be pre-created with `RUN mkdir -p /app/.next/cache && chown nextjs:nextjs /app/.next/cache` before `USER nextjs`.
- **Backend healthcheck** uses `wget -q --spider http://localhost:8080/api/galleries` (Alpine has `wget`, not `curl`). `start_period: 30s` gives the JVM time to boot.
- **Frontend `depends_on` backend with `condition: service_healthy`** — without this the frontend SSR requests race the backend startup and get ECONNREFUSED.
- **Docker volumes start empty** — locally uploaded images live on the host. After `docker compose up`, re-upload through the admin panel to populate the volume.
- **`.env` at repo root** holds real secrets (JWT_SECRET, passwords). It is gitignored. Never commit it.

## Known issues / deferred cleanup
- No current known issues.

## Phase order
Always implement in this order — do not jump ahead:
1. Backend foundation (entities, auth, DataInitializer) ✅
2. Gallery & media API (upload, orientation, layout endpoints) ✅
3. Frontend public site (homepage, category pages, lightbox, contact) ✅
4. Admin panel (login, gallery list, media editor) ✅
5. Docker & CI/CD (Dockerfiles, Compose, GitHub Actions) — Dockerfiles + Compose done ✅, GitHub Actions remaining
6. Kubernetes (all 13 manifests, k3d demo)

