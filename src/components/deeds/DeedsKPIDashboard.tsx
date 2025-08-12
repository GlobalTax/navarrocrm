import React from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, BarChart, Bar, Legend } from 'recharts'
import { addBusinessDays, diffBusinessDays } from '@/utils/businessDays'

// Tipado mínimo necesario del objeto escritura
export interface DeedKPIItem {
  id: string
  deed_type?: string | null
  signing_date?: string | null
  registry_submission_date?: string | null
  registration_date?: string | null
  model600_deadline?: string | null
  asiento_expiration_date?: string | null
  qualification_started_at?: string | null
  qualification_completed_at?: string | null
  registry_type?: 'RP' | 'RM' | string | null
  status?: string | null
  itp_ajd_required?: boolean | null
  itp_ajd_presented_at?: string | null
  itp_ajd_paid_at?: string | null
  tax_accredited_at?: string | null
}

interface Props {
  deeds: DeedKPIItem[]
}

function toMonthKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

function daysBetween(a?: string | null, b?: string | null) {
  if (!a || !b) return null
  const start = new Date(a)
  const end = new Date(b)
  if (isNaN(start.getTime()) || isNaN(end.getTime())) return null
  const ms = end.getTime() - start.getTime()
  return ms >= 0 ? Math.round(ms / (1000 * 60 * 60 * 24)) : null
}

const DeedsKPIDashboard: React.FC<Props> = ({ deeds }) => {
  const [typeFilter, setTypeFilter] = React.useState<string>('all')
  const [months, setMonths] = React.useState<number>(6)

  const deedTypes = React.useMemo(() => {
    const s = new Set<string>()
    deeds.forEach(d => { if (d.deed_type) s.add(d.deed_type) })
    return Array.from(s).sort()
  }, [deeds])

  const filtered = React.useMemo(() => {
    return typeFilter === 'all' ? deeds : deeds.filter(d => d.deed_type === typeFilter)
  }, [deeds, typeFilter])

  const now = new Date()
  const startCut = new Date(now.getFullYear(), now.getMonth() - (months - 1), 1)

  const kpis = React.useMemo(() => {
    const within600Eligible = filtered.filter(d => d.signing_date)
    let within600Ok = 0
    within600Eligible.forEach(d => {
      const deadline = d.model600_deadline ? new Date(d.model600_deadline) : (d.signing_date ? addBusinessDays(new Date(d.signing_date), 30) : null)
      const acc = d.tax_accredited_at || d.itp_ajd_presented_at || d.itp_ajd_paid_at
      if (deadline && acc) {
        const accDate = new Date(acc)
        if (!isNaN(accDate.getTime()) && accDate <= deadline) within600Ok += 1
      }
    })
    const pctWithin600 = within600Eligible.length ? Math.round((within600Ok / within600Eligible.length) * 1000) / 10 : 0

    const signerToSubmission = filtered
      .map(d => daysBetween(d.signing_date || null, d.registry_submission_date || null))
      .filter((v): v is number => v !== null)
    const avgSignerToSubmission = signerToSubmission.length ? Math.round(signerToSubmission.reduce((a, b) => a + b, 0) / signerToSubmission.length) : 0

    const seatEligible = filtered.filter(d => d.asiento_expiration_date)
    const expiredSeats = seatEligible.filter(d => {
      const exp = new Date(d.asiento_expiration_date!)
      return exp < now && (d.status ?? '') !== 'INSCRITA'
    }).length
    const pctExpiredSeats = seatEligible.length ? Math.round((expiredSeats / seatEligible.length) * 1000) / 10 : 0

    const qualDurations = filtered
      .map(d => {
        const start = d.qualification_started_at
        const end = d.qualification_completed_at || null
        if (!start) return null
        const endDate = end ? new Date(end) : now
        const startDate = new Date(start)
        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) return null
        const days = Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
        return days >= 0 ? days : null
      })
      .filter((v): v is number => v !== null)
    const avgQualificationDays = qualDurations.length ? Math.round(qualDurations.reduce((a, b) => a + b, 0) / qualDurations.length) : 0

    const negativeCount = filtered.filter(d => (d.status ?? '') === 'DEFECTOS').length
    const pctNegative = filtered.length ? Math.round((negativeCount / filtered.length) * 1000) / 10 : 0

    const rpDurations = filtered
      .filter(d => (d.registry_type ?? '') === 'RP')
      .map(d => daysBetween(d.signing_date || null, d.registration_date || null))
      .filter((v): v is number => v !== null)
    const rmDurations = filtered
      .filter(d => (d.registry_type ?? '') === 'RM')
      .map(d => daysBetween(d.signing_date || null, d.registration_date || null))
      .filter((v): v is number => v !== null)

    const avgRP = rpDurations.length ? Math.round(rpDurations.reduce((a, b) => a + b, 0) / rpDurations.length) : 0
    const avgRM = rmDurations.length ? Math.round(rmDurations.reduce((a, b) => a + b, 0) / rmDurations.length) : 0

    return { pctWithin600, avgSignerToSubmission, pctExpiredSeats, avgQualificationDays, pctNegative, avgRP, avgRM }
  }, [filtered, now])

  const monthly = React.useMemo(() => {
    // construir slots por mes desde startCut a now
    const slots: Record<string, { key: string; within600Ok: number; within600Total: number; avgSubDaysAcc: number; avgSubDaysCount: number }> = {}
    const cur = new Date(startCut)
    while (cur <= now) {
      const key = toMonthKey(cur)
      slots[key] = { key, within600Ok: 0, within600Total: 0, avgSubDaysAcc: 0, avgSubDaysCount: 0 }
      cur.setMonth(cur.getMonth() + 1)
    }

    filtered.forEach(d => {
      if (!d.signing_date) return
      const sDate = new Date(d.signing_date)
      const key = toMonthKey(new Date(sDate.getFullYear(), sDate.getMonth(), 1))
      if (!slots[key]) return

      // dentro 600
      const deadline = d.model600_deadline ? new Date(d.model600_deadline) : addBusinessDays(sDate, 30)
      const acc = d.tax_accredited_at || d.itp_ajd_presented_at || d.itp_ajd_paid_at
      if (acc) {
        slots[key].within600Total += 1
        const accDate = new Date(acc)
        if (!isNaN(accDate.getTime()) && accDate <= deadline) slots[key].within600Ok += 1
      }

      // firma -> presentación
      const dd = daysBetween(d.signing_date, d.registry_submission_date)
      if (typeof dd === 'number') {
        slots[key].avgSubDaysAcc += dd
        slots[key].avgSubDaysCount += 1
      }
    })

    const data = Object.values(slots).map(s => ({
      month: s.key,
      within600: s.within600Total ? Math.round((s.within600Ok / s.within600Total) * 1000) / 10 : 0,
      avgFirmaPresentacion: s.avgSubDaysCount ? Math.round(s.avgSubDaysAcc / s.avgSubDaysCount) : 0,
    }))

    return data
  }, [filtered, startCut, now])

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-center gap-3">
        <div className="flex items-center gap-2">
          <label className="text-sm text-muted-foreground">Tipo de acto</label>
          <select className="border rounded-[10px] px-2 py-1" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
            <option value="all">Todos</option>
            {deedTypes.map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm text-muted-foreground">Meses</label>
          <select className="border rounded-[10px] px-2 py-1" value={months} onChange={(e) => setMonths(Number(e.target.value))}>
            {[3,6,12].map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <Card className="p-4 rounded-[10px] shadow-sm">
          <div className="text-xs text-muted-foreground">% dentro plazo 600</div>
          <div className="text-2xl font-semibold">{kpis.pctWithin600}%</div>
        </Card>
        <Card className="p-4 rounded-[10px] shadow-sm">
          <div className="text-xs text-muted-foreground">Media firma→presentación</div>
          <div className="text-2xl font-semibold">{kpis.avgSignerToSubmission} d</div>
        </Card>
        <Card className="p-4 rounded-[10px] shadow-sm">
          <div className="text-xs text-muted-foreground">% asientos caducados</div>
          <div className="text-2xl font-semibold">{kpis.pctExpiredSeats}%</div>
        </Card>
        <Card className="p-4 rounded-[10px] shadow-sm">
          <div className="text-xs text-muted-foreground">Media en EN_CALIFICACION</div>
          <div className="text-2xl font-semibold">{kpis.avgQualificationDays} d</div>
        </Card>
        <Card className="p-4 rounded-[10px] shadow-sm">
          <div className="text-xs text-muted-foreground">% calificación negativa</div>
          <div className="text-2xl font-semibold">{kpis.pctNegative}%</div>
        </Card>
        <Card className="p-4 rounded-[10px] shadow-sm">
          <div className="text-xs text-muted-foreground">Firma→inscripción</div>
          <div className="text-lg font-semibold flex items-center gap-2">
            <span>RP {kpis.avgRP} d</span>
            <Badge variant="secondary">RM {kpis.avgRM} d</Badge>
          </div>
        </Card>
      </div>

      <Card className="p-4 rounded-[10px] shadow-sm">
        <h3 className="text-sm font-medium mb-2">Tendencia mensual</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthly}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
                <Tooltip formatter={(v: any) => `${v}%`} />
                <Legend />
                <Bar dataKey="within600" name="% dentro 600" fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthly}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="avgFirmaPresentacion" name="Media firma→presentación (días)" stroke="hsl(var(--primary))" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </Card>
    </div>
  )
}

export default DeedsKPIDashboard
