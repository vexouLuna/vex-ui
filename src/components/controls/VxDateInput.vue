<script setup lang="ts">
// A date typed as text (`YYYY-MM-DD`), or with `time` a date and 24-hour time (`YYYY-MM-DD HH:mm`), with a calendar
// button. Typing and pasting work like any text field; the value changes once the text is a whole, real date
// (two-digit month and day), and on blur or Enter the text is tidied (`2026/9/1` → `2026-09-01`) or marked
// invalid. The value has the native inputs' shape (`2026-10-23`, `2026-10-23T14:05`; empty string for none), so it drops in for `type=date` and
// `datetime-local`. Picking a day keeps the time; with `time`, the field then selects the time to type over.
// Attributes (aria-label, id, @blur, ...) go to the text input; class and style stay on the wrapper.
import { computed, nextTick, ref, useAttrs, watch, type StyleValue } from 'vue'
import { isoDate, monthGrid, parseDate, showDate } from '../../utils/date'
import VxPopover from '../overlays/VxPopover.vue'

defineOptions({ inheritAttrs: false })

const props = withDefaults(
  defineProps<{
    /** Date and time (`YYYY-MM-DDTHH:mm`) rather than a date. */
    time?: boolean
    /** Earliest and latest allowed value, in the same shape as the value. */
    min?: string
    max?: string
    placeholder?: string
    invalid?: boolean
    disabled?: boolean
  }>(),
  { time: false, invalid: false, disabled: false },
)
const model = defineModel<string>({ default: '' })
const attrs = useAttrs()
const inputAttrs = computed(() => {
  const { class: _class, style: _style, ...rest } = attrs
  return rest
})

const text = ref(showDate(model.value))
const bad = ref(false)
const input = ref<HTMLInputElement | null>(null)
watch(model, (v) => {
  if (parseDate(text.value, props.time) !== v) text.value = showDate(v)
  bad.value = false
})

const inRange = (v: string) => (!props.min || v >= props.min) && (!props.max || v <= props.max)
/** The text's value if it's a whole, allowed date; '' when blank; null otherwise. */
function read(t: string): string | null {
  const v = parseDate(t, props.time)
  return v === null || (v && !inRange(v)) ? null : v
}
const whole = computed(() => (props.time ? /^\d{4}\D\d\d\D\d\d[ T]\d\d:\d\d/ : /^\d{4}\D\d\d\D\d\d$/))

function onInput(e: Event) {
  text.value = (e.target as HTMLInputElement).value
  const v = read(text.value)
  // Only a finished date updates the value, so "2026-10-2" on the way to "2026-10-24" isn't taken as the 2nd.
  if (v === '' || (v !== null && whole.value.test(text.value.trim()))) model.value = v
  bad.value = false
}
function commit() {
  const v = read(text.value)
  if (v === null) {
    bad.value = true
    return
  }
  model.value = v
  text.value = showDate(v)
  bad.value = false
}

// Calendar
const day = computed(() => model.value.slice(0, 10))
const shown = ref({ y: 0, m: 0 })
const focusDay = ref('')
const grid = computed(() => monthGrid(shown.value.y, shown.value.m))
const monthName = computed(() =>
  new Date(shown.value.y, shown.value.m, 1).toLocaleDateString('en', { month: 'long', year: 'numeric' }),
)
const today = () => isoDate(new Date())
const dayAllowed = (d: string) => (!props.min || d >= props.min.slice(0, 10)) && (!props.max || d <= props.max.slice(0, 10))
const panel = ref<HTMLElement | null>(null)

function onOpen() {
  const start = day.value || today()
  shown.value = { y: +start.slice(0, 4), m: +start.slice(5, 7) - 1 }
  focusDay.value = start // VxPopover focuses its [autofocus] once placed
}
function step(months: number) {
  const d = new Date(shown.value.y, shown.value.m + months, 1)
  shown.value = { y: d.getFullYear(), m: d.getMonth() }
}
function moveFocus(days: number) {
  const [y, m, d] = focusDay.value.split('-').map(Number)
  const n = new Date(y!, m! - 1, d! + days)
  focusDay.value = isoDate(n)
  if (n.getMonth() !== shown.value.m || n.getFullYear() !== shown.value.y) shown.value = { y: n.getFullYear(), m: n.getMonth() }
  nextTick(() => panel.value?.querySelector<HTMLElement>('.vx-cal-day[tabindex="0"]')?.focus())
}
const keys: Record<string, number> = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 }
function onGridKey(e: KeyboardEvent) {
  if (!(e.key in keys)) return
  e.preventDefault()
  moveFocus(keys[e.key]!)
}
async function pick(d: string, close: () => void) {
  if (!dayAllowed(d)) return
  const v = props.time ? `${d}T${model.value.slice(11, 16) || '00:00'}` : d
  model.value = props.min && v < props.min ? props.min : props.max && v > props.max ? props.max : v
  close()
  await nextTick()
  input.value?.focus()
  if (props.time) input.value?.setSelectionRange(11, 16)
}
</script>

<template>
  <span
    class="vx-date-input vx-input-wrap has-clear"
    :class="attrs.class"
    :style="attrs.style as StyleValue"
  >
    <input
      v-bind="inputAttrs"
      ref="input"
      class="vx-input vx-mono"
      :class="{ 'is-invalid': invalid || bad }"
      type="text"
      inputmode="numeric"
      autocomplete="off"
      spellcheck="false"
      :value="text"
      :placeholder="placeholder ?? (time ? 'YYYY-MM-DD HH:mm' : 'YYYY-MM-DD')"
      :disabled="disabled"
      :aria-invalid="invalid || bad || undefined"
      @input="onInput"
      @change="commit"
      @keydown.enter="commit"
    />
    <VxPopover class="vx-input-clear" align="right" width="252px" role="dialog" @open="onOpen">
      <template #trigger="{ toggle, open }">
        <button
          type="button"
          class="vx-btn is-ghost is-icon is-sm"
          :disabled="disabled"
          :aria-expanded="open"
          aria-haspopup="dialog"
          aria-label="Choose from a calendar"
          title="Calendar"
          @click="toggle"
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
            <rect x="2" y="3" width="12" height="11" rx="1.5" /><path d="M2 6.5h12M5.5 1.5v3M10.5 1.5v3" />
          </svg>
        </button>
      </template>
      <template #default="{ close }">
        <div ref="panel" class="vx-cal">
          <div class="vx-cal-head">
            <button type="button" class="vx-btn is-ghost is-icon is-sm" aria-label="Previous month" @click="step(-1)">‹</button>
            <span class="vx-cal-month" aria-live="polite">{{ monthName }}</span>
            <button type="button" class="vx-btn is-ghost is-icon is-sm" aria-label="Next month" @click="step(1)">›</button>
          </div>
          <div class="vx-cal-grid" role="group" :aria-label="monthName" @keydown="onGridKey">
            <span v-for="w in ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su']" :key="w" class="vx-cal-wd" aria-hidden="true">{{ w }}</span>
            <button
              v-for="c in grid"
              :key="c.date"
              type="button"
              class="vx-cal-day"
              :class="{ 'is-out': !c.inMonth, 'is-today': c.date === today(), 'is-picked': c.date === day }"
              :tabindex="c.date === focusDay ? 0 : -1"
              :autofocus="c.date === focusDay"
              :disabled="!dayAllowed(c.date)"
              :aria-label="c.date"
              :aria-pressed="c.date === day"
              @click="pick(c.date, close)"
            >{{ c.day }}</button>
          </div>
        </div>
      </template>
    </VxPopover>
  </span>
</template>
