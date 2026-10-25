import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import VxTable from '../src/components/data/VxTable.vue'

// Checked by `npm run typecheck`: an interface has no index signature, so a `Record<string, unknown>` bound rejects it.
interface Incident {
  id: number
  title: string
}

describe('VxTable row types', () => {
  it('takes interface rows', () => {
    const rows: Incident[] = [{ id: 1, title: 'Gatus down' }]
    const w = mount(VxTable<Incident>, {
      props: { columns: [{ key: 'title', label: 'Title' }], rows, rowKey: 'id', rowClass: (r) => ({ old: r.id < 2 }) },
    })
    expect(w.get('tbody td').text()).toBe('Gatus down')
    expect(w.get('tbody tr').classes()).toContain('old')
  })
})
