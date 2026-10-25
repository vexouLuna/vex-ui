<script setup lang="ts">
// Whatever a section shows while its data isn't there: the error with "Try again", skeleton rows while loading,
// or the empty state once loaded with nothing in it. The content (default slot) shows only once there's data.
//   <VxLoadState :error="error" :loading="!data" :empty="!data?.items.length" @retry="reload">…</VxLoadState>
// `#loading` and `#empty` replace the stand-ins; `errorText` turns the error into words (default: its message).
// `stale` says older data is still there: a failed refresh then keeps the content, with a warning and Try again above.
//   <VxLoadState :error="error" :stale="!!data" :loading="!data" @retry="reload">…</VxLoadState>
import VxButton from '../controls/VxButton.vue'
import VxCallout from './VxCallout.vue'
import VxEmptyState from './VxEmptyState.vue'
import VxSkeleton from './VxSkeleton.vue'

withDefaults(
  defineProps<{
    error?: unknown
    loading?: boolean
    empty?: boolean
    /** The error's title: "Couldn't load …". */
    errorTitle?: string
    errorText?: (e: unknown) => string
    /** There's older data to keep showing when `error` is set. */
    stale?: boolean
    /** The warning's title then: "Couldn't refresh …". */
    staleTitle?: string
    /** Skeleton rows while loading, and their height. */
    rows?: number
    rowHeight?: string
    emptyTitle?: string
    emptyText?: string
  }>(),
  {
    loading: false,
    empty: false,
    errorTitle: "Couldn't load this",
    errorText: (e: unknown) => (e instanceof Error ? e.message : String(e)),
    stale: false,
    staleTitle: "Couldn't refresh, showing older data",
    rows: 4,
    rowHeight: '38px',
    emptyTitle: 'Nothing here yet',
  },
)
defineEmits<{ retry: [] }>()
</script>

<template>
  <template v-if="error && stale">
    <VxCallout tone="warn" :title="staleTitle" class="vx-load-stale">
      {{ errorText(error) }}
      <template #actions><VxButton size="sm" @click="$emit('retry')">Try again</VxButton></template>
    </VxCallout>
    <slot></slot>
  </template>
  <VxCallout v-else-if="error" tone="error" :title="errorTitle">
    {{ errorText(error) }}
    <template #actions><VxButton size="sm" @click="$emit('retry')">Try again</VxButton></template>
  </VxCallout>
  <div v-else-if="loading" class="vx-load-rows" role="status" aria-busy="true" aria-label="Loading">
    <slot name="loading"><VxSkeleton v-for="i in rows" :key="i" :h="rowHeight" /></slot>
  </div>
  <slot v-else-if="empty" name="empty"><VxEmptyState :title="emptyTitle" :text="emptyText" /></slot>
  <slot v-else></slot>
</template>
