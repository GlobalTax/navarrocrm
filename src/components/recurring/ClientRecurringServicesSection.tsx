import React, { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { useApp } from '@/contexts/AppContext'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { toast } from 'sonner'
import { RecurringServiceContractDialog } from './RecurringServiceContractDialog'

interface ClientRecurringServicesSectionProps {
  clientId: string
  clientName: string
}

function formatPeriod(date = new Date()): string {
  const y = date.getUTCFullYear()
  const m = `${date.getUTCMonth() + 1}`.padStart(2, '0')
  return `${y}-${m}`
}

function nextPeriod(period: string): string {
  const [y, m] = period.split('-').map(Number)
  const d = new Date(Date.UTC(y, m - 1, 1))
  d.setUTCMonth(d.getUTCMonth() + 1)
  return formatPeriod(d)
}

function dateWithDay(period: string, day: number): string {
  const [y, m] = period.split('-').map(Number)
  const d = new Date(Date.UTC(y, m - 1, Math.min(28, day)))
  d.setUTCDate(day)
  const wd = d.getUTCDay()
  if (wd === 0) d.setUTCDate(d.getUTCDate() + 1)
  if (wd === 6) d.setUTCDate(d.getUTCDate() + 2)
  return d.toISOString().slice(0, 10)
}

export function ClientRecurringServicesSection({ clientId, clientName }: ClientRecurringServicesSectionProps) {
  const { user } = useApp()
  const [open, setOpen] = useState(false)
  const [period] = useState(formatPeriod())
  const canManage = !!user?.role && ['partner','area_manager'].includes(user.role as string)

  const { data: contracts = [], refetch } = useQuery({
    queryKey: ['recurring-contracts', clientId],
    queryFn: async () => {
      if (!user?.org_id) return []
      const { data, error } = await supabase
        .from('recurring_service_contracts')
        .select('*')
        .eq('org_id', user.org_id)
        .eq('client_id', clientId)
        .order('created_at', { ascending: false })
      if (error) {
        console.error('Error loading contracts', error)
        return []
      }
      return data || []
    },
    enabled: !!user?.org_id && !!clientId,
  })

  const { data: monthHours = [] } = useQuery({
    queryKey: ['monthly-service-hours', user?.org_id, period],
    queryFn: async () => {
      if (!user?.org_id) return []
      const { data, error } = await supabase.rpc('get_monthly_service_hours', {
        org_uuid: user.org_id,
        period
      })
      if (error) {
        console.error('Error loading monthly hours', error)
        return []
      }
      return data as any[]
    },
    enabled: !!user?.org_id,
  })

  const current = period
  const next = useMemo(() => nextPeriod(period), [period])

  const onGenerate = async (contractId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('generate-recurring-tasks', {
        body: { period: 'current', contract_id: contractId }
      })
      if (error) throw error
      toast.success('Tareas generadas correctamente')
      await refetch()
      console.log('Run result', data)
    } catch (e: any) {
      console.error(e)
      toast.error('No se pudo generar las tareas')
    }
  }

  const onSkip = async (contractId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('generate-recurring-tasks', {
        body: { period: 'current', contract_id: contractId, action: 'skip' }
      })
      if (error) throw error
      toast.success('Mes marcado como saltado')
      await refetch()
      console.log('Skip result', data)
    } catch (e: any) {
      console.error(e)
      toast.error('No se pudo saltar este mes')
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-slate-900">Servicios Recurrentes</h3>
          <p className="text-sm text-slate-600">Contratos activos para {clientName}</p>
        </div>
        {canManage && (
          <Button onClick={() => setOpen(true)} className="bg-slate-900 hover:bg-slate-800">Nuevo contrato</Button>
        )}
      </div>

      {contracts.length === 0 ? (
        <div className="text-center py-12 bg-slate-50 rounded-lg border border-slate-200">
          <p className="text-slate-600 mb-4">No hay contratos de servicios recurrentes</p>
          {canManage && (
            <Button size="sm" onClick={() => setOpen(true)} className="bg-slate-900 hover:bg-slate-800">Crear contrato</Button>
          )}
        </div>
      ) : (
        <div className="grid gap-4">
          {contracts.map((c: any) => {
            const services = c.services || {}
            const activeServices = Object.keys(services).filter((k) => services[k])
            return (
              <div key={c.id} className="border border-slate-200 rounded-lg p-4 bg-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-slate-900">Contrato #{c.id.slice(0, 8)}</h4>
                    <div className="mt-1 flex gap-2 flex-wrap">
                      {activeServices.map((s) => (
                        <Badge key={s} variant="outline">{s}</Badge>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {canManage && (
                      <>
                        <Button variant="outline" size="sm" onClick={() => onGenerate(c.id)}>Generar tareas de este mes</Button>
                        <Button variant="outline" size="sm" onClick={() => onSkip(c.id)}>Saltar este mes</Button>
                      </>
                    )}
                  </div>
                </div>

                <div className="mt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {activeServices.map((s) => {
                      const target = c.sla_config?.[s] ?? 0
                      const found = (monthHours as any[]).find(
                        (h: any) => h.service_contract_id === c.id && h.service_type === s
                      )
                      const actual = Number(found?.actual_hours || 0)
                      const delta = actual - Number(target)
                      const statusColor = delta <= 0 ? 'text-emerald-700' : delta <= target * 0.2 ? 'text-amber-600' : 'text-red-600'
                      return (
                        <div key={s} className="border border-slate-200 rounded-md p-3 bg-slate-50">
                          <div className="text-sm text-slate-700 font-medium mb-2">{s}</div>
                          <div className="text-sm text-slate-600">Mes actual: <span className="font-medium text-slate-900">{current}</span> · vencimiento {dateWithDay(current, c.day_of_month)}</div>
                          <div className="text-sm text-slate-600">SLA objetivo: <span className="font-medium">{Number(target).toFixed(1)} h</span> · Real: <span className="font-medium">{actual.toFixed(1)} h</span> · <span className={`font-semibold ${statusColor}`}>{delta <= 0 ? 'En verde' : delta <= target * 0.2 ? 'Ámbar' : 'Rojo'}</span></div>
                          <div className="text-sm text-slate-600">Siguiente mes: <span className="font-medium text-slate-900">{next}</span> · vencimiento {dateWithDay(next, c.day_of_month)}</div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Nuevo contrato de servicios</DialogTitle>
          </DialogHeader>
          {canManage ? (
            <RecurringServiceContractDialog
              clientId={clientId}
              onClose={async () => {
                setOpen(false)
                await refetch()
              }}
            />
          ) : (
            <div className="text-sm text-slate-600">No tienes permisos para crear/editar contratos.</div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
