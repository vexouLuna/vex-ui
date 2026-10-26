---
"@vex/ui": minor
---

Add `VxTagInput`: chips plus a text input for tags or any list of values. It picks from `options` as a combobox
(prefix matches first; ↑/↓, Enter or Tab, Esc), takes free text with `allowNew` and `validate` (comma or Enter; a
pasted comma list adds each value), shows `locked` chips that can't be removed, and caps at `max`. Backspace in the
empty input selects the last chip, then removes it. New types `TagOption` and `LockedTag`; `VxPopover` takes a
`panelId`.
