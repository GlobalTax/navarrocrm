import React, { useEffect, useMemo, useState } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useApp } from '@/contexts/AppContext'

function formatPeriod(date = new Date()): string {
  const y = date.getFullYear()
  const m = `${date.getMonth() + 1}`.padStart(2, '0')
  return `${y}-${m}`
}

interface HoursRow {
  service_contract_id: string
  contact_id: string
  client_name: string | null
  service_type: 'accounting' | 'tax' | 'labor'
  allocated_hours: number
  actual_hours: number
  delta_hours: number
}

const RecurringServicesDashboard: React.FC = () => {
  useEffect(() => {
    document.title = 'Servicios recurrentes — Dashboard'
  }, [])

  const { user } = useApp()
  const [period] = useState<string>(formatPeriod())
  const [hours, setHours] = useState<HoursRow[]>([])
  const [taskCounts, setTaskCounts] = useState({ created: 0, completed: 0, pending: 0 })

  useEffect(() => {
    const load = async () => {
      if (!user?.org_id) return
      // Hours
      const { data } = await supabase.rpc('get_monthly_service_hours', { org_uuid: user.org_id, period })
      setHours((data as HoursRow[]) || [])
      // Tasks for this period (heurística: título contiene el periodo)
      const start = new Date(`${period}-01T00:00:00Z`)
      const end = new Date(start)
      end.setUTCMonth(end.getUTCMonth() + 1)
      const { data: tasks } = await supabase
        .from('tasks')
        .select('id,status,created_at,title')
        .eq('org_id', user.org_id)
        .gte('created_at', start.toISOString())
        .lt('created_at', end.toISOString())
        .ilike('title', `%${period}%`)
      const created = tasks?.length || 0
      const completed = (tasks || []).filter(t => t.status === 'completed').length
      const pending = created - completed
      setTaskCounts({ created, completed, pending })
    }
    load()
  }, [user?.org_id, period])

  const totals = useMemo(() => {
    const allocated = hours.reduce((a, r) => a + Number(r.allocated_hours || 0), 0)
    const actual = hours.reduce((a, r) => a + Number(r.actual_hours || 0), 0)
    return { allocated, actual, delta: actual - allocated }
  }, [hours])

  const topDeviations = useMemo(() => {
    return [...hours].sort((a, b) => Number(b.delta_hours) - Number(a.delta_hours)).slice(0, 5)
  }, [hours])

  return (
    <main className="p-6 space-y-6">
      <header>
        <h1 className="text-xl font-semibold">Servicios recurrentes — Dashboard</h1>
        <p className="text-sm text-gray-600">Periodo: {period}</p>
      </header>

      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="border rounded-lg p-4 bg-white">
          <div className="text-sm text-gray-600">Tareas creadas</div>
          <div className="text-2xl font-semibold">{taskCounts.created}</div>
        </div>
        <div className="border rounded-lg p-4 bg-white">
          <div className="text-sm text-gray-600">Tareas completadas</div>
          <div className="text-2xl font-semibold">{taskCounts.completed}</div>
        </div>
        <div className="border rounded-lg p-4 bg-white">
          <div className="text-sm text-gray-600">Tareas pendientes</div>
          <div className="text-2xl font-semibold">{taskCounts.pending}</div>
        </div>
      </section>

      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="border rounded-lg p-4 bg-white">
          <div className="text-sm text-gray-600">Horas planificadas</div>
          <div className="text-2xl font-semibold">{totals.allocated.toFixed(2)} h</div>
        </div>
        <div className="border rounded-lg p-4 bg-white">
          <div className="text-sm text-gray-600">Horas registradas</div>
          <div className="text-2xl font-semibold">{totals.actual.toFixed(2)} h</div>
        </div>
        <div className="border rounded-lg p-4 bg-white">
          <div className="text-sm text-gray-600">Desvío total</div>
          <div className={`text-2xl font-semibold ${totals.delta >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>{totals.delta.toFixed(2)} h</div>
        </div>
      </section>

      <section>
        <h2 className="text-lg font-medium mb-3">Top desvíos</h2>
        <div className="grid gap-3">
          {topDeviations.length === 0 && (
            <div className="text-gray-500">Sin datos</div>
          )}
          {topDeviations.map((r) => (
            <div key={`${r.service_contract_id}-${r.service_type}`} className="border rounded-md p-3 bg-white flex items-center justify-between">
              <div>
                <div className="font-medium">{r.client_name || r.contact_id}</div>
                <div className="text-sm text-gray-600 capitalize">{r.service_type}</div>
              </div>
              <div className={`text-base font-semibold ${Number(r.delta_hours) >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                {Number(r.delta_hours || 0).toFixed(2)} h
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}

export default RecurringServicesDashboard
