import React, { useEffect, useMemo, useState } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useApp } from '@/contexts/AppContext'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import Papa from 'papaparse'

function formatPeriod(date = new Date()): string {
  const y = date.getFullYear()
  const m = `${date.getMonth() + 1}`.padStart(2, '0')
  return `${y}-${m}`
}

interface RowItem {
  service_contract_id: string
  contact_id: string
  client_name: string | null
  service_type: 'accounting' | 'tax' | 'labor'
  allocated_hours: number
  actual_hours: number
  delta_hours: number
}

const ReportsMonthlyServiceHours: React.FC = () => {
  // SEO basics
  useEffect(() => {
    document.title = 'Horas por cliente/servicio (mensual)'
  }, [])

  const { user } = useApp()
  const [period, setPeriod] = useState<string>(formatPeriod())
  const [rows, setRows] = useState<RowItem[]>([])
  const [loading, setLoading] = useState(false)

  const loadData = async () => {
    if (!user?.org_id) return
    try {
      setLoading(true)
      const { data, error } = await supabase.rpc('get_monthly_service_hours', {
        org_uuid: user.org_id,
        period
      })
      if (error) throw error
      setRows((data as RowItem[]) || [])
    } catch (e: any) {
      console.error(e)
      toast.error('No se pudo cargar el reporte')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [period, user?.org_id])

  const totals = useMemo(() => {
    const allocated = rows.reduce((acc, r) => acc + Number(r.allocated_hours || 0), 0)
    const actual = rows.reduce((acc, r) => acc + Number(r.actual_hours || 0), 0)
    const delta = actual - allocated
    return { allocated, actual, delta }
  }, [rows])

  const exportCSV = () => {
    const csv = Papa.unparse(
      rows.map((r) => ({
        Periodo: period,
        Cliente: r.client_name || r.contact_id,
        Contrato: r.service_contract_id,
        Servicio: r.service_type,
        Planificado: r.allocated_hours,
        Registrado: r.actual_hours,
        Desvio: r.delta_hours,
      }))
    )
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `horas_por_cliente_${period}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <main className="p-6 space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Horas por cliente/servicio (mensual)</h1>
        <div className="flex items-center gap-3">
          <input
            aria-label="Periodo"
            type="month"
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="border rounded-md px-3 py-2"
          />
          <Button onClick={loadData} disabled={loading}>Actualizar</Button>
          <Button variant="outline" onClick={exportCSV} disabled={rows.length === 0}>Exportar CSV</Button>
        </div>
      </header>

      <section aria-labelledby="resumen">
        <div id="resumen" className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="border rounded-lg p-4 bg-white">
            <div className="text-sm text-gray-600">Planificado</div>
            <div className="text-2xl font-semibold">{totals.allocated.toFixed(2)} h</div>
          </div>
          <div className="border rounded-lg p-4 bg-white">
            <div className="text-sm text-gray-600">Registrado</div>
            <div className="text-2xl font-semibold">{totals.actual.toFixed(2)} h</div>
          </div>
          <div className="border rounded-lg p-4 bg-white">
            <div className="text-sm text-gray-600">Desvío</div>
            <div className={`text-2xl font-semibold ${totals.delta >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>{totals.delta.toFixed(2)} h</div>
          </div>
        </div>
      </section>

      <section aria-labelledby="tabla">
        <div className="overflow-auto border rounded-lg">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-4 py-2">Cliente</th>
                <th className="text-left px-4 py-2">Servicio</th>
                <th className="text-right px-4 py-2">Planificado</th>
                <th className="text-right px-4 py-2">Registrado</th>
                <th className="text-right px-4 py-2">Desvío</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-gray-500">Sin datos para {period}</td>
                </tr>
              )}
              {rows.map((r) => (
                <tr key={`${r.service_contract_id}-${r.service_type}`} className="border-t">
                  <td className="px-4 py-2">{r.client_name || r.contact_id}</td>
                  <td className="px-4 py-2 capitalize">{r.service_type}</td>
                  <td className="px-4 py-2 text-right">{Number(r.allocated_hours || 0).toFixed(2)} h</td>
                  <td className="px-4 py-2 text-right">{Number(r.actual_hours || 0).toFixed(2)} h</td>
                  <td className={`px-4 py-2 text-right ${Number(r.delta_hours) >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>{Number(r.delta_hours || 0).toFixed(2)} h</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  )
}

export default ReportsMonthlyServiceHours
