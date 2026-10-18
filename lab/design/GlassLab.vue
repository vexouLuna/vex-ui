<script setup>
// Glass directions side by side over the real starfield and the real .vx-* classes, each with the same knobs.
// The column's knobs restyle .vx-panel, .vx-btn, .vx-input, .vx-segmented and .vx-code inside it only.
import '../../src/styles/fonts.css'
import '../../src/styles/index.css'
import { onMounted, onUnmounted, reactive, ref } from 'vue'
import VxStarfield from '../../src/components/media/VxStarfield.vue'
import { mulberry32 } from '../../src/utils/random'

const presets = {
  current: { name: 'Before', tint: 35, line: 9, sheen: 9, edge: 12, stripes: 0, stripeW: 14, stripeGap: 22, angle: 135, streak: 0, rim: 0, bands: 14, bandW: 70, seed: 7, follow: 50 },
  stripes: { name: 'D · Diagonal lines', tint: 12, line: 10, sheen: 0, edge: 10, stripes: 4, stripeW: 16, stripeGap: 26, angle: 135, streak: 0, rim: 0, bands: 14, bandW: 70, seed: 7, follow: 50 },
  rim: { name: 'E · Lit rim', tint: 10, line: 0, sheen: 3, edge: 0, stripes: 0, stripeW: 14, stripeGap: 22, angle: 135, streak: 0, rim: 40, bands: 14, bandW: 70, seed: 7, follow: 50 },
  reflect: { name: 'F · Window reflection', tint: 15, line: 11, sheen: 3, edge: 11, stripes: 0, stripeW: 9, stripeGap: 11, angle: 120, streak: 3, rim: 43, bands: 16, bandW: 55, seed: 15, follow: 50 },
}
const knobs = [
  ['tint', 'Darkness', 0, 80, '%'], ['line', 'Border', 0, 40, '%'], ['edge', 'Top highlight', 0, 40, '%'],
  ['sheen', 'Sheen', 0, 30, '%'], ['rim', 'Lit rim', 0, 80, '%'], ['streak', 'Reflection', 0, 30, '%'],
  ['stripes', 'Lines', 0, 20, '%'], ['stripeW', 'Line width', 2, 60, 'px'], ['stripeGap', 'Line gap', 2, 120, 'px'],
  ['angle', 'Line angle', 0, 180, '°'], ['bands', 'Bands / 1600px', 1, 40, ''], ['bandW', 'Max width', 4, 200, 'px'],
  ['seed', 'Seed', 1, 99, ''], ['follow', 'Follow scroll', 0, 100, '%'],
]
const sky = ref('plain')
const skies = { plain: {}, nebula: { band: true, glow: true } }
const cols = reactive(Object.entries(presets).map(([id, p]) => ({ id, ...p })))

// Seeded hard-edged bands over one 1600px period, repeated: like the starfield, the same seed draws the same window.
// Fixed at 120deg: one period then spans 3200px vertically (1600 / cos 60deg), so a 3200px-tall tile loops without a seam.
function bands(c) {
  // One band per equal slot, at a random spot inside it, so they spread evenly over the whole period.
  const rnd = mulberry32(c.seed), period = 1600, slot = period / c.bands, stops = []
  for (let i = 0; i < c.bands; i++) {
    const w = 2 + rnd() * Math.min(c.bandW, slot - 2)
    const start = i * slot + rnd() * (slot - w)
    const a = (c.streak * (0.35 + rnd() * 0.65)) / 100
    const [s0, s1] = [start.toFixed(1), (start + w).toFixed(1)]
    stops.push(`transparent ${s0}px`, `rgb(255 255 255 / ${a.toFixed(3)}) ${s0}px ${s1}px`, `transparent ${s1}px`)
  }
  return `repeating-linear-gradient(120deg, ${stops.join(', ')}, transparent ${period}px)`
}
const white = (a) => `rgb(255 255 255 / ${a / 100})`
const vars = (c) => ({
  '--g-tint': `rgb(14 14 22 / ${c.tint / 100})`,
  '--g-line': white(c.line),
  '--g-edge': `inset 0 1px 0 ${white(c.edge)}`,
  '--g-sheen': `linear-gradient(155deg, ${white(c.sheen)}, ${white(c.sheen / 4.5)} 38%, transparent 60%, ${white(c.sheen / 3)})`,
  '--g-stripes': `repeating-linear-gradient(${c.angle}deg, ${white(c.stripes)} 0 ${c.stripeW}px, transparent ${c.stripeW}px ${c.stripeW + c.stripeGap}px)`,
  '--g-streak': bands(c),
  '--g-follow': -c.follow / 100,
  '--g-rim': `linear-gradient(145deg, ${white(c.rim)}, ${white(c.rim / 8)} 35%, transparent 60%, ${white(c.rim / 3)})`,
})
// The page scroll as a px var, so the viewport-pinned reflection can drift up at a fraction of the scroll speed.
let frame = 0
const onScroll = () => { cancelAnimationFrame(frame); frame = requestAnimationFrame(() => document.documentElement.style.setProperty('--g-scroll-y', `${scrollY}px`)) }
onMounted(() => { addEventListener('scroll', onScroll, { passive: true }); onScroll() })
onUnmounted(() => removeEventListener('scroll', onScroll))
const reset = (c) => Object.assign(c, presets[c.id])
const summary = (c) => knobs.map(([k, , , , u]) => `${k} ${c[k]}${u}`).join(', ')
</script>

<template>
  <div class="vx-site gl" data-site="root">
    <VxStarfield :key="sky" class="gl-sky" seed="vexoul.net" :options="skies[sky]" />
    <header class="gl-head">
      <h1 class="vx-display">Glass lab</h1>
      <p class="vx-muted">Same sky, same components; each column has its own knobs. Tell the agent which column and values you like.</p>
      <div class="vx-segmented"><button v-for="(_, k) in skies" :key="k" :class="{ 'is-active': sky === k }" :aria-pressed="sky === k" @click="sky = k">{{ k }} sky</button></div>
    </header>
    <div class="gl-cols">
      <section v-for="c in cols" :key="c.id" class="gl-col" :style="vars(c)">
        <div class="gl-colhead">
          <h2 class="vx-label">{{ c.name }}</h2>
          <button class="vx-btn is-ghost" @click="reset(c)">Reset</button>
        </div>

        <article class="vx-panel gl-card">
          <h3>Stream card</h3>
          <p>Live now · Elden Ring, all bosses. The stars should read as depth, never as noise behind the text.</p>
          <div class="gl-row">
            <button class="vx-btn is-primary">Watch</button>
            <button class="vx-btn">Chat</button>
            <button class="vx-btn">VODs</button>
          </div>
        </article>

        <article class="vx-panel gl-card">
          <div class="gl-row">
            <input class="vx-input" placeholder="Search VODs" />
            <div class="vx-segmented"><button class="is-active" aria-pressed="true">All</button><button>Live</button></div>
          </div>
          <code class="vx-code">!so @vexouLuna "thanks for the raid"</code>
          <ul class="gl-list">
            <li><span>Part 1</span><span class="vx-muted vx-tabular">2:14:07</span></li>
            <li><span>Part 2</span><span class="vx-muted vx-tabular">1:48:30</span></li>
          </ul>
        </article>

        <details class="gl-knobs vx-pop" open>
          <summary class="vx-label">Knobs</summary>
          <label v-for="[k, label, min, max, unit] in knobs" :key="k">
            <span>{{ label }}</span>
            <input v-model.number="c[k]" type="range" :min="min" :max="max" :step="k === 'streak' ? 0.5 : 1" />
            <span class="vx-mono vx-tabular">{{ c[k] }}{{ unit }}</span>
          </label>
          <code class="gl-sum vx-mono">{{ summary(c) }}</code>
        </details>
      </section>
    </div>
  </div>
</template>

<style>
.gl { position: relative; min-height: 100vh; padding: 24px 16px 48px; color: var(--vx-ink); background: var(--vx-bg); }
.gl-sky { position: fixed; inset: 0; z-index: 0; }
.gl-head, .gl-cols { position: relative; z-index: 1; width: 100%; max-width: 1600px; margin: 0 auto; }
.gl-head h1 { margin: 0 0 4px; font-size: 28px; }
.gl-head p { margin: 0 0 10px; }
.gl-head .vx-segmented { margin-bottom: 20px; }
.gl-cols { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; }
.gl-col { min-width: 0; display: flex; flex-direction: column; gap: 14px; }
.gl-colhead { display: flex; justify-content: space-between; align-items: center; }
.gl-colhead h2 { margin: 0; }
.gl-card { padding: 16px; display: flex; flex-direction: column; gap: 12px; }
.gl-card h3 { margin: 0; font-size: 16px; }
.gl-card p { margin: 0; line-height: 1.5; }
.gl-row { display: flex; gap: 8px; flex-wrap: wrap; align-items: center; }
.gl-row .vx-input { flex: 1; width: auto; }
.gl-list { list-style: none; margin: 0; padding: 0; }
.gl-list li { display: flex; justify-content: space-between; padding: 6px 0; border-top: 1px solid var(--g-line); }

/* The knobs: the column's vars restyle the real classes. No backdrop blur anywhere: the stars stay sharp. */
.gl-col .vx-panel {
  position: relative;
  background: var(--g-streak), var(--g-stripes), var(--g-sheen), var(--g-tint);
  /* The reflection is pinned to the viewport (it lines up across tiles) and drifts up at --g-follow of the scroll. */
  background-attachment: fixed, scroll, scroll, scroll;
  background-position: 0 calc(var(--g-scroll-y, 0px) * var(--g-follow)), 0 0, 0 0, 0 0;
  background-size: 100% 3200px, auto, auto, auto;
  border-color: var(--g-line);
  box-shadow: var(--g-edge);
}
.gl-col .vx-panel::after {
  content: '';
  position: absolute;
  inset: -1px;
  padding: 1px;
  border-radius: inherit;
  pointer-events: none;
  background: var(--g-rim);
  mask: linear-gradient(#000 0 0) content-box exclude, linear-gradient(#000 0 0);
}
.gl-col .vx-btn:not(.is-primary, .is-ghost), .gl-col .vx-input, .gl-col .vx-segmented, .gl-col .vx-code {
  background: var(--g-sheen), var(--g-tint);
  border-color: var(--g-line);
  box-shadow: var(--g-edge);
  backdrop-filter: none;
  -webkit-backdrop-filter: none;
}
.gl-col .vx-btn:not(.is-primary, .is-ghost):hover { background: var(--vx-hover); }

.gl-knobs { padding: 10px 12px; display: grid; gap: 6px; font-size: 12px; }
.gl-knobs summary { cursor: pointer; }
.gl-knobs label { display: grid; grid-template-columns: 96px 1fr 44px; gap: 8px; align-items: center; }
.gl-knobs input { width: 100%; accent-color: var(--vx-accent); }
.gl-sum { font-size: 11px; color: var(--vx-muted); white-space: normal; user-select: all; }
</style>
