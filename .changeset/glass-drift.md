---
'@vex/ui': minor
---

Glass: the values picked in the glass lab (border 14%, top highlight 13%, sheen 4%, lit rim 10%, reflection 4%), and
the window reflection now drifts down by itself at 5px/s on top of following the scroll. `--vx-glass-drift-time`
sets the speed (one 3200px loop; default `640s`); it pauses while the tab is hidden, and reduced motion stops it.
