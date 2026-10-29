import { describe, expect, it } from 'vitest'
import { defineComponent } from 'vue'
import { createMemoryHistory, createRouter } from 'vue-router'
import { syncDocumentTitle } from '../src/utils/title'

describe('syncDocumentTitle', () => {
  it('titles each page "<page> · <site>", and the site alone without meta.title', async () => {
    const page = defineComponent({ render: () => null })
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [
        { path: '/', component: page },
        { path: '/obs', component: page, meta: { title: 'OBS sources' } },
      ],
    })
    syncDocumentTitle(router, 'vexoul.net')
    await router.push('/obs')
    expect(document.title).toBe('OBS sources · vexoul.net')
    await router.push('/')
    expect(document.title).toBe('vexoul.net')
  })
})
