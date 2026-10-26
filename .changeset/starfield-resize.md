---
"@vex/ui": patch
---

VxStarfield: resizing the window (a side pane opening or closing) no longer moves the stars. The sky is laid out on a fixed field at least the screen's size, so the pointer parallax, drift, band and nebula no longer depend on the canvas width; a resize only reveals or hides stars. Reduced motion is unchanged.
