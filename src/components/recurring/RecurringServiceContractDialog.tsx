import React from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { useApp } from '@/contexts/AppContext'
import { supabase } from '@/integrations/supabase/client'
import { toast } from 'sonner'

interface DialogProps {
  clientId: string
  onClose: () => void
}

interface SubtaskForm { title: string; due_offset_days: number }
interface ServiceTemplateForm { subtasks: SubtaskForm[] }

interface FormValues {
  services: { accounting: boolean; tax: boolean; labor: boolean }
  day_of_month: number
  default_assignees: { user_ids: string; team_ids: string; department_id: string }
  default_budget_hours: { accounting?: number; tax?: number; labor?: number }
  task_templates: {
    accounting?: ServiceTemplateForm
    tax?: ServiceTemplateForm
    labor?: ServiceTemplateForm
  }
}

export function RecurringServiceContractDialog({ clientId, onClose }: DialogProps) {
  const { user } = useApp()
  const { register, control, handleSubmit, watch } = useForm<FormValues>({
    defaultValues: {
      services: { accounting: true, tax: false, labor: false },
      day_of_month: 5,
      default_assignees: { user_ids: '', team_ids: '', department_id: '' },
      default_budget_hours: {},
      task_templates: { accounting: { subtasks: [] }, tax: { subtasks: [] }, labor: { subtasks: [] } }
    }
  })

  const accArray = useFieldArray({ control, name: 'task_templates.accounting.subtasks' })
  const taxArray = useFieldArray({ control, name: 'task_templates.tax.subtasks' })
  const labArray = useFieldArray({ control, name: 'task_templates.labor.subtasks' })

  const onSubmit = async (values: FormValues) => {
    if (!user?.org_id) {
      toast.error('No se detectó la organización')
      return
    }

    try {
      const services = values.services
      const default_assignees = {
        user_ids: values.default_assignees.user_ids
          ? values.default_assignees.user_ids.split(',').map((s) => s.trim()).filter(Boolean)
          : [],
        team_ids: values.default_assignees.team_ids
          ? values.default_assignees.team_ids.split(',').map((s) => s.trim()).filter(Boolean)
          : [],
        department_id: values.default_assignees.department_id || null,
      }

      const payload = {
        org_id: user.org_id,
        client_id: clientId,
        services,
        frequency: 'monthly',
        day_of_month: Number(values.day_of_month) || 1,
        start_date: new Date().toISOString().slice(0,10),
        is_active: true,
        default_assignees,
        default_budget_hours: values.default_budget_hours || {},
        task_templates: values.task_templates as any,
      }

      const { error } = await supabase.from('recurring_service_contracts').insert(payload as any)
      if (error) throw error
      toast.success('Contrato creado')
      onClose()
    } catch (e: any) {
      console.error(e)
      toast.error('No se pudo crear el contrato')
    }
  }

  const services = watch('services')

  const ServiceBlock = ({ keyName, label, array }: { keyName: 'accounting'|'tax'|'labor', label: string, array: any }) => (
    <div className="border rounded-md p-3 space-y-3">
      <div className="flex items-center justify-between">
        <Label className="font-medium">{label}</Label>
        <Switch {...register(`services.${keyName}` as const)} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div>
          <Label>Horas objetivo</Label>
          <Input type="number" step="0.1" {...register(`default_budget_hours.${keyName}` as const, { valueAsNumber: true })} />
        </div>
      </div>

      {services?.[keyName] && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Subtareas</Label>
            <Button type="button" size="sm" variant="outline" onClick={() => array.append({ title: '', due_offset_days: 0 })}>Añadir</Button>
          </div>
          <div className="space-y-2">
            {array.fields.map((f, idx) => (
              <div key={f.id} className="grid grid-cols-1 md:grid-cols-6 gap-2">
                <div className="md:col-span-4">
                  <Input placeholder="Título subtarea" {...register(`task_templates.${keyName}.subtasks.${idx}.title` as const)} />
                </div>
                <div className="md:col-span-1">
                  <Input type="number" step="1" placeholder="Offset (días)" {...register(`task_templates.${keyName}.subtasks.${idx}.due_offset_days` as const, { valueAsNumber: true })} />
                </div>
                <div className="md:col-span-1">
                  <Button type="button" variant="ghost" onClick={() => array.remove(idx)}>Quitar</Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )

  return (
    <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div>
          <Label>Día de vencimiento</Label>
          <Input type="number" min={1} max={31} {...register('day_of_month', { valueAsNumber: true })} />
        </div>
        <div>
          <Label>Asignar a usuario(s) (UUIDs, coma)</Label>
          <Input placeholder="uuid1, uuid2" {...register('default_assignees.user_ids')} />
        </div>
        <div>
          <Label>Equipo(s) (UUIDs, coma)</Label>
          <Input placeholder="uuid1, uuid2" {...register('default_assignees.team_ids')} />
        </div>
        <div>
          <Label>Departamento (UUID)</Label>
          <Input placeholder="uuid-dept" {...register('default_assignees.department_id')} />
        </div>
      </div>

      <ServiceBlock keyName="accounting" label="Contabilidad" array={accArray} />
      <ServiceBlock keyName="tax" label="Fiscal" array={taxArray} />
      <ServiceBlock keyName="labor" label="Laboral" array={labArray} />

      <div className="flex items-center justify-end gap-2">
        <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
        <Button type="submit" className="bg-slate-900 hover:bg-slate-800">Guardar</Button>
      </div>
    </form>
  )
}
