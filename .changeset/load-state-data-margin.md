---
"@vex/ui": minor
---

VxLoadState: `data` comes back non-null in the default slot (`v-slot="{ data }"`), so content needs no `v-if`; `margin` spaces the error, skeleton and empty stand-ins; with `stale` and `empty`, a failed refresh shows `#empty` under the warning instead of the content.
