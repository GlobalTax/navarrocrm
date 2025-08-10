import React, { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { useApp } from '@/contexts/AppContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'

function formatPeriod(date = new Date()): string {
  const y = date.getUTCFullYear()
  const m = `${date.getUTCMonth() + 1}`.padStart(2, '0')
  return `${y}-${m}`
}

export function TimePlanningTab() {
  const { user } = useApp()
  const [period, setPeriod] = useState(formatPeriod())
  const [selectedContract, setSelectedContract] = useState<string>('')
  const [targetUser, setTargetUser] = useState<string>('')
  const [plannedHours, setPlannedHours] = useState<string>('')
  const [noteService, setNoteService] = useState<string>('')

  const { data: contracts = [], refetch } = useQuery({
    queryKey: ['planning-contracts', user?.org_id],
    queryFn: async () => {
      if (!user?.org_id) return []
      const { data, error } = await supabase
        .from('recurring_service_contracts')
        .select('id, client_id, services, day_of_month, contacts:client_id(name)')
        .eq('org_id', user.org_id)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
      if (error) {
        console.error(error)
        return []
      }
      return data || []
    },
    enabled: !!user?.org_id,
  })

  const { data: me } = useQuery({
    queryKey: ['current-user-profile', user?.id],
    queryFn: async () => ({ id: user?.id }),
    enabled: !!user?.id,
  })

  React.useEffect(() => {
    if (me?.id) setTargetUser(me.id)
  }, [me?.id])

  const saveAllocation = async () => {
    if (!user?.org_id || !selectedContract || !targetUser || !plannedHours) {
      toast.error('Completa contrato, usuario y horas')
      return
    }
    const hours = Number(plannedHours)
    if (isNaN(hours) || hours <= 0) {
      toast.error('Horas inválidas')
      return
    }

    try {
      const payload = {
        org_id: user.org_id,
        contract_id: selectedContract,
        period,
        target_type: 'user',
        target_id: targetUser,
        planned_hours: hours,
        notes: noteService ? `service:${noteService}` : null,
      }

      const { error } = await supabase
        .from('service_hours_allocations')
        .upsert(payload as any, { onConflict: 'org_id,contract_id,period,target_type,target_id' })
      if (error) throw error
      toast.success('Planificación guardada')
      setPlannedHours('')
      await refetch()
    } catch (e: any) {
      console.error(e)
      toast.error('No se pudo guardar la planificación')
    }
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <h3 className="text-lg font-medium text-slate-900">Planificación mensual</h3>
        <p className="text-sm text-slate-600">Asigna horas objetivo por contrato y servicio</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
        <div>
          <label className="text-sm font-medium">Periodo</label>
          <Input
            placeholder="YYYY-MM"
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
          />
        </div>

        <div className="md:col-span-2">
          <label className="text-sm font-medium">Contrato</label>
          <Select value={selectedContract} onValueChange={setSelectedContract}>
            <SelectTrigger>
              <SelectValue placeholder="Selecciona contrato" />
            </SelectTrigger>
            <SelectContent>
              {contracts.map((c: any) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.contacts?.name || c.client_id} · #{c.id.slice(0,8)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-sm font-medium">Usuario</label>
          <Input value={targetUser} onChange={(e) => setTargetUser(e.target.value)} placeholder="UUID usuario" />
        </div>

        <div>
          <label className="text-sm font-medium">Servicio (opcional)</label>
          <Select value={noteService} onValueChange={setNoteService}>
            <SelectTrigger>
              <SelectValue placeholder="Servicio" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">(sin especificar)</SelectItem>
              <SelectItem value="accounting">Contabilidad</SelectItem>
              <SelectItem value="tax">Fiscal</SelectItem>
              <SelectItem value="labor">Laboral</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-sm font-medium">Horas</label>
          <Input type="number" step="0.1" placeholder="0" value={plannedHours} onChange={(e) => setPlannedHours(e.target.value)} />
        </div>
      </div>

      <div className="flex justify-end mt-3">
        <Button onClick={saveAllocation}>Guardar planificación</Button>
      </div>
    </div>
  )
}
