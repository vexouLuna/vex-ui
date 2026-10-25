<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { VxButton, VxNavBar, VxPageHead, VxPagination, VxSegmented, VxSelect, VxStatusDot, VxTabs } from '../../src'
import StoryFrame from '../StoryFrame.vue'

const s = reactive({ tab: 'overview', many: 'settings', view: 'grid', page: 3, total: 54 })
const tabs = ['overview', 'modules', 'publications', 'filters', 'triggers', 'timers'].map((v) => ({ value: v, label: v[0]!.toUpperCase() + v.slice(1) }))
const many = ['settings', 'modules', 'commands', 'published', 'triggers & timers', 'replies', 'word filter', 'roles', 'variables', 'runs', 'chat log', 'audit', 'ignored'].map((v) => ({ value: v, label: v[0]!.toUpperCase() + v.slice(1) }))
const at = ref('audit')
const links = computed(() =>
  ['overview', 'me', 'explain', 'audit', 'jobs', 'bot'].map((v) => ({ label: v[0]!.toUpperCase() + v.slice(1), href: `#${v}`, current: at.value === v })),
)
const channel = ref('vexouluna')
/** The story has no router: follow the #links by hand. */
function go(e: MouseEvent) {
  const href = (e.target as HTMLElement).closest('a')?.getAttribute('href')
  if (!href) return
  e.preventDefault()
  at.value = href.slice(1)
}
</script>

<template>
  <Story title="Navigation" group="controls">
    <Variant title="Tabs">
      <StoryFrame site="dtp">
        <VxTabs v-model="s.tab" :options="tabs" label="Channel sections" />
        <p class="story-note">{{ s.tab }} · arrow keys move between tabs; scrolls sideways when narrow</p>
      </StoryFrame>
    </Variant>
    <Variant title="Tabs, more than fit">
      <StoryFrame site="dtp">
        <div style="max-width: 520px"><VxTabs v-model="s.many" :options="many" label="Channel sections" /></div>
        <p class="story-note">{{ s.many }} · the side with more fades under an arrow that scrolls it</p>
      </StoryFrame>
    </Variant>
    <Variant title="Segmented">
      <StoryFrame>
        <VxSegmented v-model="s.view" :options="[{ value: 'grid', label: 'Grid' }, { value: 'list', label: 'List' }]" label="View" />
      </StoryFrame>
    </Variant>
    <Variant title="Pagination">
      <StoryFrame site="vods">
        <VxPagination v-model="s.page" :total="s.total" />
        <p class="story-note">page {{ s.page }} of {{ s.total }} · same width on every page</p>
      </StoryFrame>
      <template #controls>
        <HstNumber v-model="s.total" title="Total pages" />
      </template>
    </Variant>
    <Variant title="Section nav, page head, facts">
      <!-- VxNavBar marks the `current` link the page says; #lead and #trail take a picker and who's signed in. -->
      <StoryFrame site="dtp">
        <VxNavBar :links="links" label="Manage" title="Manage" @click.capture="go">
          <template #lead>
            <VxSelect v-model="channel" :options="[{ value: 'vexouluna', label: '#vexouluna' }, { value: 'keeki_dechu', label: '#keeki_dechu' }]" size="sm" width="170px" aria-label="Channel to manage" />
          </template>
          <template #trail><span class="vx-mono">@vexouluna · bot admin</span></template>
        </VxNavBar>
        <VxPageHead eyebrow="Manage" title="Audit">
          Who changed what, newest first.
          <template #actions><VxButton size="sm">Export</VxButton><VxButton size="sm" variant="primary">Filter</VxButton></template>
        </VxPageHead>
        <dl class="vx-facts">
          <div><dt>Status</dt><dd><VxStatusDot status="ok">up</VxStatusDot></dd></div>
          <div><dt>Started</dt><dd class="vx-mono">2026-10-23 14:05</dd></div>
          <div><dt>Duration</dt><dd class="vx-mono">3:12:44</dd></div>
          <div><dt>Parts</dt><dd>4</dd></div>
        </dl>
        <dl class="vx-facts is-inline" style="margin-top: 16px">
          <div><dt>response</dt><dd class="vx-mono">212 ms</dd></div>
          <div><dt>status</dt><dd class="vx-mono">200</dd></div>
          <div><dt>why</dt><dd>body didn't match</dd></div>
        </dl>
      </StoryFrame>
    </Variant>
  </Story>
</template>
