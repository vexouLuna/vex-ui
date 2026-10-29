---
"@vex/ui": minor
---

Usability pass from the design review:

- `--vx-on-bad`: dark ink on `--vx-bad` fills (danger-solid button, LIVE chip and badge), about 8:1 instead of 2.6:1.
- Inputs and the tag input get the same 2px `:focus-visible` ring as every other control.
- `syncDocumentTitle(router, site)` sets `document.title` to `"<page> · <site>"` from `route.meta.title`.
- On touch screens (`pointer: coarse`) small controls and segmented options are 32px tall.
- `VxSelect` works from the keyboard (arrows, Page Up/Down, Home/End, type-ahead, Enter/Space, Escape) as a
  select-only combobox with `aria-activedescendant`.
- New tokens `--vx-hover-faint`, `--vx-selected`, `--vx-scrim` and `--vx-text-xs/sm/md/lg`; `components.css` uses
  them instead of raw colours and pixel sizes, and no UI text is below 11px (the 9px and 10px labels grew).
