<script setup lang="ts">
// The bar under a settings form: "N unsaved changes", Undo and Save. It sticks to the bottom of the screen while the
// form scrolls, and lights up while there's something to save. `error` shows what went wrong above the buttons.
// With `submit`, Save is the form's submit button (the form's @submit saves); otherwise it emits `save`.
import { computed } from 'vue'
import VxButton from './VxButton.vue'
import VxCallout from '../feedback/VxCallout.vue'

const props = withDefaults(
  defineProps<{
    count: number
    saving?: boolean
    /** Save is blocked (e.g. a field is invalid) even with changes. */
    blocked?: boolean
    error?: string | null
    submit?: boolean
    saveLabel?: string
    undoLabel?: string
  }>(),
  { saving: false, blocked: false, error: null, submit: false, saveLabel: 'Save', undoLabel: 'Undo changes' },
)
defineEmits<{ save: []; undo: [] }>()
const status = computed(() =>
  props.count ? `${props.count} unsaved ${props.count === 1 ? 'change' : 'changes'}` : 'No changes',
)
</script>

<template>
  <div class="vx-savebar vx-panel" :class="{ 'is-on': count > 0 || error }">
    <VxCallout v-if="error" tone="error" title="Nothing was saved" class="vx-savebar-error">{{ error }}</VxCallout>
    <span class="vx-muted" role="status">{{ status }}</span>
    <span class="vx-savebar-gap"></span>
    <VxButton :disabled="!count || saving" @click="$emit('undo')">{{ undoLabel }}</VxButton>
    <VxButton
      variant="primary"
      :type="submit ? 'submit' : 'button'"
      :loading="saving"
      :disabled="!count || blocked"
      @click="submit || $emit('save')"
    >{{ saveLabel }}</VxButton>
  </div>
</template>
