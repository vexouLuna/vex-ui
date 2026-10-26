import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it } from 'vitest'
import { nextTick } from 'vue'
import VxTagInput from '../src/components/controls/VxTagInput.vue'

const options = [
  { value: 'speedrun', label: 'Speedrun', color: '#f80' },
  { value: 'doom', label: 'Doom', hint: '12 VODs' },
  { value: 'randomizer', label: 'Randomizer' },
  { value: 'irl', label: 'IRL' },
]

function make(props: Record<string, unknown> = {}) {
  const w = mount(VxTagInput, {
    attachTo: document.body,
    props: { modelValue: [], 'onUpdate:modelValue': (v: string[]) => w.setProps({ modelValue: v }), ...props },
  })
  return w
}
const model = (w: ReturnType<typeof make>) => w.props('modelValue') as string[]
const optionTexts = () => [...document.querySelectorAll('[role="option"] .vx-menu-main')].map((e) => e.textContent)
async function settle() {
  await nextTick()
  await nextTick()
}

afterEach(() => {
  document.body.innerHTML = ''
})

describe('VxTagInput', () => {
  it('filters options, prefix matches first, skipping chosen values', async () => {
    const w = make({ options, modelValue: ['speedrun'] })
    const input = w.get('input')
    await input.setValue('r')
    await settle()
    // "Randomizer" starts with r; "speedrun" is chosen; "IRL" contains r.
    expect(optionTexts()).toEqual(['Randomizer', 'IRL'])
    expect(input.attributes('aria-expanded')).toBe('true')
  })

  it('moves with arrows and picks with Enter or Tab', async () => {
    const w = make({ options })
    const input = w.get('input')
    await input.trigger('keydown', { key: 'ArrowDown' })
    await settle()
    expect(input.attributes('aria-activedescendant')).toBe(document.querySelector('[role="option"]')!.id)
    await input.trigger('keydown', { key: 'ArrowDown' })
    await input.trigger('keydown', { key: 'Enter' })
    expect(model(w)).toEqual(['doom'])
    await input.setValue('ir')
    await settle()
    await input.trigger('keydown', { key: 'Tab' })
    expect(model(w)).toEqual(['doom', 'irl'])
  })

  it('wraps upward from the first option and closes on Escape', async () => {
    const w = make({ options })
    const input = w.get('input')
    await input.trigger('keydown', { key: 'ArrowUp' })
    await settle()
    const ids = [...document.querySelectorAll('[role="option"]')].map((e) => e.id)
    expect(input.attributes('aria-activedescendant')).toBe(ids[3])
    await input.trigger('keydown', { key: 'Escape' })
    await settle()
    expect(input.attributes('aria-expanded')).toBe('false')
    expect(document.querySelector('[role="listbox"]')).toBeNull()
  })

  it('adds free text with comma or Enter only when allowNew is on', async () => {
    const plain = make()
    await plain.get('input').setValue('foo')
    await plain.get('input').trigger('keydown', { key: 'Enter' })
    expect(model(plain)).toEqual([])
    plain.unmount()

    const w = make({ allowNew: true })
    const input = w.get('input')
    await input.setValue('foo')
    await input.trigger('keydown', { key: ',' })
    await input.setValue(' bar ')
    await input.trigger('keydown', { key: 'Enter' })
    expect(model(w)).toEqual(['foo', 'bar'])
    expect((input.element as HTMLInputElement).value).toBe('')
  })

  it('works as a plain list input: pasted commas add each value', async () => {
    const w = make({ allowNew: true })
    await w.get('input').setValue('a, b,c, d')
    expect(model(w)).toEqual(['a', 'b', 'c'])
    expect((w.get('input').element as HTMLInputElement).value).toBe(' d')
    expect(w.get('input').attributes('aria-expanded')).toBe('false')
    // A refused part stays as text, with what follows it.
    await w.get('input').setValue('e,a, f')
    expect(model(w)).toEqual(['a', 'b', 'c', 'e'])
    expect((w.get('input').element as HTMLInputElement).value).toBe('a, f')
  })

  it('maps typed text to a known option and refuses duplicates', async () => {
    const w = make({ options, allowNew: true, modelValue: ['doom'] })
    const input = w.get('input')
    await input.setValue('speedrun')
    await input.trigger('keydown', { key: ',' })
    expect(model(w)).toEqual(['doom', 'speedrun'])
    await input.setValue('DOOM')
    await input.trigger('keydown', { key: ',' })
    expect(model(w)).toEqual(['doom', 'speedrun'])
    expect(w.get('[role="alert"]').text()).toBe('Doom is already added.')
  })

  it('shows validate errors and keeps the text', async () => {
    const w = make({ allowNew: true, validate: (v: string) => (/^\d+$/.test(v) ? null : 'Numbers only.') })
    const input = w.get('input')
    await input.setValue('abc')
    await input.trigger('keydown', { key: 'Enter' })
    expect(model(w)).toEqual([])
    expect(w.get('[role="alert"]').text()).toBe('Numbers only.')
    expect(input.attributes('aria-invalid')).toBe('true')
    expect(input.attributes('aria-describedby')).toBe(w.get('[role="alert"]').attributes('id'))
    expect((input.element as HTMLInputElement).value).toBe('abc')
    await input.setValue('42')
    expect(w.find('[role="alert"]').exists()).toBe(false)
    await input.trigger('keydown', { key: 'Enter' })
    expect(model(w)).toEqual(['42'])
  })

  it('stops at max', async () => {
    const w = make({ allowNew: true, max: 1, modelValue: ['a'], placeholder: 'Add' })
    expect(w.get('input').attributes('placeholder')).toBe('')
    await w.get('input').setValue('b')
    await w.get('input').trigger('keydown', { key: 'Enter' })
    expect(model(w)).toEqual(['a'])
    expect(w.get('[role="alert"]').text()).toBe('At most 1.')
  })

  it('Backspace in the empty input selects the last removable chip, then removes it', async () => {
    const w = make({ modelValue: ['a', 'b'], locked: [{ value: 'base' }] })
    const input = w.get('input')
    await input.trigger('keydown', { key: 'Backspace' })
    expect(w.findAll('.vx-tag.is-marked').map((c) => c.text())).toEqual([expect.stringContaining('b')])
    expect(model(w)).toEqual(['a', 'b'])
    await input.trigger('keydown', { key: 'Backspace' })
    expect(model(w)).toEqual(['a'])
    // Any other key drops the selection, so the next Backspace selects again.
    await input.trigger('keydown', { key: 'Backspace' })
    await input.trigger('keydown', { key: 'ArrowLeft' })
    await input.trigger('keydown', { key: 'Backspace' })
    expect(model(w)).toEqual(['a'])
    await input.trigger('keydown', { key: 'Backspace' })
    await input.trigger('keydown', { key: 'Backspace' })
    expect(model(w)).toEqual([])
    // Only locked chips are left: Backspace does nothing.
    await input.trigger('keydown', { key: 'Backspace' })
    expect(w.findAll('.vx-tag.is-locked')).toHaveLength(1)
  })

  it('shows locked chips first, with a lock mark, no ✕ and their title', async () => {
    const w = make({
      options,
      modelValue: ['doom'],
      locked: [{ value: 'speedrun', tone: 'accent', title: 'Set by the archive' }],
    })
    const chips = w.findAll('li')
    expect(chips[0].classes()).toBeDefined()
    expect(chips[0].find('.is-locked').classes()).toContain('is-accent')
    expect(chips[0].find('button').exists()).toBe(false)
    expect(chips[0].text()).toContain('Speedrun')
    expect(chips[0].text()).toContain('(locked: Set by the archive)')
    expect(chips[0].find('.vx-tooltip').exists()).toBe(true)
    // Locked values aren't offered again.
    await w.get('input').setValue('s')
    await settle()
    expect(optionTexts()).not.toContain('Speedrun')
  })

  it('is a combobox over a listbox, with chips in a list and labelled remove buttons', async () => {
    const w = make({ options, modelValue: ['doom'], id: 'tags' })
    const input = w.get('input')
    expect(input.attributes()).toMatchObject({ id: 'tags', role: 'combobox', 'aria-expanded': 'false', 'aria-autocomplete': 'list' })
    expect(w.get('ul').attributes('role')).toBe('list')
    const x = w.get('li button')
    expect(x.attributes('aria-label')).toBe('Remove Doom')
    await input.trigger('keydown', { key: 'ArrowDown' })
    await settle()
    const list = document.querySelector('[role="listbox"]')!
    expect(list.id).toBe(input.attributes('aria-controls'))
    expect(list.querySelector('[aria-selected="true"]')!.id).toBe(input.attributes('aria-activedescendant'))
    await x.trigger('click')
    expect(model(w)).toEqual([])
    expect(w.get('[aria-live="polite"]').text()).toBe('Removed Doom.')
  })

  it('picks an option on click', async () => {
    const w = make({ options })
    await w.get('input').setValue('ra')
    await settle()
    ;(document.querySelector('[role="option"]') as HTMLElement).click()
    await nextTick()
    expect(model(w)).toEqual(['randomizer'])
  })
})
