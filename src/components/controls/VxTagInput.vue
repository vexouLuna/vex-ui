<script setup lang="ts">
// Chips plus a text input: picks values from `options` (a combobox), or takes free text with `allowNew`, so it also
// works as a plain list-of-values input. `locked` chips come first, can't be removed and aren't in the model.
// Typing filters the options (prefix matches, then substring); ↑/↓ move, Enter or Tab picks, Esc closes; comma or
// Enter adds free text. Backspace in the empty input selects the last removable chip, a second press removes it.
import { computed, ref, useId, watch } from 'vue'
import type { LockedTag, TagOption } from '../../types'
import VxPopover from '../overlays/VxPopover.vue'
import VxTooltip from '../overlays/VxTooltip.vue'

const props = withDefaults(
  defineProps<{
    options?: TagOption[]
    locked?: LockedTag[]
    /** Accept values that aren't in `options` (typed, then comma or Enter). */
    allowNew?: boolean
    /** Checks a new value; returns the reason it's refused, or null. */
    validate?: (v: string) => string | null
    /** At most this many removable values. */
    max?: number
    placeholder?: string
    disabled?: boolean
    invalid?: boolean
    id?: string
  }>(),
  { options: () => [], locked: () => [], allowNew: false, disabled: false, invalid: false },
)
const model = defineModel<string[]>({ default: () => [] })

const uid = useId()
const listId = `${uid}-list`
const errId = `${uid}-err`
const input = ref<HTMLInputElement | null>(null)
const pop = ref<InstanceType<typeof VxPopover> | null>(null)
const text = ref('')
const open = ref(false)
const active = ref(-1)
/** Index into the model of the chip a first Backspace selected. */
const marked = ref(-1)
const error = ref('')
const status = ref('')

const byValue = computed(() => new Map(props.options.map((o) => [o.value, o])))
const labelOf = (v: string) => byValue.value.get(v)?.label ?? v
const taken = computed(() => new Set([...model.value, ...props.locked.map((l) => l.value)]))
const full = computed(() => props.max != null && model.value.length >= props.max)

const matches = computed(() => {
  const q = text.value.trim().toLowerCase()
  const free = props.options.filter((o) => !taken.value.has(o.value))
  if (!q) return free
  const hay = (o: TagOption) => [o.value, o.label ?? ''].map((s) => s.toLowerCase())
  const prefix = free.filter((o) => hay(o).some((s) => s.startsWith(q)))
  const rest = free.filter((o) => !prefix.includes(o) && hay(o).some((s) => s.includes(q)))
  return [...prefix, ...rest]
})
const expanded = computed(() => open.value && !full.value && matches.value.length > 0)
const optId = (i: number) => `${uid}-opt-${i}`

watch(expanded, (on) => (on ? pop.value?.open() : pop.value?.close()))
watch(matches, () => {
  // Free text must stay addable with Enter, so only auto-highlight when it isn't allowed.
  active.value = !props.allowNew && text.value.trim() && matches.value.length ? 0 : -1
})

// Adds each value in order, stops at the first refused one and returns its index (-1: all added). One model write,
// since the model only updates after the parent re-renders.
function add(...raws: string[]) {
  const next = [...model.value]
  const has = (v: string) => next.includes(v) || props.locked.some((l) => l.value === v)
  const refuse = (why: string) => ((error.value = why), false)
  const one = (raw: string) => {
    const t = raw.trim()
    if (!t) return true
    const known = props.options.find((o) => [o.value, o.label].some((s) => s?.toLowerCase() === t.toLowerCase()))
    const v = known?.value ?? t
    if (has(v)) return refuse(`${labelOf(v)} is already added.`)
    if (props.max != null && next.length >= props.max) return refuse(`At most ${props.max}.`)
    if (!known) {
      if (!props.allowNew) return false
      const why = props.validate?.(v)
      if (why) return refuse(why)
    }
    next.push(v)
    return true
  }
  const refused = raws.findIndex((r) => !one(r))
  if (next.length > model.value.length) {
    status.value = `Added ${next.slice(model.value.length).map(labelOf).join(', ')}.`
    model.value = next
  }
  if (refused < 0) error.value = ''
  return refused
}
function pick(o: TagOption) {
  if (add(o.value) < 0) text.value = ''
  input.value?.focus()
}
function remove(i: number) {
  const v = model.value[i]
  model.value = model.value.filter((_, j) => j !== i)
  marked.value = -1
  status.value = `Removed ${labelOf(v)}.`
  input.value?.focus()
}

function onInput() {
  error.value = ''
  marked.value = -1
  open.value = true
  // A pasted "a, b, c" adds each part; whatever follows the last comma stays as text.
  if (props.allowNew && text.value.includes(',')) {
    const parts = text.value.split(',')
    const tail = parts.pop() ?? ''
    const refused = add(...parts)
    text.value = refused < 0 ? tail : [...parts.slice(refused), tail].join(',')
  }
}

function onKey(e: KeyboardEvent) {
  if (e.key !== 'Backspace') marked.value = -1
  const n = matches.value.length
  switch (e.key) {
    case 'ArrowDown':
    case 'ArrowUp':
      e.preventDefault()
      if (!n) break
      if (!expanded.value) {
        open.value = true
        active.value = e.key === 'ArrowDown' ? 0 : n - 1
      } else if (e.key === 'ArrowDown') active.value = (active.value + 1) % n
      else active.value = active.value <= 0 ? n - 1 : active.value - 1
      break
    case 'Enter':
    case 'Tab':
      if (expanded.value && active.value >= 0) {
        e.preventDefault()
        pick(matches.value[active.value])
      } else if (e.key === 'Enter' && props.allowNew && text.value.trim()) {
        e.preventDefault()
        if (add(text.value) < 0) text.value = ''
      }
      break
    case ',':
      if (props.allowNew) {
        e.preventDefault()
        if (add(text.value) < 0) text.value = ''
      }
      break
    case 'Escape':
      if (expanded.value) e.stopPropagation()
      open.value = false
      break
    case 'Backspace':
      if (text.value || !model.value.length) break
      e.preventDefault()
      if (marked.value === model.value.length - 1) remove(marked.value)
      else {
        marked.value = model.value.length - 1
        status.value = `${labelOf(model.value[marked.value])} selected. Press Backspace again to remove it.`
      }
      break
  }
}

function focusBox(e: MouseEvent) {
  if (props.disabled || (e.target as HTMLElement).closest('button')) return
  input.value?.focus()
  open.value = true
}
defineExpose({ focus: () => input.value?.focus() })
</script>

<template>
  <div class="vx-tag-field">
    <VxPopover ref="pop" class="is-fill vx-tag-pop" width="100%" role="listbox" :panel-id="listId" @close="open = false">
      <template #trigger>
        <div
          class="vx-tag-input"
          :class="{ 'is-invalid': invalid || !!error, 'is-disabled': disabled }"
          @click="focusBox"
        >
          <ul class="vx-tag-chips" role="list">
            <li v-for="l in locked" :key="`l-${l.value}`">
              <component :is="l.title ? VxTooltip : 'span'" v-bind="l.title ? { text: l.title } : {}">
                <span class="vx-chip vx-tag is-locked" :class="l.tone && l.tone !== 'default' && `is-${l.tone}`">
                  {{ l.label ?? labelOf(l.value) }}
                  <span class="vx-tag-lock" aria-hidden="true">🔒</span>
                  <span class="vx-sr-only">(locked{{ l.title ? `: ${l.title}` : '' }})</span>
                </span>
              </component>
            </li>
            <li v-for="(v, i) in model" :key="v">
              <span class="vx-chip vx-tag" :class="{ 'is-marked': marked === i }">
                <span v-if="byValue.get(v)?.color" class="vx-tag-dot" :style="{ background: byValue.get(v)?.color }"></span>
                {{ labelOf(v) }}
                <button
                  type="button"
                  class="vx-tag-x"
                  :aria-label="`Remove ${labelOf(v)}`"
                  :title="`Remove ${labelOf(v)}`"
                  :disabled="disabled"
                  @click="remove(i)"
                >✕</button>
              </span>
            </li>
          </ul>
          <input
            :id="id"
            ref="input"
            v-model="text"
            class="vx-tag-text"
            type="text"
            role="combobox"
            autocomplete="off"
            aria-autocomplete="list"
            :aria-expanded="expanded"
            :aria-controls="listId"
            :aria-activedescendant="expanded && active >= 0 ? optId(active) : undefined"
            :aria-invalid="invalid || !!error || undefined"
            :aria-describedby="error ? errId : undefined"
            :placeholder="full ? '' : placeholder"
            :disabled="disabled"
            @input="onInput"
            @keydown="onKey"
            @blur="marked = -1"
          />
        </div>
      </template>
      <div
        v-for="(o, i) in matches"
        :id="optId(i)"
        :key="o.value"
        class="vx-menu-item"
        :class="{ 'is-active': i === active }"
        role="option"
        :aria-selected="i === active"
        @mousedown.prevent
        @click="pick(o)"
        @pointermove="active = i"
      >
        <span v-if="o.color" class="vx-tag-dot" :style="{ background: o.color }"></span>
        <span class="vx-menu-main">{{ o.label ?? o.value }}</span>
        <span v-if="o.hint" class="vx-menu-sub">{{ o.hint }}</span>
      </div>
    </VxPopover>
    <span v-if="error" :id="errId" class="vx-field-error" role="alert">{{ error }}</span>
    <span class="vx-sr-only" aria-live="polite">{{ status }}</span>
  </div>
</template>
