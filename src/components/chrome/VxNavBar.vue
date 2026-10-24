<script setup lang="ts">
// A section's own nav under the header (e.g. Manage: Overview · Me · Audit): a label, links with the current one
// marked, and room before (`#lead`, a channel picker) and after (`#trail`, who's signed in). It wraps on narrow
// screens; nothing is dropped. Which link is current is the page's call (`current`), so it works with or without
// vue-router; `to` uses RouterLink when there is one.
import type { NavLink } from '../../types'
import VxLink from './VxLink.vue'

defineProps<{ links: NavLink[]; label: string; title?: string }>()
</script>

<template>
  <nav class="vx-navbar vx-panel" :aria-label="label">
    <span v-if="title" class="vx-eyebrow vx-navbar-title">{{ title }}</span>
    <slot name="lead"></slot>
    <div class="vx-navbar-links">
      <VxLink
        v-for="l in links"
        :key="l.to ?? l.href ?? l.label"
        :to="l.to"
        :href="l.href"
        class="vx-navbar-link"
        :class="{ 'is-current': l.current }"
        :aria-current="l.current ? 'page' : undefined"
      >{{ l.label }}</VxLink>
    </div>
    <div v-if="$slots.trail" class="vx-navbar-trail"><slot name="trail"></slot></div>
  </nav>
</template>
