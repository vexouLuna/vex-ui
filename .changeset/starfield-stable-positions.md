---
'@vex/ui': patch
---

VxStarfield: star positions no longer depend on the page height. The sky is built from fixed tiles seeded by their page-absolute position, and pointer parallax is measured against a fixed 900px, so content loading, collapsing or resizing no longer makes the stars jump.
