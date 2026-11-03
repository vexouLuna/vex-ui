---
'@vex/ui': patch
---

Fix bug-hunt findings: `signOut` only signs the UI out when the service accepted the logout (or the session was already gone), and a `/v2/me` answer in flight during sign-out no longer signs the user back in; `VxButton` as a link emits `click`; `VxTagInput` closes its list on Tab; `VxDateRange` presets count calendar days across DST changes; `VxToc` no longer rescans on every mutation when a heading is empty.
