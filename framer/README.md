# Desk — Nabia Shaikh portfolio (Framer build)

This folder versions the source of the custom Framer code component that powers
Nabia Shaikh's single-scene "desk" portfolio. The live site is built in the
Framer project (project id `wqGhea2Mgr0hAu7EfUQV`); this repo is a backup/record
of the hand-written component so it can be reviewed and diffed outside Framer.

## Concept

One illustrated top-down desk that behaves like a small interactive world. The
site opens with a closed laptop and a short welcome beat; scroll drives a pinned
hero where the laptop lid lifts to reveal the project grid. Everything else on
the desk is quiet atmosphere (hover-only tooltips) except two real navigation
objects: the phone (book a call) and the business card (contact / socials).

## What's in the Framer project

- **`DeskScene.tsx`** — the entire home experience as a single Framer code
  component (React + Framer Motion, no external assets; all art is SVG/CSS):
  - Load + welcome message sequence, desk dims then brightens.
  - **Scroll-jacked laptop open** — the signature moment. Scroll progress is
    mapped 0→1 through a pinned (`position: sticky`) hero and spring-smoothed
    (`useSpring`) so it feels physical, is fully reversible, and rests partway
    when scrolled partway. Not a play-once timeline.
  - **`prefers-reduced-motion`** fallback: no scroll-jack, laptop starts open
    with a gentle fade/spring intro.
  - **Mobile (Option A)** fallback: laptop starts open, hover tooltips become
    tap-to-reveal, larger touch targets.
  - Decorative objects (journal, two post-its, pen, mug, looping second
    monitor) with hover lift + handwritten sticky-note tooltips.
  - Phone → "Book a call" overlay (Calendly link). Business card → contact
    overlay (email + socials).
  - In-screen project grid; each card links to a real `/work/<slug>` route.
  - Opt-in sound toggle (short synthesized ticks via WebAudio, off by default).
  - Accessibility: keyboard focus + roles on the two nav objects, reduced
    motion, decorative art, warm high-contrast tooltip text.

- **`Projects` CMS collection** — Title, Slug, Subtitle, Role, Year, Accent,
  Overview, Approach, Outcome. Four seeded placeholder projects.

- **`/work/:slug` detail page** — a real, freely-scrolling case-study route
  (accent banner, title/subtitle/meta, Overview/Approach/Outcome, and a
  persistent "Back to the desk" link). Slugs match the laptop cards.

## Typography

Handwriting-adjacent face (Caveat) for the welcome message, tooltips, and
labels; clean sans for reading content. Case-study pages stay restrained and
readable.

## To finish (needs Nabia's real content)

- Replace placeholder projects/case-study copy with real work.
- Set the real booking URL, email, and social links (component props + the
  contact overlay).
- Rewrite the welcome line + tooltip copy in her own voice.
- Publish from Framer when ready.
