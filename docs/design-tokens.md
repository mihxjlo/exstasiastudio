# Design Tokens & UI Behavior

Reference the Figma screenshots alongside this file.  
**Rule: never use raw hex values in components — always use Tailwind token names.**

---

## Colors

Define these in `tailwind.config.ts` under `theme.extend.colors`:

```ts
colors: {
  'ex-bg':    '#000000',  // background — all pages
  'ex-text':  '#FFFFFF',  // all text, nav links, labels
  'ex-pink':  '#FF00BB',  // logo icon, active nav state, "for inquiries" label
  'ex-blue':  '#3700FF',  // nav link hover state (desktop only)
  'ex-admin': '#0A0A0A',  // admin panel background (slightly off-black)
}
```

Usage in components:
```
bg-ex-bg          text-ex-text       text-ex-pink
hover:text-ex-blue   bg-ex-admin
```

---

## Typography

- Font: archivo
- Nav links: lowercase, tracked — `uppercase tracking-widest text-xs`
- Wordmark "exstasia studio": lowercase, larger — `text-lg tracking-wide` or similar
- Body/labels: clean, no decorative styling
- "for inquiries" on contact page: `uppercase tracking-widest text-xs text-ex-pink`

---

## Global layout rules

```css
/* Apply to html and body — homepage must never scroll */
html, body { background: #000000; }

/* Homepage specific */
.homepage { overflow: hidden; height: 100vh; width: 100vw; }

/* Category pages */
.category-page { overflow-y: auto; min-height: 100vh; }
```

Set `overflow: hidden` via a layout variant, not globally — category pages need to scroll.

---

## Navigation — Web (desktop)

- Position: fixed top, full width
- Left: logo icon (pink star/viewfinder SVG) — links to `/`
- Right: horizontal links — Portrait | Editorial | Campaign | Events | Contact
- Link styles:
  - Default: `text-ex-text uppercase tracking-widest text-xs`
  - Hover: `text-ex-blue` (transition: `transition-colors duration-150`)
  - Active (current page): `text-ex-pink`
- No background on nav — transparent over the hero image
- Nav height: ~60px

## Navigation — Mobile

- Same logo icon top-left
- Top-right: hamburger/menu icon (white) — toggles full-screen overlay
- Overlay:
  - Background: `bg-black bg-opacity-95` — covers entire viewport
  - Links centered vertically and horizontally
  - Same hover/active colors as desktop
  - Close: tap outside or tap icon again
  - Animation: fade in `opacity-0 → opacity-100`, duration 200ms

---

## Homepage

- Full viewport: `h-screen w-screen overflow-hidden relative`
- Hero image: `object-cover w-full h-full absolute inset-0`
- Wordmark: `absolute bottom-6 left-6 text-ex-text text-lg tracking-wide lowercase`
- Nothing else on the page — no scroll indicator, no arrows, no text overlays beyond wordmark

---

## Category Page — Image Layout

Images are grouped into rows by `row_group`. Each row is a flex container.

```tsx
// Row container
<div className="flex gap-[4px]">
  {row.map(image => (
    <div
      key={image.id}
      style={{ flexBasis: `${(image.widthPx / image.heightPx) * 100}%` }}
      className="flex-shrink-0 flex-grow-0 overflow-hidden cursor-pointer"
    >
      <img src={...} className="w-full h-full object-cover" />
    </div>
  ))}
</div>
```

- Gap within a row (between images): `4px`
- Gap between rows: `8px`
- Page horizontal padding: `px-4 md:px-6`
- All rows have equal height — controlled by a fixed row height or by the tallest image
- Images are clickable — open lightbox on click

**Rendering logic:**
```ts
// Group media array into rows
const rows = media.reduce((acc, item) => {
  if (!acc[item.rowGroup]) acc[item.rowGroup] = []
  acc[item.rowGroup].push(item)
  return acc
}, {} as Record<number, Media[]>)

const sortedRows = Object.values(rows).sort(
  (a, b) => Math.min(...a.map(i => i.rowGroup)) - Math.min(...b.map(i => i.rowGroup))
)
```

---

## Lightbox

- Full-screen dark overlay: `fixed inset-0 bg-black bg-opacity-95 z-50`
- Single image centered: `max-h-[90vh] max-w-[90vw] object-contain`
- Navigation: left/right arrow buttons, positioned at edges
- Close: Escape key OR click outside image
- Mobile: swipe left/right to navigate
- No captions, no image counter, no metadata
- Navigates through ALL images in the current category (flattened from all rows)

---

## Contact Page

- Full black screen — same `bg-ex-bg` as everywhere else
- Content centered both axes: `flex flex-col items-center justify-center min-h-screen gap-4`
- "for inquiries": `text-ex-pink uppercase tracking-widest text-xs`
- Email: `text-ex-text text-sm` — wrapped in `<a href="mailto:anastasiajorgusheska@gmail.com">`
- Instagram icon: white SVG icon, `<a href="https://instagram.com/byexstasia">` (fill in handle)
- Same nav as all other pages

---

## Admin Panel

Background: `bg-ex-admin` (`#0A0A0A`) — slightly off-black to distinguish from public site.  
Accent colors remain the same (`ex-pink`, `ex-blue`).

### Login page
- Centered card: `bg-zinc-900 rounded-lg p-8 w-full max-w-sm`
- Wordmark at top of card
- Inputs: `bg-zinc-800 border border-zinc-700 text-white rounded px-3 py-2 w-full`
- Submit button: `bg-white text-black font-medium rounded px-4 py-2 w-full hover:bg-zinc-200`
- Error: `text-red-400 text-sm mt-2`

### Sidebar
- Width: `w-56`, background: `bg-zinc-900`
- Nav items: same hover/active pattern as public nav but vertical
- Active: `text-ex-pink`, hover: `text-ex-blue`
- Sign out: bottom of sidebar, `text-zinc-500 hover:text-white`

### Gallery cards
- Grid: `grid grid-cols-2 gap-4`
- Card: `bg-zinc-900 rounded-lg overflow-hidden`
- Cover image: `aspect-[4/3] object-cover w-full bg-zinc-800`
- Card footer: `p-4`, title + action buttons

### Media editor
- Upload zone: `border-2 border-dashed border-zinc-700 rounded-lg p-8 text-center`
- Upload zone hover: `border-ex-pink`
- Image thumbnail in layout editor: `rounded overflow-hidden relative`
- Delete button on thumbnail: `absolute top-1 right-1 bg-black bg-opacity-70 rounded p-1`
- Row container in editor: `flex gap-2 p-2 border border-zinc-800 rounded-lg mb-2`

---

## Spacing scale (Tailwind defaults — use these)

| Token | Value | Use case |
|-------|-------|----------|
| `gap-[4px]` | 4px | Between images in a row |
| `gap-[8px]` | 8px | Between rows |
| `p-4` / `px-4` | 16px | Mobile page padding |
| `px-6` | 24px | Desktop page padding |
| `p-8` | 32px | Admin card padding |

---

## Transition defaults

All interactive elements:
```
transition-colors duration-150 ease-in-out
```

Mobile menu open/close:
```
transition-opacity duration-200 ease-in-out
```

---

## Image file handling

- Accepted formats: JPG, JPEG, PNG, WebP
- Max upload size: configure Spring Boot for 50MB per file (`spring.servlet.multipart.max-file-size=50MB`)
- Served from: `GET /api/files/{filename}`
- In `<img>` tags: `src={${process.env.NEXT_PUBLIC_API_URL}/api/files/${media.filePath}}`
- Always include `alt=""` on decorative portfolio images (accessibility)
