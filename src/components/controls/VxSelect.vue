<script setup lang="ts" generic="T extends string | number">
// Dropdown select built on VxPopover, so it opens towards free space and scrolls like every other menu.
// Keyboard: a select-only combobox (WAI-ARIA APG). Focus stays on the trigger; arrows, Home/End and typing move the
// highlighted option (aria-activedescendant), Enter or Space picks it, Escape closes.
import { computed, nextTick, ref, useId } from 'vue'
import type { Option } from '../../types'
import VxMenuItem from '../overlays/VxMenuItem.vue'
import VxPopover from '../overlays/VxPopover.vue'

const props = withDefaults(
  defineProps<{
    options: Option<T>[]
    placeholder?: string
    size?: 'md' | 'sm'
    /** The list's width; a percentage makes the select fill its container, and the list that share of it. */
    width?: string
    prefer?: 'up' | 'down'
    align?: 'left' | 'right'
    disabled?: boolean
    id?: string
  }>(),
  { placeholder: 'Choose…', size: 'md', width: '220px', prefer: 'down', align: 'left', disabled: false },
)
const model = defineModel<T>()
const current = computed(() => props.options.find((o) => o.value === model.value))
const fill = computed(() => props.width.endsWith('%'))

const listId = useId()
const optionId = (i: number) => `${listId}-${i}`
const pop = ref<InstanceType<typeof VxPopover> | null>(null)
const trigger = ref<HTMLButtonElement | null>(null)
const isOpen = ref(false)
const active = ref(-1)

const enabled = computed(() => props.options.flatMap((o, i) => (o.disabled ? [] : [i])))

// Type-ahead: letters typed within half a second build one prefix; a repeated single letter cycles its matches.
let typed = ''
let typedAt = 0

function highlight(i: number) {
  active.value = i
  nextTick(() => document.getElementById(optionId(i))?.scrollIntoView({ block: 'nearest' }))
}
function onOpen() {
  isOpen.value = true
  typed = ''
  const i = props.options.findIndex((o) => o.value === model.value && !o.disabled)
  highlight(i >= 0 ? i : (enabled.value[0] ?? -1))
}
function pick(o: Option<T>) {
  if (o.disabled) return
  model.value = o.value
  pop.value?.close()
  trigger.value?.focus()
}
// The next enabled option `step` places away from the highlighted one, stopping at the ends.
function moveBy(step: number) {
  const list = enabled.value
  if (!list.length) return
  const at = list.indexOf(active.value)
  const next = at < 0 ? (step > 0 ? 0 : list.length - 1) : Math.min(list.length - 1, Math.max(0, at + step))
  highlight(list[next]!)
}

function typeAhead(ch: string) {
  const now = Date.now()
  typed = now - typedAt > 500 ? ch : typed + ch
  typedAt = now
  const prefix = typed.split('').every((c) => c === typed[0]) ? typed[0]! : typed
  const list = enabled.value
  const from = Math.max(0, list.indexOf(active.value) + (prefix.length === 1 ? 1 : 0))
  const order = [...list.slice(from), ...list.slice(0, from)]
  const hit = order.find((i) => props.options[i]!.label.toLowerCase().startsWith(prefix.toLowerCase()))
  if (hit !== undefined) highlight(hit)
}

async function onKey(e: KeyboardEvent) {
  const open = isOpen.value
  const key = e.key
  if (key.length === 1 && key !== ' ' && !e.ctrlKey && !e.metaKey && !e.altKey) {
    e.preventDefault()
    if (!open) await pop.value?.open()
    typeAhead(key)
    return
  }
  if (!open) {
    if (['ArrowDown', 'ArrowUp', 'Enter', ' ', 'Home', 'End'].includes(key)) {
      e.preventDefault()
      await pop.value?.open()
      const list = enabled.value
      if (key === 'Home') highlight(list[0] ?? -1)
      else if (key === 'End' || (key === 'ArrowUp' && !current.value)) highlight(list.at(-1) ?? -1)
    }
    return
  }
  const page = 10
  const moves: Record<string, () => void> = {
    ArrowDown: () => moveBy(1),
    ArrowUp: () => moveBy(-1),
    PageDown: () => moveBy(page),
    PageUp: () => moveBy(-page),
    Home: () => highlight(enabled.value[0] ?? -1),
    End: () => highlight(enabled.value.at(-1) ?? -1),
  }
  if (moves[key]) {
    e.preventDefault()
    moves[key]()
  } else if (key === 'Enter' || key === ' ') {
    e.preventDefault()
    const o = props.options[active.value]
    if (o) pick(o)
    else pop.value?.close()
  } else if (key === 'Escape') {
    // Only the list closes, not a dialog the select sits in.
    e.preventDefault()
    e.stopPropagation()
    pop.value?.close()
  } else if (key === 'Tab') {
    pop.value?.close()
  }
}
</script>

<template>
  <VxPopover
    ref="pop"
    :class="{ 'is-fill': fill }"
    :prefer="prefer"
    :align="align"
    :width="width"
    role="listbox"
    :panel-id="listId"
    @open="onOpen"
    @close="isOpen = false"
  >
    <template #trigger="{ toggle, open }">
      <button
        :id="id"
        ref="trigger"
        type="button"
        class="vx-btn vx-select"
        :class="{ 'is-sm': size === 'sm', 'is-fill': fill }"
        :disabled="disabled"
        role="combobox"
        aria-haspopup="listbox"
        :aria-expanded="open"
        :aria-controls="open ? listId : undefined"
        :aria-activedescendant="open && active >= 0 ? optionId(active) : undefined"
        @click="toggle"
        @keydown="onKey"
        @keyup.space.prevent
      >
        <span :class="{ 'vx-muted': !current }">{{ current?.label ?? placeholder }}</span>
        <span class="vx-caret" aria-hidden="true">▾</span>
      </button>
    </template>
    <VxMenuItem
      v-for="(o, i) in options"
      :id="optionId(i)"
      :key="String(o.value)"
      role="option"
      tabindex="-1"
      :class="{ 'is-active': i === active }"
      :aria-selected="o.value === model"
      :current="o.value === model"
      :sub="o.sub"
      :disabled="o.disabled"
      :title="o.title"
      @click="pick(o)"
      @pointermove="!o.disabled && (active = i)"
    >{{ o.label }}</VxMenuItem>
  </VxPopover>
</template>
