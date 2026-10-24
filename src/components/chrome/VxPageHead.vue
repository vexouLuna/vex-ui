<script setup lang="ts">
// A page's heading: an eyebrow (the section), the title (h1) and actions on the right, with a line of text under it
// (default slot). The actions wrap under the title on narrow screens.
defineProps<{ title: string; eyebrow?: string }>()
</script>

<template>
  <header class="vx-pagehead">
    <div v-if="eyebrow" class="vx-eyebrow">{{ eyebrow }}</div>
    <h1 class="vx-display vx-pagehead-title"><slot name="title">{{ title }}</slot></h1>
    <div v-if="$slots.actions" class="vx-pagehead-actions"><slot name="actions"></slot></div>
    <div v-if="$slots.default" class="vx-pagehead-text vx-muted"><slot></slot></div>
  </header>
</template>
