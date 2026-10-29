// Tab titles for a site: "<page> · <site>" from each route's `meta.title`, or just the site on a route without one.
// Typed against the one router method it needs, so the library still doesn't depend on vue-router.

export interface TitleRouter {
  afterEach(hook: (to: { meta: Record<string | number | symbol, unknown> }) => unknown): unknown
}

/** Sets `document.title` after every navigation: `syncDocumentTitle(router, 'vexoul.net')` in main.ts. */
export function syncDocumentTitle(router: TitleRouter, site: string) {
  router.afterEach((to) => {
    const page = typeof to.meta.title === 'string' ? to.meta.title : ''
    document.title = page ? `${page} · ${site}` : site
  })
}
