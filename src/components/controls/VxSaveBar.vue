<script setup lang="ts">
// The bar under a settings form: "N unsaved changes", Undo and Save. It sticks to the bottom of the screen while the
// form scrolls, and lights up while there's something to save. `error` shows what went wrong above the buttons.
// With `submit`, Save is the form's submit button (the form's @submit saves); otherwise it emits `save`.
// The words are props: `saveLabel`, `undoLabel` (e.g. "Reset"), `errorTitle`, and `statusText` for the count line.
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
    errorTitle?: string
    /** The status line for a number of changes (0 included). */
    statusText?: (count: number) => string
  }>(),
  {
    saving: false,
    blocked: false,
    error: null,
    submit: false,
    saveLabel: 'Save',
    undoLabel: 'Undo changes',
    errorTitle: 'Nothing was saved',
    statusText: (n: number) => (n ? `${n} unsaved ${n === 1 ? 'change' : 'changes'}` : 'No changes'),
  },
)
defineEmits<{ save: []; undo: [] }>()
const status = computed(() => props.statusText(props.count))
</script>

<template>
  <div class="vx-savebar vx-panel" :class="{ 'is-on': count > 0 || error }">
    <VxCallout v-if="error" tone="error" :title="errorTitle" class="vx-savebar-error">{{ error }}</VxCallout>
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
