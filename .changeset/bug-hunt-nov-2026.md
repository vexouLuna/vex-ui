---
'@vex/ui': patch
---

Fix four component bugs: VxTooltip links its bubble to the focused trigger (aria-describedby), VxStepper resets the field when a typed value clamps back to the model, VxDialog leaves itself open when Escape closes a popover inside it, and VxDialog mounted already open moves focus in and restores it on close.
