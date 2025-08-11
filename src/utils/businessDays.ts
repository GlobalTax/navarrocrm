// Business day utilities with regional holidays support
// Holidays are provided as a set of ISO dates (YYYY-MM-DD)

export type BusinessDayOptions = {
  holidays?: Set<string>
  weekendDays?: number[] // 0=Sun .. 6=Sat
}

export function toISODate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function normalizeDate(input: Date | string): Date {
  const d = new Date(input)
  return new Date(d.getFullYear(), d.getMonth(), d.getDate())
}

export function isWeekend(d: Date, weekendDays: number[] = [0, 6]) {
  return weekendDays.includes(d.getDay())
}

export function isHoliday(d: Date, holidays?: Set<string>) {
  if (!holidays || holidays.size === 0) return false
  return holidays.has(toISODate(d))
}

export function addCalendarDays(input: Date | string, n: number): Date {
  const d = normalizeDate(input)
  d.setDate(d.getDate() + n)
  return d
}

export function addBusinessDays(input: Date | string, n: number, opts: BusinessDayOptions = {}): Date {
  const holidays = opts.holidays
  const weekendDays = opts.weekendDays ?? [0, 6]
  const step = n >= 0 ? 1 : -1
  let remaining = Math.abs(n)
  let cur = normalizeDate(input)

  while (remaining > 0) {
    cur = addCalendarDays(cur, step)
    if (!isWeekend(cur, weekendDays) && !isHoliday(cur, holidays)) {
      remaining -= 1
    }
  }
  return cur
}

export function diffBusinessDays(a: Date | string, b: Date | string, opts: BusinessDayOptions = {}): number {
  const holidays = opts.holidays
  const weekendDays = opts.weekendDays ?? [0, 6]
  let start = normalizeDate(a)
  let end = normalizeDate(b)
  const invert = start > end
  if (invert) [start, end] = [end, start]

  let count = 0
  let cur = start
  while (cur < end) {
    if (!isWeekend(cur, weekendDays) && !isHoliday(cur, holidays)) count += 1
    cur = addCalendarDays(cur, 1)
  }
  return invert ? -count : count
}

// Legacy helpers kept for compatibility
export function businessDaysBetween(start: Date | string | null | undefined, end: Date | string | null | undefined): number {
  if (!start || !end) return 0
  return diffBusinessDays(start, end)
}

export function elapsedBusinessDaysSince(date: Date | string | null | undefined): number {
  if (!date) return 0
  return diffBusinessDays(date, new Date())
}

export function countdownTo(target: Date | string | null | undefined) {
  const t = target ? new Date(target) : null
  const now = new Date()
  const totalMs = t ? t.getTime() - now.getTime() : 0
  const totalSec = Math.max(0, Math.floor(totalMs / 1000))
  const days = Math.floor(totalSec / (60 * 60 * 24))
  const hours = Math.floor((totalSec % (60 * 60 * 24)) / (60 * 60))
  const minutes = Math.floor((totalSec % (60 * 60)) / 60)
  const seconds = totalSec % 60
  return { days, hours, minutes, seconds, totalMs }
}
