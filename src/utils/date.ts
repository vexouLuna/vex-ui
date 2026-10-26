// Dates as typed text: `YYYY-MM-DD`, and `YYYY-MM-DD HH:mm` (24 h) with a time. Values are local wall time, in the
// same shape as the native inputs' (`2026-10-23`, `2026-10-23T14:05`, with seconds `2026-10-23T14:05:09` like
// `datetime-local` with `step=1`), so a form that used them keeps its values.

const pad = (n: number) => String(n).padStart(2, '0')

/** A Date's local day as `YYYY-MM-DD`. */
export const isoDate = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
/** A Date's local day and minute as `YYYY-MM-DDTHH:mm`, or to the second as `YYYY-MM-DDTHH:mm:ss`. */
export const isoDateTime = (d: Date, seconds = false) =>
  `${isoDate(d)}T${pad(d.getHours())}:${pad(d.getMinutes())}${seconds ? `:${pad(d.getSeconds())}` : ''}`

/** A value as it's shown in the field: the `T` becomes a space. */
export const showDate = (value: string) => value.replace('T', ' ')

const DATE_TIME = /^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})(?:[ T]+(\d{1,2}):(\d{2})(?::(\d{2})(?:\.\d+)?)?)?\s*(Z|[+-]\d{2}:?\d{2})?$/i

/**
 * Reads typed or pasted text as a value: `YYYY-MM-DD` (or `YYYY-MM-DDTHH:mm` with `time`). Takes `/` or `.` between
 * the date parts, a space or `T` before the time, and seconds; a pasted timestamp with a zone (`…Z`, `…+02:00`) is
 * turned into local time. A date alone, with `time`, is midnight; a time without `time` is dropped. Seconds are
 * kept with `seconds` (`YYYY-MM-DDTHH:mm:ss`) and dropped otherwise.
 * Returns `''` for blank text and `null` for anything that isn't a real date (`2026-02-30`, `25:00`).
 */
export function parseDate(text: string, time = false, seconds = false): string | null {
  const t = text.trim()
  if (!t) return ''
  const m = DATE_TIME.exec(t)
  if (!m) return null
  const [, y, mo, d, h = '0', mi = '0', s = '0', zone] = m
  const sec = seconds ? +s : 0
  let date = new Date(+y!, +mo! - 1, +d!, +h, +mi, sec)
  const real = date.getFullYear() === +y! && date.getMonth() === +mo! - 1 && date.getDate() === +d!
  if (!real || +h > 23 || +mi > 59 || +s > 59) return null
  if (zone) {
    const off = zone.toUpperCase() === 'Z' ? 0 : (zone[0] === '-' ? -1 : 1) * (+zone.slice(1, 3) * 60 + +zone.slice(-2))
    date = new Date(Date.UTC(+y!, +mo! - 1, +d!, +h, +mi, sec) - off * 60000)
  }
  return time ? isoDateTime(date, seconds) : isoDate(date)
}

/** The 6 weeks (Monday first) shown for a month: each day as `YYYY-MM-DD`, with whether it's in that month. */
export function monthGrid(year: number, month: number): { date: string; day: number; inMonth: boolean }[] {
  const first = new Date(year, month, 1)
  const start = new Date(year, month, 1 - ((first.getDay() + 6) % 7))
  return Array.from({ length: 42 }, (_, i) => {
    const d = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i)
    return { date: isoDate(d), day: d.getDate(), inMonth: d.getMonth() === month }
  })
}
