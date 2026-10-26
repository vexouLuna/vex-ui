<script setup lang="ts">
import { ref } from 'vue'
import { VxAvatar, VxButton, VxChip, VxStatTile, VxStatusDot, VxTable, VxUptimeBar } from '../../src'
import type { Health, SortState, UptimeTick } from '../../src'
import StoryFrame from '../StoryFrame.vue'

const sort = ref<SortState | null>({ key: 'date', dir: 'desc' })
const columns = [
  { key: 'title', label: 'Title', sortable: true },
  { key: 'date', label: 'Date', sortable: true, mono: true, muted: true },
  { key: 'games', label: 'Games', muted: true },
  { key: 'length', label: 'Length', sortable: true, mono: true, align: 'right' as const },
  { key: 'status', label: 'Status' },
  { key: 'actions', label: '', align: 'right' as const },
]
const rows = [
  { id: 1, title: 'subathon day 3', date: '2026-09-14', games: 'Just Chatting, Balatro, DOOM Eternal', length: '11:20:55', status: 'ok' },
  { id: 2, title: 'doom eternal nightmare any%', date: '2026-09-21', games: 'DOOM Eternal', length: '5:12:40', status: 'processing' },
  { id: 3, title: 'community game night', date: '2026-09-10', games: 'Jackbox, Among Us', length: '2:55:30', status: 'missing part' },
]
// doomtp's ignored-users table: a composite key, a prose column that wraps, an unlabelled actions column.
const ignoredColumns = [
  { key: 'user', label: 'User' },
  { key: 'by', label: 'Ignored by' },
  { key: 'when', label: 'When', muted: true, nowrap: true },
  { key: 'reason', label: 'Reason', muted: true, wrap: true },
  { key: 'actions', label: '', align: 'right' as const, nowrap: true },
]
// An interface, not a type alias: VxTable's row type takes either.
interface IgnoredUser {
  userId: string
  everywhere: boolean
  user: string
  by: string
  when: string
  reason: string
  self: boolean
}
const ignored = ref<IgnoredUser[]>([
  { userId: '1201', everywhere: false, user: '@spambot_9000', by: '@vexouluna', when: '3 h ago', reason: 'posting the same link in every chat for two days', self: false },
  { userId: '88', everywhere: true, user: '@quietviewer', by: 'themselves', when: '2026-09-02', reason: '', self: true },
])
// doomtp's triggers: long expressions that wrap on phones, and pack rows whose note spans the last two columns.
const triggerColumns = [
  { key: 'type', label: 'Type' },
  { key: 'expr', label: 'Expression', mono: true },
  { key: 'runAs', label: 'Runs as', muted: true, nowrap: true },
  { key: 'on', label: 'On' },
  { key: 'actions', label: '', align: 'right' as const, nowrap: true },
]
interface Trigger {
  id: string
  type: string
  expr: string
  runAs: string
  pack?: string
}
const triggers: Trigger[] = [
  { id: 't1', type: 'listener', expr: '/^!hello/ → say "hi {user.name}, welcome to the stream"', runAs: 'rank 10' },
  { id: 't2', type: 'timer', expr: 'every 15m: say "follow for more DOOM and fewer sleeping hours"', runAs: 'rank 50', pack: 'socials' },
]
const triggerSpan = (t: Trigger, c: { key: string }) => (t.pack && c.key === 'on' ? 2 : undefined)
const pairs = [
  { key: 'Owner', value: '@vexouluna' },
  { key: 'Admins', value: '@keeki_dechu, @someone_with_a_long_name' },
]
const filters = ref(['DOOM Eternal'])
// Fifty one-minute checks: a short outage, one slow check, and a newer service with only twenty.
const checks = (n: number, bad: (i: number) => Health | null): UptimeTick[] =>
  Array.from({ length: n }, (_, i) => {
    const status = bad(i) ?? 'ok'
    const time = `14:${String(10 + i).padStart(2, '0')}`
    return { status, label: status === 'down' ? `${time} · 502 · timed out` : `${time} · 200 · ${18 + ((i * 7) % 11)} ms` }
  })
const services = [
  { name: 'vexoul.net', ticks: checks(50, () => null) },
  { name: 'vods', ticks: checks(50, (i) => (i >= 31 && i <= 34 ? 'down' : i === 40 ? 'warn' : i === 41 ? 'caution' : null)) },
  { name: 'dtp', ticks: checks(20, (i) => (i === 19 ? 'down' : null)) },
]
const picked = ref<number | null>(33)
const toggle = (g: string) => (filters.value = filters.value.includes(g) ? filters.value.filter((x) => x !== g) : [...filters.value, g])
</script>

<template>
  <Story title="Data" group="data">
    <Variant title="Table">
      <StoryFrame site="dtp">
        <VxTable v-model:sort="sort" :columns="columns" :rows="rows" row-key="id" label="VODs">
          <template #cell-status="{ value }">
            <VxChip :tone="value === 'ok' ? 'ok' : value === 'processing' ? 'warn' : 'bad'">{{ value }}</VxChip>
          </template>
          <template #cell-actions>
            <VxButton size="sm" icon label="More">⋯</VxButton>
          </template>
        </VxTable>
        <p class="story-note">narrow sites keep every column; the table scrolls sideways</p>
      </StoryFrame>
    </Variant>
    <Variant title="Table: custom header, key, empty">
      <StoryFrame site="dtp">
        <VxTable
          :columns="ignoredColumns"
          :rows="ignored"
          :row-key="(u) => `${u.everywhere}${u.userId}`"
          :row-class="(u) => ({ 'is-muted': u.self })"
          label="Ignored users"
        >
          <template #head-actions><span class="story-note">actions</span></template>
          <template #cell-by="{ row, value }">
            <VxChip v-if="row.self" tone="accent">{{ value }}</VxChip>
            <span v-else>{{ value }}</span>
          </template>
          <template #cell-actions="{ row }">
            <VxButton size="sm" variant="ghost" @click="ignored = ignored.filter((u) => u !== row)">Unignore</VxButton>
          </template>
          <template #empty>Nobody is ignored here.</template>
        </VxTable>
        <p class="story-note">rows typed by an interface (<code>IgnoredUser</code>)</p>
      </StoryFrame>
    </Variant>
    <Variant title="Table: wrap on phones, spans, no header">
      <StoryFrame site="dtp">
        <VxTable :columns="triggerColumns" :rows="triggers" :row-key="(t, i) => `${t.id}:${i}`" :span="triggerSpan" wrap label="Triggers">
          <template #cell-on="{ row }">
            <span v-if="row.pack" class="story-note">From the {{ row.pack }} pack. Turn it off with its module.</span>
            <VxChip v-else tone="ok">on</VxChip>
          </template>
          <template #cell-actions><VxButton size="sm" variant="ghost">Edit</VxButton></template>
        </VxTable>
        <p class="story-note"><code>wrap</code>: cells wrap on narrow sites too (try ~390px); the pack row spans On and the actions</p>
        <VxTable :columns="[{ key: 'key', label: 'Role', muted: true, nowrap: true }, { key: 'value', label: 'Who' }]" :rows="pairs" row-key="key" headless wrap label="Bot admins" />
        <p class="story-note"><code>headless</code>: no header row</p>
      </StoryFrame>
    </Variant>
    <Variant title="Chips & status">
      <StoryFrame site="vods">
        <div class="story-col">
          <div class="story-row">
            <VxChip>default</VxChip>
            <VxChip tone="accent">accent</VxChip>
            <VxChip tone="ok">ok</VxChip>
            <VxChip tone="warn">warn</VxChip>
            <VxChip tone="bad">bad</VxChip>
            <VxChip live />
            <VxChip k="game">DOOM Eternal</VxChip>
          </div>
          <div class="story-row">
            <VxChip v-for="g in ['DOOM Eternal', 'Balatro', 'Hollow Knight']" :key="g" clickable :active="filters.includes(g)" @click="toggle(g)">{{ g }}</VxChip>
          </div>
          <div class="story-row">
            <VxStatusDot status="live" label="Live now" />
            <VxStatusDot status="ok" label="Connected" />
            <VxStatusDot status="warn" label="Degraded" />
            <VxStatusDot status="down" label="Down" />
            <VxStatusDot status="off" label="Offline" />
          </div>
          <!-- size="lg": the dot beside a page title; the label takes the heading's size. -->
          <h1 style="margin: 0"><VxStatusDot size="lg" status="ok" label="All systems normal" /></h1>
          <h1 style="margin: 0"><VxStatusDot size="lg" status="live" label="Live now" /></h1>
        </div>
      </StoryFrame>
    </Variant>
    <Variant title="Uptime bar">
      <StoryFrame site="status">
        <div class="story-col" style="padding-top: 28px">
          <div v-for="s in services" :key="s.name" class="story-col" style="gap: 6px">
            <VxStatusDot :status="s.ticks.at(-1)!.status" :label="s.name" />
            <VxUptimeBar :ticks="s.ticks" :slots="50" :label="`${s.name}, last 50 checks`" />
          </div>
          <VxUptimeBar v-model:selected="picked" :ticks="services[1]!.ticks" selectable :height="36" label="vods, selectable" />
          <p class="story-note">selected: {{ picked === null ? 'none' : services[1]!.ticks[picked]!.label }} · tap a tick, or arrow keys</p>
        </div>
      </StoryFrame>
    </Variant>
    <Variant title="Status tile">
      <!-- The left edge takes the status colour; extra controls go in the default slot. -->
      <StoryFrame>
        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 12px">
          <VxStatTile label="Recorder" status="live" headline="Recording" sub="started 1:02:44 ago" href="#rec" />
          <VxStatTile label="Services" status="ok" headline="4 of 4 up" sub="checked 12s ago" href="#svc" link-label="Status page" />
          <VxStatTile label="YouTube uploads" status="warn" headline="2 waiting" sub="quota resets in 3 h" />
          <VxStatTile label="Twitch (ad-free)" status="down" headline="Not linked" sub="recordings may show ads">
            <VxButton size="sm">Link Twitch account</VxButton>
          </VxStatTile>
          <VxStatTile label="Chat logger" headline="No data" sub="never reported" />
          <VxStatTile label="YouTube" status="ok" headline="Linked" sub="checked 4 min ago">
            <template #before-sub><a href="#yt" class="story-note">youtube.com/@vexouluna</a></template>
          </VxStatTile>
        </div>
      </StoryFrame>
    </Variant>
    <Variant title="Avatar">
      <StoryFrame>
        <div class="story-row" style="gap: 20px; padding-bottom: 10px">
          <VxAvatar name="vexouluna" />
          <VxAvatar name="vexouluna" :size="48" />
          <VxAvatar name="vexouluna" :size="64" live />
        </div>
      </StoryFrame>
    </Variant>
  </Story>
</template>
