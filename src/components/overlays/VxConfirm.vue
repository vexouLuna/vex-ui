<script setup lang="ts">
// "Are you sure?" on VxDialog: what happens in the body, Cancel and the confirming button. It stays open while
// `loading` (the page closes it when the work is done), and can't be dismissed then. `confirmText` asks for that
// text to be typed first (a name or id), for what can't be undone; `confirmIgnoreCase` accepts it in any case (a login).
//   <VxConfirm v-model:open="del" title="Delete this VOD?" confirm-label="Delete" tone="danger" :confirm-text="vod.id"
//     :loading="busy" @confirm="remove">Removes it with its chat. This can't be undone.</VxConfirm>
import { computed, ref, useId, watch } from 'vue'
import VxButton from '../controls/VxButton.vue'
import VxInput from '../controls/VxInput.vue'
import VxDialog from './VxDialog.vue'

const props = withDefaults(
  defineProps<{
    title: string
    confirmLabel?: string
    cancelLabel?: string
    tone?: 'default' | 'danger'
    loading?: boolean
    /** Text to type before confirming. */
    confirmText?: string
    /** Accept the typed text in any case. */
    confirmIgnoreCase?: boolean
    width?: string
  }>(),
  { confirmLabel: 'Confirm', cancelLabel: 'Cancel', tone: 'default', loading: false, confirmIgnoreCase: false, width: '420px' },
)
const open = defineModel<boolean>('open', { default: false })
const emit = defineEmits<{ confirm: [] }>()
const typed = ref('')
const id = useId()
watch(open, () => (typed.value = ''))
const same = (a: string, b: string) => (props.confirmIgnoreCase ? a.toLowerCase() === b.toLowerCase() : a === b)
const ready = computed(() => !props.confirmText || same(typed.value.trim(), props.confirmText))

function confirm() {
  if (ready.value && !props.loading) emit('confirm')
}
</script>

<template>
  <VxDialog v-model:open="open" :title="title" :width="width" :dismissable="!loading">
    <slot></slot>
    <form v-if="confirmText" class="vx-confirm-type" @submit.prevent="confirm">
      <label :for="id">Type <code class="vx-mono">{{ confirmText }}</code> to confirm.</label>
      <VxInput :id="id" v-model="typed" mono autocomplete="off" spellcheck="false" :disabled="loading" />
    </form>
    <template #actions="{ close }">
      <VxButton :disabled="loading" @click="close">{{ cancelLabel }}</VxButton>
      <VxButton
        :variant="tone === 'danger' ? 'danger-solid' : 'primary'"
        :disabled="!ready"
        :loading="loading"
        @click="confirm"
      >{{ confirmLabel }}</VxButton>
    </template>
  </VxDialog>
</template>
