<script setup lang="ts">
// Renders the toasts from useToast(). Teleported to <body>: .vx-site is a size container, which would
// otherwise become the containing block for position: fixed.
import { useToast } from '../../composables/useToast'

const { toasts, pause, resume } = useToast()
const icon = { ok: '✓', info: 'i', error: '!' } as const
</script>

<template>
  <Teleport to="body">
    <div class="vx-toasts vx-overlay" role="status" aria-live="polite">
      <div v-for="t in toasts" :key="t.id" class="vx-toast" :class="`is-${t.kind}`"
        tabindex="0"
        @mouseenter="pause(t.id)"
        @mouseleave="resume(t.id)"
        @focusin="pause(t.id)"
        @focusout="resume(t.id)"
      >
        <span class="vx-toast-icon" aria-hidden="true">{{ icon[t.kind] }}</span>{{ t.message }}
      </div>
    </div>
  </Teleport>
</template>
