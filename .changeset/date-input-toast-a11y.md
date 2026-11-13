---
'@vex/ui': patch
---

VxDateInput blocks form submit (setCustomValidity, Enter) while its text isn't a valid date and emits `invalid-change`; error toasts last 6 s, pause on hover/focus, and aren't evicted by non-error toasts.
