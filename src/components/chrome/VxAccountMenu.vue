<script setup lang="ts">
// Account control: always exactly one control-height tall, signed in or out, so the header never changes size.
// Signed out: a panel-styled "Sign in" button (icon-only on narrow sites). Signed in: the user's name and avatar
// opening a menu (avatar only on narrow sites).
// The menu starts with Profile (the account page on vexoul.net); the site's own items come through the default slot.
import { computed } from 'vue'
import type { AccountUser } from '../../types'
import { twitchColor } from '../../utils/color'
import VxPlaceholder from '../media/VxPlaceholder.vue'
import VxTwitchGlyph from './VxTwitchGlyph.vue'
import VxPopover from '../overlays/VxPopover.vue'
import VxMenuItem from '../overlays/VxMenuItem.vue'
import VxMenuSeparator from '../overlays/VxMenuSeparator.vue'

const props = withDefaults(
  defineProps<{
    user?: AccountUser | null
    /** Sign-in isn't set up on this site (no auth service configured): see `@vex/ui/account`. */
    disabled?: boolean
    /** The account is still being checked: Sign in is greyed out until it's known. */
    checking?: boolean
    note?: string
    /** Where Profile goes; `null` leaves it out (e.g. on the account page itself). */
    profileHref?: string | null
  }>(),
  { user: null, disabled: false, checking: false, note: 'signed in on all *.vexoul.net', profileHref: 'https://vexoul.net/account' },
)
const emit = defineEmits<{ signIn: []; signOut: [] }>()
const nameColor = computed(() => (props.user ? twitchColor(props.user.name, props.user.color) : undefined))
</script>

<template>
  <button
    v-if="!user"
    type="button"
    class="vx-btn vx-signin"
    :disabled="disabled || checking"
    :title="checking ? 'Checking sign-in…' : disabled ?'Sign in isn\'t available here' : 'Sign in with Twitch'"
    @click="emit('signIn')"
  >
    <slot name="signin-icon"><VxTwitchGlyph /></slot>
    <span class="vx-signin-label">Sign in</span>
  </button>
  <VxPopover v-else align="right" width="270px">
    <template #trigger="{ toggle, open }">
      <button
        type="button"
        class="vx-account-trigger vx-ring"
        :aria-expanded="open"
        aria-haspopup="menu"
        :aria-label="`Account: ${user.name}`"
        @click="toggle"
      >
        <span class="vx-account-trigger-name">{{ user.name }}</span>
        <span class="vx-account-pfp">
          <img v-if="user.avatar" :src="user.avatar" alt="" style="width: 100%; height: 100%; border-radius: 50%" />
          <VxPlaceholder v-else label="pfp" w="100%" h="100%" round />
        </span>
      </button>
    </template>
    <template #default="{ close }">
      <div class="vx-account-who">
        <img v-if="user.avatar" :src="user.avatar" alt="" width="36" height="36" style="border-radius: 50%" />
        <VxPlaceholder v-else label="pfp" :w="36" :h="36" round />
        <div style="min-width: 0">
          <div class="vx-account-name" :style="{ color: nameColor }">{{ user.name }}</div>
          <div class="vx-muted vx-mono" style="font-size: var(--vx-text-xs)">{{ note }}</div>
        </div>
      </div>
      <VxMenuItem v-if="profileHref" :href="profileHref" @click="close()">Profile</VxMenuItem>
      <slot :close="close"></slot>
      <VxMenuSeparator />
      <VxMenuItem danger @click="emit('signOut'); close()">Sign out</VxMenuItem>
    </template>
  </VxPopover>
</template>
