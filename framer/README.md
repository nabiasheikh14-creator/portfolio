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
  - **Kinetic intro** (~2.5s): the wordmark slams in letter-by-letter, then
    settles to the top as the desk reveals. Front-loaded drama, then clarity.
  - **Desk scene**: top-down, B&W, halftone + grain + scan-lines. Three
    prominent **CASE 01/02/03** objects are the case studies (click → flash-wipe
    → `/work/<slug>`). Secondary objects (`[ABOUT] [GALLERY] [CLIENTS]
    [CONTACT]`) link out. Hover states are snappy — invert / accent flash /
    box-shadow pop, not soft lift.
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
