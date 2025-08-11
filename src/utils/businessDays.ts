export function businessDaysBetween(start: Date | string | null | undefined, end: Date | string | null | undefined): number {
  if (!start || !end) return 0
  const s = new Date(start)
  const e = new Date(end)
  let count = 0
  // Normalize to midnight to avoid DST issues
  let cur = new Date(s.getFullYear(), s.getMonth(), s.getDate())
  const last = new Date(e.getFullYear(), e.getMonth(), e.getDate())
  const step = cur <= last ? 1 : -1
  while ((step === 1 && cur <= last) || (step === -1 && cur >= last)) {
    const day = cur.getDay()
    if (day !== 0 && day !== 6) count += 1
    cur.setDate(cur.getDate() + step)
  }
  // If counting forward inclusive, subtract 1 to represent full days passed between
  return Math.max(0, count - (step === 1 ? 1 : 0))
}

export function elapsedBusinessDaysSince(date: Date | string | null | undefined): number {
  if (!date) return 0
  return businessDaysBetween(date, new Date())
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
