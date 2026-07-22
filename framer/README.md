# Nabia Shaikh — desk portfolio (Framer build)

Source backup for the Framer project (`wqGhea2Mgr0hAu7EfUQV`). Live preview:
**https://faithful-structure-027776.framer.app/**

## What’s live now

### Home — full-bleed desk + floating TopBar
- **`DeskWorkspace.tsx`** — illustrated desk layers, scroll-reveal. The stage
  **covers the viewport** so the `bg` grid fills edge-to-edge.
- Desk **popups** show the clicked object floating in the modal’s bottom-right.
- **TopBar (design component)** — Inter, all caps, letter-spacing -1px. Light + Dark variants.

### Archive — cream stage + sticky archive boxes
- **`ArchiveGallery.tsx`** — cream `#F3EFE6` (matches home), 4 opposite-drifting columns,
  wheel boosts speed (page does not scroll). Sticky **archive** desk art bottom-right.
- TopBar **Light** variant.

### Desk corner mascots
- **`DeskCorner.tsx`** — sticky floating crop of the desk object you clicked.
  - `/archive` → archive boxes (built into ArchiveGallery)
  - `/work` → laptop
  - `/about` → chutney (via SiteRoutes)
  - `/contact` → phone (via SiteRoutes)

### Also
- **`ArchiveFrame.tsx`**, **`SiteRoutes.tsx`**, deprecated **`TopBar.tsx`** code fallback.
- Older: `Y2KHome.tsx`.

## Routes

| Route | What |
|---|---|
| `/` | Welcome → scroll-reveal desk |
| `/archive` | Infinite column gallery + popups |
| `/work` | Projects list |
| `/work/:slug` | Case study |
| `/about` | About |
| `/contact` | Contact |

## Accent
`#2C6BE0`
