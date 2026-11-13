import { readonly, ref } from 'vue'

export type ToastKind = 'ok' | 'info' | 'error'

export interface Toast {
  id: number
  message: string
  kind: ToastKind
}

const toasts = ref<Toast[]>([])
let nextId = 1
const MAX = 3
// Errors stay long enough to read (WCAG 2.2.1); hovering or focusing any toast pauses its timer.
const DURATION: Record<ToastKind, number> = { ok: 1800, info: 1800, error: 6000 }
const timers = new Map<number, { handle?: ReturnType<typeof setTimeout>; left: number; since: number }>()

function dismiss(id: number) {
  const t = timers.get(id)
  if (t) clearTimeout(t.handle)
  timers.delete(id)
  toasts.value = toasts.value.filter((x) => x.id !== id)
}

function start(id: number) {
  const t = timers.get(id)
  if (!t) return
  t.since = Date.now()
  t.handle = setTimeout(() => dismiss(id), t.left)
}

/** Stop a toast's countdown (pointer or focus is on it). */
function pause(id: number) {
  const t = timers.get(id)
  if (!t || t.handle === undefined) return
  clearTimeout(t.handle)
  t.handle = undefined
  t.left = Math.max(1000, t.left - (Date.now() - t.since))
}

function resume(id: number) {
  const t = timers.get(id)
  if (t && t.handle === undefined) start(id)
}

/** Show a short confirmation ("Link copied"). Rendered by <VxToastHost>, which VxSiteShell includes. */
function show(message: string, opts: { kind?: ToastKind; duration?: number } = {}): number {
  const id = nextId++
  const kind = opts.kind ?? 'ok'
  let list = [...toasts.value]
  if (list.length >= MAX) {
    // Make room by dropping the oldest non-error toast, so a burst of confirmations can't push out an unread error.
    const i = list.findIndex((x) => x.kind !== 'error')
    const [gone] = list.splice(i < 0 ? 0 : i, 1)
    dismiss(gone!.id)
    list = list.filter((x) => x.id !== gone!.id)
  }
  toasts.value = [...list, { id, message, kind }]
  timers.set(id, { left: opts.duration ?? DURATION[kind], since: 0 })
  start(id)
  return id
}

export function useToast() {
  return { toasts: readonly(toasts), show, dismiss, pause, resume }
}
