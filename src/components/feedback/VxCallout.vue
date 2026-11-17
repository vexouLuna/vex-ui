<script setup lang="ts">
// Inline message with a coloured edge. The body can hold code blocks; they scroll inside the callout.
// `dismissable` adds a close button that emits `dismiss`; the parent hides the callout (clears its error).
import type { Tone } from '../../types'
import VxButton from '../controls/VxButton.vue'

withDefaults(defineProps<{ tone?: Tone; title?: string; dismissable?: boolean; dismissLabel?: string }>(), {
  tone: 'info',
  dismissable: false,
  dismissLabel: 'Dismiss',
})
defineEmits<{ dismiss: [] }>()
const icons: Record<Tone, string> = { info: 'i', ok: '✓', warn: '!', error: '×' }
</script>

<template>
  <div class="vx-callout" :class="`is-${tone}`" :role="tone === 'error' ? 'alert' : 'status'">
    <span class="vx-callout-icon vx-mono" aria-hidden="true"><slot name="icon">{{ icons[tone] }}</slot></span>
    <div class="vx-callout-body">
      <div v-if="title" class="vx-callout-title">{{ title }}</div>
      <slot></slot>
    </div>
    <div v-if="$slots.actions" class="vx-callout-actions"><slot name="actions"></slot></div>
    <VxButton
      v-if="dismissable"
      class="vx-callout-dismiss"
      icon
      size="sm"
      variant="ghost"
      :label="dismissLabel"
      @click="$emit('dismiss')"
    >✕</VxButton>
  </div>
</template>
