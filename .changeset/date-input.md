---
"@vex/ui": minor
---

New `VxDateInput`: a text field for `YYYY-MM-DD` (or, with `time`, `YYYY-MM-DD HH:mm`, 24 h) with a calendar button. Typing and pasting work; the value keeps the native inputs' shape (`2026-10-23`, `2026-10-23T14:05`). `VxDateRange` uses it instead of native date pickers. `parseDate`, `monthGrid`, `isoDate`, `isoDateTime` and `showDate` are exported (also from `@vex/ui/utils`).
