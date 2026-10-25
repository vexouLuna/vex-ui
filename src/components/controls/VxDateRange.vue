<script setup lang="ts">
// From / to dates (typed, pasted or picked from a calendar: VxDateInput) with quick presets. Values are ISO dates (YYYY-MM-DD); empty string = open-ended.
import type { DatePreset } from '../../types'
import { isoDate as iso } from '../../utils/date'
import VxDateInput from './VxDateInput.vue'

withDefaults(defineProps<{ presets?: DatePreset[]; min?: string; max?: string }>(), {
  presets: () => [
    { label: '7 days', days: 7 },
    { label: '30 days', days: 30 },
    { label: 'This year', days: -1 },
    { label: 'All', days: 0 },
  ],
})
const from = defineModel<string>('from', { default: '' })
const to = defineModel<string>('to', { default: '' })

function apply(p: DatePreset) {
  const now = new Date()
  if (p.days === 0) {
    from.value = ''
    to.value = ''
  } else if (p.days < 0) {
    from.value = `${now.getFullYear()}-01-01`
    to.value = iso(now)
  } else {
    from.value = iso(new Date(now.getTime() - p.days * 86400000))
    to.value = iso(now)
  }
}
</script>

<template>
  <div class="vx-date-range">
    <div class="vx-date-range-row">
      <VxDateInput v-model="from" :min="min" :max="to || max" aria-label="From" />
      <span class="vx-muted" aria-hidden="true">→</span>
      <VxDateInput v-model="to" :min="from || min" :max="max" aria-label="To" />
    </div>
    <div v-if="presets.length" class="vx-date-range-presets">
      <button v-for="p in presets" :key="p.label" type="button" class="vx-chip" @click="apply(p)">{{ p.label }}</button>
    </div>
  </div>
</template>
