<script setup lang="ts">
// "On this page": a table of contents built from the page's own headings, with scroll-spy (the heading you're
// reading is marked) and click-to-seek. Sticky beside the content on wide screens; a collapsible block above it on
// narrow ones. Put it next to the content in a two-column grid (see `.vx-toc-layout`).
// Headings without an id get one from their text. Content that loads late is picked up as it appears.
import { onBeforeUnmount, onMounted, ref } from 'vue'

const props = withDefaults(
  defineProps<{
    /** Where to look for headings: a CSS selector. */
    scope?: string
    /** Which headings are listed, as a selector. */
    headings?: string
    title?: string
  }>(),
  { scope: '.vx-main', headings: 'h2, h3', title: 'On this page' },
)

interface Item { id: string; text: string; sub: boolean }
const items = ref<Item[]>([])
const active = ref('')
const open = ref(false)
let mutations: MutationObserver | null = null
let spy: IntersectionObserver | null = null
let heads: HTMLElement[] = []

const slug = (s: string) => s.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, '-').replace(/^-|-$/g, '') || 'section'

function scan() {
  const root = document.querySelector(props.scope)
  heads = root ? [...root.querySelectorAll<HTMLElement>(props.headings)].filter((h) => h.textContent?.trim()) : []
  const used = new Set<string>()
  for (const h of heads) {
    if (!h.id) {
      let id = slug(h.textContent ?? '')
      for (let n = 2; used.has(id) || document.getElementById(id); n++) id = `${slug(h.textContent ?? '')}-${n}`
      h.id = id
    }
    used.add(h.id)
  }
  items.value = heads.map((h) => ({ id: h.id, text: (h.textContent ?? '').trim(), sub: h.tagName === 'H3' }))
  spy?.disconnect()
  spy = new IntersectionObserver(
    () => {
      // The last heading that has scrolled above 30% of the viewport is the one being read.
      const line = window.innerHeight * 0.3
      active.value = [...heads].reverse().find((h) => h.getBoundingClientRect().top <= line)?.id ?? heads[0]?.id ?? ''
    },
    { rootMargin: '0px 0px -70% 0px', threshold: [0, 1] },
  )
  heads.forEach((h) => spy!.observe(h))
}

function seek(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' })
  history.replaceState(history.state, '', `#${id}`)
  active.value = id
  open.value = false
}

onMounted(() => {
  scan()
  const root = document.querySelector(props.scope)
  if (root) {
    mutations = new MutationObserver(() => {
      if (root.querySelectorAll(props.headings).length !== heads.length) scan()
    })
    mutations.observe(root, { childList: true, subtree: true })
  }
})
onBeforeUnmount(() => {
  mutations?.disconnect()
  spy?.disconnect()
})
</script>

<template>
  <nav v-if="items.length" class="vx-toc" :class="{ 'is-open': open }" :aria-label="title">
    <button type="button" class="vx-toc-toggle vx-eyebrow" :aria-expanded="open" @click="open = !open">
      {{ title }}<span aria-hidden="true">{{ open ? '–' : '+' }}</span>
    </button>
    <p class="vx-toc-title vx-eyebrow">{{ title }}</p>
    <ol class="vx-scroll">
      <li v-for="item in items" :key="item.id">
        <a
          :href="`#${item.id}`"
          :class="{ 'is-sub': item.sub, 'is-active': item.id === active }"
          :aria-current="item.id === active ? 'location' : undefined"
          @click.prevent="seek(item.id)"
        >{{ item.text }}</a>
      </li>
    </ol>
  </nav>
</template>

<style>
.vx-toc-layout { display: grid; grid-template-columns: minmax(0, 1fr) 15rem; gap: 32px; align-items: start; }
.vx-toc-layout > .vx-toc { grid-column: 2; grid-row: 1; }
.vx-toc-layout > :not(.vx-toc) { grid-column: 1; grid-row: 1; min-width: 0; }

.vx-toc { position: sticky; top: 64px; font-size: 13px; }
.vx-toc-toggle { display: none; }
.vx-toc-title { margin: 0 0 8px; }
.vx-toc ol { list-style: none; margin: 0; padding: 0 0 0 1px; max-height: calc(100dvh - 100px); overflow-y: auto; border-left: 1px solid var(--vx-line); }
.vx-toc a {
  display: block;
  margin-left: -1px;
  padding: 4px 10px;
  border-left: 2px solid transparent;
  color: var(--vx-muted);
  text-decoration: none;
  line-height: 1.35;
}
.vx-toc a.is-sub { padding-left: 22px; font-size: 12px; }
.vx-toc a:hover { color: var(--vx-ink); }
.vx-toc a.is-active { color: var(--vx-accent); border-left-color: var(--vx-accent); }

@media (max-width: 900px) {
  .vx-toc-layout { grid-template-columns: minmax(0, 1fr); gap: 16px; }
  .vx-toc-layout > .vx-toc, .vx-toc-layout > :not(.vx-toc) { grid-column: 1; grid-row: auto; }
  .vx-toc { position: static; border: 1px solid var(--vx-line); border-radius: var(--vx-radius-sm); }
  .vx-toc-toggle { display: flex; justify-content: space-between; width: 100%; padding: 0 12px; height: var(--vx-ctl); align-items: center; background: none; border: 0; cursor: pointer; }
  .vx-toc-title { display: none; }
  .vx-toc ol { display: none; max-height: 50dvh; margin: 0 12px 10px; }
  .vx-toc.is-open ol { display: block; }
}
</style>
