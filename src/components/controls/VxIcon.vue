<script setup lang="ts">
// An inline SVG icon from VX_ICONS. 18px sits in both control heights (32 and 26). Decorative unless it has a
// `title`: an icon inside a labelled button stays aria-hidden, a lone icon that means something gets a title.
import { VX_ICONS, type VxIconName } from '../../utils/icons'

withDefaults(defineProps<{ name: VxIconName; size?: number | string; title?: string }>(), { size: 18 })
</script>

<template>
  <svg
    class="vx-icon"
    viewBox="0 0 24 24"
    :width="size"
    :height="size"
    :role="title ? 'img' : undefined"
    :aria-label="title"
    :aria-hidden="title ? undefined : 'true'"
    focusable="false"
    v-html="VX_ICONS[name]"
  ></svg>
</template>
