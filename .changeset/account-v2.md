---
'@vex/ui': minor
---

The account client (`@vex/ui/account`) now talks to vex-auth `/v2`: `/v2/me` and `/v2/logout`, writes send the CSRF token as `X-CSRF-Token` (`CSRF_HEADER`), and the user's name is read from `display_name`. `AuthUser` is unchanged. A site must take this together with a vods-core that also uses `/v2`: `/v1` routes refuse `X-CSRF-Token` writes.
