# Nabia Shaikh — desk portfolio (Framer build)

Source backup for the Framer project (`wqGhea2Mgr0hAu7EfUQV`). Live preview:
**https://faithful-structure-027776.framer.app/**

## What’s live now

### Home — full-bleed desk + floating TopBar
- **`DeskWorkspace.tsx`** — illustrated desk layers, scroll-reveal. The stage
  **covers the viewport** (`object-fit: cover` style scaling) so the `bg` grid
  fills edge-to-edge instead of letterboxing on cream.
- **TopBar (design component)** — editable canvas component (`TopBar`), not
  code. Inter, **all caps**, **letter-spacing -1px**. Name + Work / Archive /
  Contact are the same text-link style (no Contact button). Fixed overlay with
  ~48px top spacer so the pill floats over the desk. **Light** + **Dark**
  variants. Text/fonts/spacing are editable on the component (variables +
  text style presets **TopBar Name** / **TopBar Nav**).

### Archive — AIC Awards–style gallery
- **`ArchiveGallery.tsx`** — 4 columns auto-drift slowly in **opposite**
  directions (1+3 vs 2+4). Page scroll speeds them up. Content is looped so
  the scroll never ends. Click → lightbox popup. No edge vignette masks.
- Black page + low-opacity desk grid. Items synced from the **Archive** CMS
  (`Items` array with image URLs). Add/edit projects in the Archive CMS, then
  re-sync the gallery Items.
- TopBar **Dark** variant on this page.

### Also
- **`ArchiveFrame.tsx`** — single CMS-bound frame (still available for
  Collection Lists).
- **`TopBar.tsx`** — deprecated code fallback; prefer the design component.
- Older: `Y2KHome.tsx`, `SiteRoutes.tsx`.

## Routes

| Route | What |
|---|---|
| `/` | Welcome → scroll-reveal desk |
| `/archive` | Infinite column gallery + popups |
| `/work` | Projects list |
| `/work/:slug` | Case study |

## Accent
`#2C6BE0`
