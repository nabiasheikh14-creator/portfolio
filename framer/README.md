# Nabia Shaikh — desk portfolio (Framer build)

Source backup for the Framer project (`wqGhea2Mgr0hAu7EfUQV`). Live preview:
**https://faithful-structure-027776.framer.app/**

## What’s live now

### Home — full-bleed desk + floating TopBar
- **`DeskWorkspace.tsx`** — illustrated desk layers, scroll-reveal.
- Desk **popups** show the clicked object on the modal.
- **TopBar (design component)** — Inter, all caps, letter-spacing -1px.

### Work — scroll-driven project browser + case studies
- **`WorkIndex.tsx`** — interactive project browser: sticky left info panel
  (cream + soft low-opacity grid) with smooth crossfading project copy; only the
  right visual frames scroll (native trackpad momentum, no snap, no custom
  cursor). Mobile uses a natural vertical sequence.
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
