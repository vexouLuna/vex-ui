<script setup lang="ts">
// One thing's state at a glance, for overview pages: what it is (eyebrow), a status dot and headline ("Recording",
// "3 of 4 up"), a line under it, and a link on to the details. The left edge takes the status colour. Anything
// more (buttons) goes in the default slot, under the line; `#before-sub` puts content between the headline and the line.
import type { Health } from '../../types'
import VxLink from '../chrome/VxLink.vue'
import VxStatusDot from './VxStatusDot.vue'

withDefaults(
  defineProps<{
    label?: string
    status?: 'live' | Health
    headline: string
    sub?: string
    to?: string
    href?: string
    linkLabel?: string
  }>(),
  { status: 'off', linkLabel: 'Details' },
)
</script>

<template>
  <div class="vx-stat-tile vx-panel" :class="`is-${status}`">
    <div v-if="label" class="vx-eyebrow">{{ label }}</div>
    <div class="vx-stat-tile-main"><VxStatusDot :status="status" />{{ headline }}</div>
    <slot name="before-sub"></slot>
    <div v-if="sub" class="vx-stat-tile-sub vx-muted">{{ sub }}</div>
    <slot></slot>
    <VxLink v-if="to || href" :to="to" :href="href" class="vx-stat-tile-link">{{ linkLabel }} →</VxLink>
  </div>
</template>
