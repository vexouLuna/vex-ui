<script setup lang="ts" generic="Row extends object">
// Data table. On narrow sites every column stays and the table scrolls sideways (never hide columns).
// Custom cells: <template #cell-status="{ row, value, index }">, custom headers: #head-status, and #empty for the
// no-rows line. Sorting is local unless `manual` is set, in which case the page sorts (e.g. on the server) from
// v-model:sort. `rowKey` is a field name or a function of the row and its index (for keys made of several fields);
// `rowClass` marks rows. `wrap` lets cells wrap on narrow sites too (a `nowrap` column still doesn't); `headless`
// drops the header row (a list of pairs); `span` makes a row's cell take the next columns' room too, as colspan.
import { computed } from 'vue'
import type { SortState, TableColumn } from '../../types'

const props = withDefaults(
  defineProps<{
    columns: TableColumn[]
    rows: Row[]
    rowKey?: (keyof Row & string) | ((row: Row, index: number) => string | number)
    rowClass?: (row: Row) => string | Record<string, boolean> | undefined
    /** How many columns this row's cell in `column` covers (1 when unset); the covered columns' cells are skipped. */
    span?: (row: Row, column: TableColumn) => number | undefined
    wrap?: boolean
    headless?: boolean
    manual?: boolean
    empty?: string
    label?: string
  }>(),
  { wrap: false, headless: false, manual: false, empty: 'Nothing here yet.' },
)
const sort = defineModel<SortState | null>('sort', { default: null })

// `object` rather than `Record<string, unknown>` so interfaces fit; columns name fields by string.
const cell = (row: Row, key: string) => (row as Record<string, unknown>)[key]
const collator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' })
const sorted = computed(() => {
  const s = sort.value
  if (props.manual || !s) return props.rows
  const k = s.key
  const out = [...props.rows].sort((a, b) => {
    const x = cell(a, k), y = cell(b, k)
    if (typeof x === 'number' && typeof y === 'number') return x - y
    return collator.compare(String(x ?? ''), String(y ?? ''))
  })
  return s.dir === 'desc' ? out.reverse() : out
})

function toggle(c: TableColumn) {
  if (!c.sortable) return
  const s = sort.value
  sort.value = s?.key === c.key ? { key: c.key, dir: s.dir === 'asc' ? 'desc' : 'asc' } : { key: c.key, dir: 'asc' }
}
const ariaSort = (c: TableColumn) =>
  !c.sortable ? undefined : sort.value?.key === c.key ? (sort.value.dir === 'asc' ? 'ascending' : 'descending') : 'none'
const cellClass = (c: TableColumn) => [
  c.class,
  { 'is-right': c.align === 'right', 'is-mono': c.mono, 'is-muted': c.muted, 'is-nowrap': c.nowrap, 'is-wrap': c.wrap },
]
const keyOf = (row: Row, i: number) =>
  typeof props.rowKey === 'function' ? props.rowKey(row, i) : props.rowKey ? String(row[props.rowKey]) : i
function cellsOf(row: Row) {
  const out: { c: TableColumn; span: number }[] = []
  for (let i = 0; i < props.columns.length; ) {
    const c = props.columns[i]!
    const span = Math.min(Math.max(1, props.span?.(row, c) ?? 1), props.columns.length - i)
    out.push({ c, span })
    i += span
  }
  return out
}
</script>

<template>
  <div class="vx-table-wrap" tabindex="0" role="region" :aria-label="label ?? 'Table'">
    <table class="vx-table" :class="{ 'is-wrap': wrap }">
      <thead v-if="!headless">
        <tr>
          <th
            v-for="c in columns"
            :key="c.key"
            :class="[cellClass(c), { 'is-sortable': c.sortable }]"
            :style="{ width: c.width }"
            :aria-sort="ariaSort(c)"
            :tabindex="c.sortable ? 0 : undefined"
            scope="col"
            @click="toggle(c)"
            @keydown.enter.space.prevent="toggle(c)"
          ><slot :name="`head-${c.key}`" :column="c">{{ c.label }}</slot></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(row, i) in sorted" :key="keyOf(row, i)" :class="rowClass?.(row)">
          <td v-for="{ c, span: n } in cellsOf(row)" :key="c.key" :class="cellClass(c)" :colspan="n > 1 ? n : undefined">
            <slot :name="`cell-${c.key}`" :row="row" :value="cell(row, c.key)" :index="i">{{ cell(row, c.key) }}</slot>
          </td>
        </tr>
        <tr v-if="!rows.length">
          <td :colspan="columns.length" class="is-muted"><slot name="empty">{{ empty }}</slot></td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
