# Nabia Shaikh — desk portfolio (Framer build)

Source backup for the Framer project (`wqGhea2Mgr0hAu7EfUQV`). Live preview:
**https://faithful-structure-027776.framer.app/**

## What’s live now

### Home — full-bleed desk + floating TopBar
- **`DeskWorkspace.tsx`** — illustrated desk layers, scroll-reveal.
- Desk **popups** show the clicked object on the modal.
- **TopBar (design component)** — Inter, all caps, letter-spacing -1px.

### Work — scroll-driven project browser + case studies
- **`WorkIndex.tsx`** — interactive project browser: sticky info + large visual.
  Scroll advances one active project at a time (title, description, media, CTA
  update together). Mobile uses a natural vertical sequence. Cream stage +
  homepage-matched desk grid.
- Case studies keep CMS-bound content with a clearer type scale + hero band.

### Archive — cream stage
- **`ArchiveGallery.tsx`** — cream `#F3EFE6`, opposite column drift.
- **← Back** pill aligned with TopBar.

### Desk corner
- **`DeskCorner.tsx`** — sticky flush desk crops (laptop on Work, etc.).

## Routes

| Route | What |
|---|---|
| `/` | Welcome → scroll-reveal desk |
| `/work` | Project index |
| `/work/:slug` | Case study |
| `/archive` | Infinite column gallery |
| `/about` | About |
| `/contact` | Contact |

## Accent
`#2C6BE0`
