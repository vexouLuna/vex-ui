---
'@vex/ui': minor
---

The panel glass is reusable: `--vx-glass-panel` holds the whole background (reflection, sheen and tint, with each layer's position, size and attachment), and `--vx-glass-rim-mask` holds the mask that cuts a `::after` down to the lit rim. `.vx-panel` and `.vxp-panel` now use them, so another stylesheet can match the panels with `background: var(--vx-glass-panel)` instead of copying the layers. No visual change.
