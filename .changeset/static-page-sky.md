---
'@vex/ui': minor
---

A page's starfield (VxSiteShell) now stays put on screen while the page scrolls over it; the pointer parallax is unchanged. VxStarfield draws at its own size, which is still its parent's by default. New `.vx-glass-rim` class gives any element the panel's lit rim, so a theme's own panel class doesn't copy the `::after`.
