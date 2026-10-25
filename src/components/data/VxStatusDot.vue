<script setup lang="ts">
// `live` is red with a halo (on air); `down` is plain red (a service not answering). `size="lg"` is the dot beside a
// page title: a bigger dot, and the label takes the heading's font size.
import type { Health } from '../../types'

withDefaults(defineProps<{ status?: 'live' | Health; label?: string; size?: 'md' | 'lg' }>(), { status: 'off', size: 'md' })
</script>

<template>
  <span class="vx-status" :class="[`is-${status}`, { 'is-lg': size === 'lg' }]">
    <span class="vx-status-dot" aria-hidden="true"></span>
    <slot>{{ label }}</slot>
  </span>
</template>
