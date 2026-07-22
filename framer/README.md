# Nabia Shaikh — Y2K desk portfolio (Framer build)

This folder versions the source of the custom Framer code components that power
Nabia Shaikh's portfolio. The live site is built in the Framer project
(project id `wqGhea2Mgr0hAu7EfUQV`); this repo is a backup/record of the
hand-written components so they can be reviewed and diffed outside Framer.

## Concept

A kinetic, black-and-white graphic intro resolves into an illustrated top-down
desk rendered with Y2K print/graphic techniques (halftone, grain, scan-lines,
bold display + pixel/mono type). Strict **black & white with a single accent —
electric blue (`#0F27FF`)**. This is a real multi-page site; the desk is the
Home entry, not a container for all content, and it is **not** a fake OS/desktop.

## Latest updates

- **Scroll-controlled desk** (`DeskWorkspace`): the load is now driven by scroll
  (spring-smoothed) — a welcome message, then the **desk surface first**, then
  each object is "placed" one-by-one as you scroll further. Objects still jiggle
  on hover; radio still toggles rain + speakers.
- **`TopBar.tsx`** — a constant **floating** header (sticky, blurred): "NABIA
  SHAIKH" (→ home), **Archive** + **Projects** links, and a **Contact me**
  button. Added to Home, Archive, Projects and case-study pages. Editable code
  component (name/links/accent as props).
- **`ArchiveFrame.tsx` + Archive CMS** — the `/archive` page is a CMS-backed,
  infinitely-scrolling **broken-grid gallery** of grainy image frames of varying
  sizes that gently float. Each frame is a component driven by the **Archive**
  collection (Title, Image, Description, Size = S/M/L). Hover shows the project
  title; click opens a pop-up with the image, title and description. Frames carry
  a heavy, very visible grain/noise texture. **Edit everything in the Archive
  CMS collection** — add/remove items, set image + title + description + size.

## Current Home — `DeskWorkspace.tsx` (illustrated desk)

The Home page now uses Nabia's uploaded **"Desk Animation"** illustration (layers
of full-frame PNGs), rebuilt in code so it can animate and be interactive:

- **Load sequence**: a handwritten "hey, welcome to my workspace" message
  dissolves in (black), then the desk background appears and each element is
  "placed" one-by-one with a smooth staggered spring settle.
- **Hover**: clickable objects jiggle (rotate/scale) in place.
- **Radio (boombox)**: toggles ambient **rain** (synthesized via WebAudio —
  starts on first tap per browser autoplay rules); the **speaker** layers fade
  in/out to show whether sound is playing.
- **Labels**: each clickable object has a small blue label (SOUND, PROJECTS,
  ARCHIVE, WORK, JOURNAL, NOTES, CALL, CHUTNEY, SCHEDULE, SOORAJ).
- **Actions**: the **work laptop** → `/work` page and **archive** → `/archive`
  page (hard flash-wipe). Everything else opens a **graphic pop-up** (white
  card, thin border, bold `X CLOSE`, centered content, optional `★ VISIT ★`).
- The central laptop is one object in the art, so "laptop"/"work-laptop" are
  treated as a single `WORK` → `/work` action.

`Y2KHome.tsx` (the earlier B&W kinetic home) and `SiteRoutes.tsx` remain in the
project but Home now renders `DeskWorkspace`.

## Pages

| Route | What |
|---|---|
| `/` | Kinetic type intro → desk scene (`Y2KHome`) |
| `/work/:slug` | Full case-study routes (3 locked studies, CMS-backed) |
| `/about` | Editorial about (`SiteRoutes` mode=about) |
| `/gallery` | Grainy B&W grid, hover reveal, click → graphic pop-up (`SiteRoutes` mode=gallery) |
| `/clients` | Client grid (`SiteRoutes` mode=clients) |
| `/contact` | Contact + booking + socials (`SiteRoutes` mode=contact) |

## Components

- **`Y2KHome.tsx`** — the Home experience:
  - **Load sequence**: opens on a near-black screen; the bold wordmark enters
    via a staggered letter fade-up. The intro then resolves **scroll-linked**
    (progress tied to scroll position, spring-smoothed/lerped, reversible): the
    type wipes/scales out while the desk composes in from dark underneath. If
    the user doesn't scroll within ~1.8s, a timed fallback resolves it. Reduced
    motion skips the intro; mobile uses a single timed fade (touch scroll is
    unreliable). This is not a one-shot CSS animation.
  - **Intro collage** (Heat Bureau style): as you scroll, a scattered grainy B&W
    collage (halftone / line / gradient tiles) assembles around the wordmark,
    then the whole intro wipes out as the desk composes in.
  - **Desk = illustrated scene** (not a grid): a halftone desk surface with three
    **device-screen** case studies — a laptop (CASE 01), a monitor (CASE 02) and
    a tablet (CASE 03), each showing a project still + title bar inside the bezel
    (click → flash-wipe → `/work/<slug>`). Smaller desk objects — journal, photo
    stack, rolodex, envelope — are the nav; a pen and post-it are decoration.
    Hover = sharp invert / accent flash + scale-lift.
  - **Nav pop-up**: clicking a desk object opens a Barbiana-style graphic modal
    (white card, thin border, bold `X CLOSE` top-right, centered content) with a
    `★ VISIT ★` link to the full page.
  - Corner UI chrome (mono) + live clock.
  - `prefers-reduced-motion`: skips the intro, shows the desk directly.
  - Mobile: simplified single-fade intro, stacked tap-to-open layout.
  - No scroll-jacking anywhere (retired with the old concept).

- **`SiteRoutes.tsx`** — shared B&W chrome (nav + footer) with a `mode`-driven
  body for About / Clients / Contact / Gallery, including the interactive
  Gallery grid + Barbiana-style graphic pop-up.

## Type & palette

- Display: **Archivo Black** (bold, kinetic). Labels/UI chrome: **Space Mono**
  and **Silkscreen** (pixel). No handwriting face.
- Strict black & white; one accent (electric blue). Halftone dot-shading stands
  in for soft shadow; grain + scan-line overlays across imagery.

## To finish (Nabia's content — per the brief's checklist)

- 3 real case-study write-ups + real Gallery projects/blurbs.
- About copy, Clients list, Contact details + booking link, kinetic intro copy.
- Swap placeholder case-study slugs/labels for real work.
- Publish from Framer when ready.
