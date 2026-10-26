import { flushPromises, mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import VxDateInput from '../src/components/controls/VxDateInput.vue'
import { monthGrid, parseDate } from '../src/utils/date'

describe('parseDate', () => {
  it('reads dates, tidies separators and refuses days that do not exist', () => {
    expect(parseDate('2026-10-23')).toBe('2026-10-23')
    expect(parseDate(' 2026/9/1 ')).toBe('2026-09-01')
    expect(parseDate('2026.09.01')).toBe('2026-09-01')
    expect(parseDate('')).toBe('')
    expect(parseDate('2026-02-30')).toBeNull()
    expect(parseDate('2026-13-01')).toBeNull()
    expect(parseDate('23/10/2026')).toBeNull()
    expect(parseDate('2026-10-23 14:05')).toBe('2026-10-23') // the time is dropped without `time`
  })

  it('reads date and time, with seconds, a T, or midnight when only a date', () => {
    expect(parseDate('2026-10-23 14:05', true)).toBe('2026-10-23T14:05')
    expect(parseDate('2026-10-23T09:05:59.123', true)).toBe('2026-10-23T09:05')
    expect(parseDate('2026-10-23', true)).toBe('2026-10-23T00:00')
    expect(parseDate('2026-10-23 24:00', true)).toBeNull()
    expect(parseDate('2026-10-23 12:60', true)).toBeNull()
  })

  it('keeps seconds with `seconds`', () => {
    expect(parseDate('2026-10-23 09:05:07', true, true)).toBe('2026-10-23T09:05:07')
    expect(parseDate('2026-10-23 09:05', true, true)).toBe('2026-10-23T09:05:00')
    expect(parseDate('2026-10-23 09:05:60', true, true)).toBeNull()
  })

  it('turns a pasted timestamp with a zone into local time', () => {
    const local = new Date(Date.UTC(2026, 9, 23, 14, 5))
    const pad = (n: number) => String(n).padStart(2, '0')
    const want = `${local.getFullYear()}-${pad(local.getMonth() + 1)}-${pad(local.getDate())}T${pad(local.getHours())}:${pad(local.getMinutes())}`
    expect(parseDate('2026-10-23T14:05:00Z', true)).toBe(want)
    expect(parseDate('2026-10-23T16:05:00+02:00', true)).toBe(want)
  })
})

describe('monthGrid', () => {
  it('is six Monday-first weeks around the month', () => {
    const g = monthGrid(2026, 9) // October 2026 starts on a Thursday
    expect(g).toHaveLength(42)
    expect(g[0]).toEqual({ date: '2026-09-28', day: 28, inMonth: false })
    expect(g[3]).toEqual({ date: '2026-10-01', day: 1, inMonth: true })
  })
})

describe('VxDateInput', () => {
  const field = (props: Record<string, unknown> = {}) => {
    const w = mount(VxDateInput, {
      attachTo: document.body,
      props: { modelValue: '', 'onUpdate:modelValue': (v: string) => w.setProps({ modelValue: v }), ...props },
    })
    return w
  }

  it('takes typed text once it is a whole date, and tidies it on blur', async () => {
    const w = field()
    const input = w.get('input')
    const type = (t: string) => {
      ;(input.element as HTMLInputElement).value = t
      return input.trigger('input') // setValue would also fire change, i.e. leave the field
    }
    await type('2026-10-2')
    expect(w.props('modelValue')).toBe('')
    await type('2026/10/24')
    expect(w.props('modelValue')).toBe('2026-10-24')
    await input.trigger('change')
    expect((input.element as HTMLInputElement).value).toBe('2026-10-24')
    w.unmount()
  })

  it('marks text that is not a date, or out of range, invalid and keeps the value', async () => {
    const w = field({ modelValue: '2026-10-01', max: '2026-12-31' })
    const input = w.get('input')
    await input.setValue('2027-01-05')
    await input.trigger('change')
    expect(input.attributes('aria-invalid')).toBe('true')
    expect(w.props('modelValue')).toBe('2026-10-01')
    w.unmount()
  })

  it('shows date and time with a space and stores the native shape', async () => {
    const w = field({ time: true, modelValue: '2026-10-23T14:05' })
    expect((w.get('input').element as HTMLInputElement).value).toBe('2026-10-23 14:05')
    await w.get('input').setValue('2026-10-24 08:30')
    expect(w.props('modelValue')).toBe('2026-10-24T08:30')
    w.unmount()
  })

  it('keeps seconds with `seconds`, from typing and from the calendar', async () => {
    const w = field({ time: true, seconds: true, modelValue: '2026-10-23T14:05:09' })
    const input = w.get('input')
    expect((input.element as HTMLInputElement).value).toBe('2026-10-23 14:05:09')
    expect(input.attributes('placeholder')).toBe('YYYY-MM-DD HH:mm:ss')
    ;(input.element as HTMLInputElement).value = '2026-10-24 08:30'
    await input.trigger('input')
    expect(w.props('modelValue')).toBe('2026-10-23T14:05:09') // not whole until the seconds are typed
    await input.setValue('2026-10-24 08:30:15')
    expect(w.props('modelValue')).toBe('2026-10-24T08:30:15')
    await w.get('[aria-label="Choose from a calendar"]').trigger('click')
    await flushPromises()
    document.body.querySelector<HTMLButtonElement>('[aria-label="2026-10-10"]')!.click()
    await flushPromises()
    expect(w.props('modelValue')).toBe('2026-10-10T08:30:15')
    w.unmount()
  })

  it('picks a day from the calendar and keeps the time', async () => {
    const w = field({ time: true, modelValue: '2026-10-23T14:05' })
    await w.get('[aria-label="Choose from a calendar"]').trigger('click')
    await flushPromises()
    document.body.querySelector<HTMLButtonElement>('[aria-label="2026-10-10"]')!.click()
    await flushPromises()
    expect(w.props('modelValue')).toBe('2026-10-10T14:05')
    expect(document.body.querySelector('.vx-cal')).toBeNull()
    w.unmount()
  })
})
