import { flushPromises, mount } from '@vue/test-utils'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'
import VxButton from '../src/components/controls/VxButton.vue'
import VxInput from '../src/components/controls/VxInput.vue'
import VxSaveBar from '../src/components/controls/VxSaveBar.vue'
import VxPagination from '../src/components/controls/VxPagination.vue'
import VxPlaceholder from '../src/components/media/VxPlaceholder.vue'
import VxStepper from '../src/components/controls/VxStepper.vue'
import VxTable from '../src/components/data/VxTable.vue'
import VxUptimeBar from '../src/components/data/VxUptimeBar.vue'
import VxStatTile from '../src/components/data/VxStatTile.vue'
import VxStatusDot from '../src/components/data/VxStatusDot.vue'
import VxPopover from '../src/components/overlays/VxPopover.vue'
import VxSelect from '../src/components/controls/VxSelect.vue'
import VxIcon from '../src/components/controls/VxIcon.vue'
import VxConfirm from '../src/components/overlays/VxConfirm.vue'
import VxLoadState from '../src/components/feedback/VxLoadState.vue'
import VxAccountMenu from '../src/components/chrome/VxAccountMenu.vue'
import VxSiteHeader from '../src/components/chrome/VxSiteHeader.vue'
import VxNavBar from '../src/components/chrome/VxNavBar.vue'
import VxTooltip from '../src/components/overlays/VxTooltip.vue'
import { useToast } from '../src/composables/useToast'

describe('VxButton', () => {
  it('renders variants, sizes and square icon buttons', () => {
    const w = mount(VxButton, { props: { variant: 'danger-solid', size: 'sm', icon: true, label: 'Delete' }, slots: { default: '×' } })
    const b = w.get('button')
    expect(b.classes()).toEqual(expect.arrayContaining(['vx-btn', 'is-danger-solid', 'is-sm', 'is-icon']))
    expect(b.attributes('aria-label')).toBe('Delete')
  })

  it('is disabled and busy while loading', () => {
    const w = mount(VxButton, { props: { loading: true }, slots: { default: 'Save' } })
    expect(w.get('button').attributes('disabled')).toBeDefined()
    expect(w.get('button').attributes('aria-busy')).toBe('true')
    expect(w.find('.vx-spinner').exists()).toBe(true)
  })
})

describe('VxInput', () => {
  it('puts attributes and listeners on the <input>, class and style on the wrapper', async () => {
    let blurred = 0
    const w = mount(VxInput, { attrs: { 'aria-label': 'Title', min: '1', class: 'extra', style: 'max-width: 10px', onBlur: () => blurred++ } })
    const input = w.get('input')
    expect(input.attributes('aria-label')).toBe('Title')
    expect(input.attributes('min')).toBe('1')
    expect(input.attributes('class')).toBe('vx-input')
    expect(w.classes()).toEqual(expect.arrayContaining(['vx-input-wrap', 'extra']))
    expect(w.attributes('style')).toContain('max-width: 10px')
    expect(w.attributes('aria-label')).toBeUndefined()
    await input.trigger('blur')
    expect(blurred).toBe(1)
  })
  it('takes a fixed width, or grows in a row from one up to a cap', () => {
    const style = (props: object) => (mount(VxInput, { props }).element as HTMLElement).style
    const fixed = style({ width: 96 })
    expect([fixed.width, fixed.flexGrow, fixed.flexShrink]).toEqual(['96px', '0', '0'])
    const grow = style({ grow: true, width: '14rem', maxWidth: '20rem' })
    expect([grow.flexGrow, grow.flexBasis, grow.maxWidth, grow.width]).toEqual(['1', '14rem', '20rem', 'auto'])
    expect(mount(VxInput).attributes('style')).toBeUndefined()
  })
})

describe('VxPlaceholder', () => {
  it('is flush: no border class of its own and fills its box', () => {
    const w = mount(VxPlaceholder, { props: { flush: true } })
    expect(w.classes()).toContain('is-flush')
    expect(w.attributes('style')).toContain('height: 100%')
    expect(mount(VxPlaceholder).attributes('style')).toContain('height: auto')
  })
})

describe('VxStepper', () => {
  it('steps by 0.1 and by 1 with shift', async () => {
    const w = mount(VxStepper, { props: { modelValue: 1.5, step: 0.1, 'onUpdate:modelValue': (v: number) => w.setProps({ modelValue: v }) } })
    const [minus, plus] = w.findAll('button')
    await plus!.trigger('click')
    expect(w.props('modelValue')).toBe(1.6)
    await minus!.trigger('click', { shiftKey: true })
    expect(w.props('modelValue')).toBe(0.6)
  })
})

describe('VxPagination', () => {
  it('marks the current page and moves with the arrows', async () => {
    const w = mount(VxPagination, { props: { modelValue: 3, total: 54, 'onUpdate:modelValue': (v: number) => w.setProps({ modelValue: v }) } })
    expect(w.get('[aria-current=page]').text()).toBe('3')
    await w.get('[aria-label="Next page"]').trigger('click')
    expect(w.props('modelValue')).toBe(4)
    expect(w.findAll('.vx-gap')).toHaveLength(1)
  })
})

describe('VxTable', () => {
  const columns = [
    { key: 'title', label: 'Title', sortable: true },
    { key: 'len', label: 'Length', sortable: true, align: 'right' as const },
  ]
  type Row = { title: string; len: number }
  const rows: Row[] = [
    { title: 'b', len: 10 },
    { title: 'a', len: 2 },
    { title: 'c', len: 100 },
  ]

  it('sorts locally from v-model:sort', async () => {
    const w = mount(VxTable, { props: { columns, rows, sort: null, 'onUpdate:sort': (s: unknown) => w.setProps({ sort: s as never }) } })
    const firstCol = () => w.findAll('tbody tr').map((r) => r.find('td').text())
    expect(firstCol()).toEqual(['b', 'a', 'c'])
    await w.findAll('th')[1]!.trigger('click')
    expect(firstCol()).toEqual(['a', 'b', 'c'])
    expect(w.findAll('th')[1]!.attributes('aria-sort')).toBe('ascending')
    await w.findAll('th')[1]!.trigger('click')
    expect(firstCol()).toEqual(['c', 'b', 'a'])
  })

  it('renders custom cells', () => {
    const w = mount(VxTable, { props: { columns, rows }, slots: { 'cell-len': '<b>{{ params.value }}s</b>' } })
    expect(w.find('tbody b').text()).toBe('10s')
  })

  it('takes custom headers, keys, row and column classes, and an empty slot', () => {
    const cols = [{ key: 'title', label: 'Title', class: 'end', wrap: true }, { key: 'len', label: '' }]
    const w = mount(VxTable<Row>, {
      props: {
        columns: cols,
        rows,
        rowKey: (r) => `${r.title}/${r.len}`,
        rowClass: (r) => ({ long: r.len > 50 }),
      },
      slots: { 'head-len': '<span class="sr">Actions</span>', 'cell-title': '<i>{{ params.index }}</i>' },
    })
    expect(w.get('th .sr').text()).toBe('Actions')
    expect(w.get('th').classes()).toEqual(expect.arrayContaining(['end', 'is-wrap']))
    expect(w.findAll('tbody tr').map((r) => r.classes('long'))).toEqual([false, false, true])
    expect(w.findAll('tbody i').map((i) => i.text())).toEqual(['0', '1', '2'])
    const none = mount(VxTable, { props: { columns: cols, rows: [] }, slots: { empty: 'Nobody is ignored here.' } })
    expect(none.get('td').text()).toBe('Nobody is ignored here.')
  })

  it('passes the index to rowKey, drops the header when headless, and marks wrap', () => {
    const keys: number[] = []
    const w = mount(VxTable<Row>, { props: { columns, rows, rowKey: (r, i) => (keys.push(i), `${r.title}:${i}`), headless: true, wrap: true } })
    expect(keys).toEqual([0, 1, 2])
    expect(w.find('thead').exists()).toBe(false)
    expect(w.get('table').classes()).toContain('is-wrap')
    expect(mount(VxTable, { props: { columns, rows } }).get('table').classes()).not.toContain('is-wrap')
  })

  it('spans a cell over the next columns and skips the cells it covers', () => {
    const cols = [{ key: 'title', label: 'Title' }, { key: 'len', label: 'Length' }, { key: 'x', label: 'X' }]
    const w = mount(VxTable<Row>, {
      props: { columns: cols, rows, span: (r, c) => (r.len > 50 && c.key === 'len' ? 2 : r.title === 'a' && c.key === 'title' ? 9 : undefined) },
    })
    const tds = w.findAll('tbody tr').map((tr) => tr.findAll('td').map((td) => td.attributes('colspan') ?? '1'))
    expect(tds).toEqual([['1', '1', '1'], ['3'], ['1', '2']])
  })
})

describe('VxAccountMenu', () => {
  const profile = () => [...document.body.querySelectorAll('a.vx-menu-item')].find((a) => a.textContent?.includes('Profile'))
  const open = async (props: Record<string, unknown> = {}) => {
    const w = mount(VxAccountMenu, { attachTo: document.body, props: { user: { name: 'vexouluna' }, ...props } })
    await w.get('.vx-account-trigger').trigger('click')
    await flushPromises()
    return w
  }

  it('links Profile to the vexoul.net account page, or elsewhere, or leaves it out', async () => {
    let w = await open()
    expect(profile()?.getAttribute('href')).toBe('https://vexoul.net/account')
    w.unmount()
    w = await open({ profileHref: '/account' })
    expect(profile()?.getAttribute('href')).toBe('/account')
    w.unmount()
    w = await open({ profileHref: null })
    expect(profile()).toBeUndefined()
    w.unmount()
  })
})

describe('VxPopover', () => {
  afterEach(() => vi.restoreAllMocks())
  const inside = () => document.body.querySelector('.inside')
  const mountPopover = (props: Record<string, unknown> = {}) =>
    mount(VxPopover, {
      attachTo: document.body,
      props,
      slots: {
        trigger: '<template #trigger="{ toggle }"><button class="t" @click="toggle">open</button></template>',
        default: '<p class="inside">menu</p>',
      },
    })

  it('opens from the trigger and closes on Escape and outside clicks, but not on clicks in its panel', async () => {
    const w = mountPopover()
    expect(inside()).toBeNull()
    await w.get('.t').trigger('click')
    await flushPromises()
    expect(inside()).not.toBeNull()
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    await nextTick()
    expect(inside()).toBeNull()
    await w.get('.t').trigger('click')
    await flushPromises()
    inside()!.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }))
    await nextTick()
    expect(inside()).not.toBeNull()
    document.body.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }))
    await nextTick()
    expect(inside()).toBeNull()
    w.unmount()
  })

  it('puts its panel on <body>, under the trigger, so no container clips it', async () => {
    vi.spyOn(document.documentElement, 'clientWidth', 'get').mockReturnValue(390)
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({
      left: 40, right: 140, top: 100, bottom: 132, width: 100, height: 32,
    } as DOMRect)
    const w = mountPopover({ width: '100%' })
    await w.get('.t').trigger('click')
    await flushPromises()
    const panel = document.body.querySelector<HTMLElement>('.vx-popover-panel')!
    expect(panel.parentElement).toBe(document.body)
    expect(w.element.contains(panel)).toBe(false)
    expect(panel.style.top).toBe('138px')
    expect(panel.style.left).toBe('40px')
    expect(panel.style.width).toBe('100px')
    w.unmount()
  })
})

describe('VxSelect', () => {
  const options = [
    { value: 'new', label: 'Newest' },
    { value: 'old', label: 'Oldest', disabled: true },
    { value: 'long', label: 'Longest' },
    { value: 'short', label: 'Shortest' },
  ]
  const active = (b: Element) => document.getElementById(b.getAttribute('aria-activedescendant') ?? '')?.textContent

  it('works from the keyboard: arrows skip disabled options, Home/End, type-ahead, Enter picks, Escape closes', async () => {
    const w = mount(VxSelect, { attachTo: document.body, props: { options, modelValue: 'new' } })
    const b = w.get('button')
    expect(b.attributes('role')).toBe('combobox')
    expect(b.attributes('aria-expanded')).toBe('false')
    const key = async (k: string) => {
      await b.trigger('keydown', { key: k })
      await flushPromises()
    }
    await key('ArrowDown')
    expect(b.attributes('aria-expanded')).toBe('true')
    expect(document.getElementById(b.attributes('aria-controls')!)?.getAttribute('role')).toBe('listbox')
    expect(active(b.element)).toBe('Newest')
    await key('ArrowDown')
    expect(active(b.element)).toBe('Longest')
    await key('End')
    expect(active(b.element)).toBe('Shortest')
    await key('ArrowDown')
    expect(active(b.element)).toBe('Shortest')
    await key('Home')
    expect(active(b.element)).toBe('Newest')
    await key('s')
    expect(active(b.element)).toBe('Shortest')
    await key('Enter')
    expect(w.emitted('update:modelValue')).toEqual([['short']])
    expect(b.attributes('aria-expanded')).toBe('false')
    await key('l')
    expect(b.attributes('aria-expanded')).toBe('true')
    expect(active(b.element)).toBe('Longest')
    await key('Escape')
    expect(b.attributes('aria-expanded')).toBe('false')
    expect(w.emitted('update:modelValue')).toHaveLength(1)
    w.unmount()
  })
})

describe('useToast', () => {
  it('keeps at most three toasts', () => {
    const t = useToast()
    for (let i = 0; i < 5; i++) t.show(`m${i}`, { duration: 60_000 })
    expect(t.toasts.value.map((x) => x.message)).toEqual(['m2', 'm3', 'm4'])
    t.toasts.value.forEach((x) => t.dismiss(x.id))
    expect(t.toasts.value).toHaveLength(0)
  })
})

describe('VxTooltip', () => {
  afterEach(() => {
    vi.restoreAllMocks()
    document.body.innerHTML = ''
  })

  // happy-dom lays nothing out, so boxes are faked in a 390px-wide screen: the trigger's, and a 120×24 bubble.
  async function hover(trigger: { left: number; right: number; top: number }) {
    vi.spyOn(document.documentElement, 'clientWidth', 'get').mockReturnValue(390)
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (this: HTMLElement) {
      const box = this.classList.contains('vx-tooltip-bubble')
        ? { left: 0, right: 120, top: 0, bottom: 24 }
        : { ...trigger, bottom: trigger.top + 24 }
      return box as DOMRect
    })
    const w = mount(VxTooltip, { props: { text: 'Hint' }, slots: { default: '<button>x</button>' }, attachTo: document.body })
    await w.get('.vx-tooltip').trigger('pointerenter')
    await nextTick()
    await nextTick()
    const b = document.body.querySelector<HTMLElement>('.vx-tooltip-bubble')!
    expect(b.parentElement).toBe(document.body)
    return b
  }

  it('sits centred above its trigger when it fits', async () => {
    const b = await hover({ left: 100, right: 200, top: 300 })
    expect(b.style.left).toBe('90px')
    expect(b.style.top).toBe('268px')
    expect(b.classList.contains('is-below')).toBe(false)
  })

  it('slides back on screen past the left or right edge', async () => {
    expect((await hover({ left: -40, right: 20, top: 300 })).style.left).toBe('8px')
    document.body.innerHTML = ''
    expect((await hover({ left: 340, right: 400, top: 300 })).style.left).toBe('262px')
  })

  it('goes below when there is no room above', async () => {
    const b = await hover({ left: 100, right: 200, top: 10 })
    expect(b.classList.contains('is-below')).toBe(true)
    expect(b.style.top).toBe('42px')
  })

  it('carries the overlay base (font, color) out in <body>', async () => {
    expect((await hover({ left: 100, right: 200, top: 300 })).classList.contains('vx-overlay')).toBe(true)
  })
})

describe('VxUptimeBar', () => {
  const ticks = [
    { status: 'ok' as const, label: '14:30 · up' },
    { status: 'down' as const, label: '14:31 · down' },
    { status: 'ok' as const, label: '14:32 · up' },
  ]

  it('pads to a fixed number of ticks and sums up what is known', () => {
    const w = mount(VxUptimeBar, { props: { ticks, slots: 5, label: 'dtp' } })
    expect(w.findAll('.vx-uptime-tick')).toHaveLength(5)
    expect(w.findAll('.vx-uptime-tick.is-pad')).toHaveLength(2)
    expect(w.get('.vx-uptime').attributes('aria-label')).toBe('dtp: 2 of 3 up')
    expect(w.find('button').exists()).toBe(false)
  })

  it('shows the hovered tick label', async () => {
    const w = mount(VxUptimeBar, { props: { ticks } })
    await w.findAll('.vx-uptime-tick')[1]!.trigger('pointerenter')
    expect(w.get('.vx-tooltip-bubble').text()).toBe('14:31 · down')
  })

  it('selects a tick on click, again to clear, and moves with the arrow keys', async () => {
    const w = mount(VxUptimeBar, { props: { ticks, selectable: true, 'onUpdate:selected': (v: number | null) => w.setProps({ selected: v }) } })
    const buttons = () => w.findAll('button')
    // Only one tab stop: the newest tick until one is chosen.
    expect(buttons().map((b) => b.attributes('tabindex'))).toEqual(['-1', '-1', '0'])
    await buttons()[1]!.trigger('click')
    expect(w.props('selected')).toBe(1)
    expect(buttons()[1]!.attributes('aria-pressed')).toBe('true')
    await buttons()[1]!.trigger('keydown', { key: 'ArrowLeft' })
    expect(w.props('selected')).toBe(0)
    await buttons()[0]!.trigger('keydown', { key: 'ArrowLeft' })
    expect(w.props('selected')).toBe(0)
    await buttons()[0]!.trigger('keydown', { key: 'End' })
    expect(w.props('selected')).toBe(2)
    await buttons()[2]!.trigger('click')
    expect(w.props('selected')).toBe(null)
  })
})

describe('VxSiteHeader', () => {
  it('opens an external nav item in a new tab, marked ↗', () => {
    const w = mount(VxSiteHeader, {
      props: { site: 'vods', nav: [{ label: 'VODs', href: '/vods' }, { label: 'Live', href: 'https://twitch.tv/x', external: true }] },
    })
    const [vods, live] = w.get('.vx-head .vx-nav').findAll('a')
    expect(vods!.attributes('target')).toBeUndefined()
    expect(vods!.find('.vx-offsite').exists()).toBe(false)
    expect(live!.attributes('target')).toBe('_blank')
    expect(live!.get('.vx-offsite').text()).toBe('↗')
  })
})

describe('VxStatusDot', () => {
  it('is the small dot by default and the big one with size lg', () => {
    const w = mount(VxStatusDot, { props: { status: 'ok', label: 'Up' } })
    expect(w.classes()).toEqual(['vx-status', 'is-ok'])
    const lg = mount(VxStatusDot, { props: { status: 'down', size: 'lg', label: 'Down' } })
    expect(lg.classes()).toEqual(expect.arrayContaining(['is-down', 'is-lg']))
    expect(lg.text()).toBe('Down')
  })
})

describe('VxStatTile', () => {
  it('takes the status as its class and links on when given somewhere to go', () => {
    const w = mount(VxStatTile, { props: { status: 'warn', headline: '2 waiting', href: '#up', linkLabel: 'Uploads' } })
    expect(w.classes()).toContain('is-warn')
    expect(w.get('a').attributes('href')).toBe('#up')
    expect(w.text()).toContain('Uploads')
    expect(mount(VxStatTile, { props: { headline: 'x' } }).find('a').exists()).toBe(false)
  })

  it('puts #before-sub between the headline and the sub line', () => {
    const w = mount(VxStatTile, { props: { headline: 'x', sub: 'checked now' }, slots: { 'before-sub': '<i>link</i>', default: '<b>more</b>' } })
    expect(w.html().indexOf('<i>')).toBeLessThan(w.html().indexOf('checked now'))
    expect(w.html().indexOf('checked now')).toBeLessThan(w.html().indexOf('<b>'))
  })
})

describe('VxNavBar', () => {
  it('marks the current link for screen readers', () => {
    const w = mount(VxNavBar, {
      props: { label: 'Manage', links: [{ label: 'Me', href: '#me' }, { label: 'Audit', href: '#audit', current: true }] },
    })
    const [me, audit] = w.findAll('a')
    expect(me!.attributes('aria-current')).toBeUndefined()
    expect(audit!.attributes('aria-current')).toBe('page')
    expect(w.get('nav').attributes('aria-label')).toBe('Manage')
  })
})

describe('VxSaveBar', () => {
  it('counts changes, emits undo and save, and blocks Save with nothing to save', async () => {
    const w = mount(VxSaveBar, { props: { count: 2 } })
    expect(w.text()).toContain('2 unsaved changes')
    const [undo, save] = w.findAll('button')
    await undo!.trigger('click')
    await save!.trigger('click')
    expect(w.emitted('undo')).toHaveLength(1)
    expect(w.emitted('save')).toHaveLength(1)
    await w.setProps({ count: 0 })
    expect(w.text()).toContain('No changes')
    expect(save!.attributes('disabled')).toBeDefined()
  })

  it('takes its words as props', () => {
    const w = mount(VxSaveBar, {
      props: { count: 1, undoLabel: 'Reset', error: 'x', errorTitle: 'Not saved', statusText: (n: number) => (n ? 'Unsaved changes' : '') },
    })
    expect(w.text()).toContain('Unsaved changes')
    expect(w.text()).toContain('Reset')
    expect(w.text()).toContain('Not saved')
  })
})

describe('VxLoadState', () => {
  it('shows the error with Try again, then skeletons, then empty, then the content', async () => {
    const w = mount(VxLoadState, { props: { error: new Error('boom') }, slots: { default: '<p class="c">data</p>' } })
    expect(w.text()).toContain('boom')
    await w.get('button').trigger('click')
    expect(w.emitted('retry')).toHaveLength(1)
    await w.setProps({ error: null, loading: true })
    expect(w.find('[aria-busy="true"]').exists()).toBe(true)
    await w.setProps({ loading: false, empty: true, emptyTitle: 'None' })
    expect(w.text()).toContain('None')
    await w.setProps({ empty: false })
    expect(w.find('.c').exists()).toBe(true)
  })

  it('keeps older content under a warning when a refresh fails with stale', async () => {
    const w = mount(VxLoadState, { props: { error: new Error('502'), stale: true }, slots: { default: '<p class="c">data</p>' } })
    expect(w.find('.c').exists()).toBe(true)
    expect(w.get('.vx-callout').classes()).toContain('is-warn')
    expect(w.text()).toContain("Couldn't refresh")
    expect(w.text()).toContain('502')
    await w.get('button').trigger('click')
    expect(w.emitted('retry')).toHaveLength(1)
    await w.setProps({ error: null })
    expect(w.find('.vx-callout').exists()).toBe(false)
    expect(w.find('.c').exists()).toBe(true)
  })

  it('shows #empty, not the content, when a stale refresh fails with nothing in it', () => {
    const w = mount(VxLoadState, {
      props: { error: new Error('502'), stale: true, empty: true },
      slots: { default: '<p class="c">data</p>', empty: '<p class="e">none</p>' },
    })
    expect(w.text()).toContain("Couldn't refresh")
    expect(w.find('.e').exists()).toBe(true)
    expect(w.find('.c').exists()).toBe(false)
  })

  it('hands the data to the default slot and spaces the stand-ins with margin', async () => {
    const w = mount(VxLoadState<{ name: string } | null>, {
      props: { data: null, loading: true, margin: '0 0 12px' },
      slots: { default: '<p class="c">{{ params.data.name }}</p>' },
    })
    expect(w.get('[aria-busy="true"]').attributes('style')).toContain('margin: 0px 0px 12px')
    await w.setProps({ data: { name: 'Keeki' }, loading: false })
    expect(w.get('.c').text()).toBe('Keeki')
  })
})

describe('VxConfirm', () => {
  it('confirms only once the text is typed, and not while loading', async () => {
    const w = mount(VxConfirm, { attachTo: document.body, props: { open: true, title: 'Delete?', confirmText: 'abc' } })
    await flushPromises()
    const confirm = () => [...document.body.querySelectorAll<HTMLButtonElement>('.vx-dialog button')].at(-1)!
    expect(confirm().disabled).toBe(true)
    const input = document.body.querySelector<HTMLInputElement>('.vx-dialog input')!
    input.value = 'abc'
    input.dispatchEvent(new Event('input'))
    await nextTick()
    confirm().click()
    expect(w.emitted('confirm')).toHaveLength(1)
    await w.setProps({ loading: true })
    confirm().click()
    expect(w.emitted('confirm')).toHaveLength(1)
    w.unmount()
  })

  it('takes the text in any case with confirmIgnoreCase', async () => {
    const w = mount(VxConfirm, { attachTo: document.body, props: { open: true, title: 'Forget me?', confirmText: 'Alice' } })
    await flushPromises()
    const confirm = () => [...document.body.querySelectorAll<HTMLButtonElement>('.vx-dialog button')].at(-1)!
    const input = document.body.querySelector<HTMLInputElement>('.vx-dialog input')!
    input.value = 'aLICE '
    input.dispatchEvent(new Event('input'))
    await nextTick()
    expect(confirm().disabled).toBe(true)
    await w.setProps({ confirmIgnoreCase: true })
    expect(confirm().disabled).toBe(false)
    w.unmount()
  })
})

describe('VxIcon', () => {
  it('is hidden from assistive tech unless it has a title', () => {
    const plain = mount(VxIcon, { props: { name: 'play' } })
    expect(plain.attributes('aria-hidden')).toBe('true')
    expect(plain.attributes('width')).toBe('18')
    expect(plain.find('path.fill').exists()).toBe(true)
    const named = mount(VxIcon, { props: { name: 'copy', title: 'Copy link', size: 26 } })
    expect(named.attributes('aria-hidden')).toBeUndefined()
    expect(named.attributes()).toMatchObject({ role: 'img', 'aria-label': 'Copy link', width: '26' })
  })
})
