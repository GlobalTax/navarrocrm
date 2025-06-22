
import React from 'react'
import { UseFormRegister, UseFormSetValue, FieldErrors } from 'react-hook-form'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useClients } from '@/hooks/useClients'
import { RecurringFeeFormData } from './types'

interface RecurringFeeBasicFieldsProps {
  register: UseFormRegister<RecurringFeeFormData>
  setValue: UseFormSetValue<RecurringFeeFormData>
  errors: FieldErrors<RecurringFeeFormData>
  defaultClientId?: string
}

export function RecurringFeeBasicFields({ 
  register, 
  setValue, 
  errors, 
  defaultClientId 
}: RecurringFeeBasicFieldsProps) {
  const { clients } = useClients()

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Cliente */}
        <div className="space-y-2">
          <Label htmlFor="client_id">Cliente *</Label>
          <Select 
            onValueChange={(value) => setValue('client_id', value)}
            defaultValue={defaultClientId}
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar cliente" />
            </SelectTrigger>
            <SelectContent>
              {clients.map((client) => (
                <SelectItem key={client.id} value={client.id}>
                  {client.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.client_id && (
            <p className="text-sm text-red-500">{errors.client_id.message}</p>
          )}
        </div>

        {/* Nombre */}
        <div className="space-y-2">
          <Label htmlFor="name">Nombre de la cuota *</Label>
          <Input
            {...register('name')}
            placeholder="Ej: Asesoría fiscal mensual"
          />
          {errors.name && (
            <p className="text-sm text-red-500">{errors.name.message}</p>
          )}
        </div>

        {/* Importe */}
        <div className="space-y-2">
          <Label htmlFor="amount">Importe (€) *</Label>
          <Input
            type="number"
            step="0.01"
            {...register('amount', { valueAsNumber: true })}
            placeholder="0.00"
          />
          {errors.amount && (
            <p className="text-sm text-red-500">{errors.amount.message}</p>
          )}
        </div>

        {/* Frecuencia */}
        <div className="space-y-2">
          <Label htmlFor="frequency">Frecuencia *</Label>
          <Select onValueChange={(value) => setValue('frequency', value as any)}>
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar frecuencia" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="monthly">Mensual</SelectItem>
              <SelectItem value="quarterly">Trimestral</SelectItem>
              <SelectItem value="yearly">Anual</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Fecha de inicio */}
        <div className="space-y-2">
          <Label htmlFor="start_date">Fecha de inicio *</Label>
          <Input
            type="date"
            {...register('start_date')}
          />
          {errors.start_date && (
            <p className="text-sm text-red-500">{errors.start_date.message}</p>
          )}
        </div>

        {/* Fecha de fin */}
        <div className="space-y-2">
          <Label htmlFor="end_date">Fecha de fin (opcional)</Label>
          <Input
            type="date"
            {...register('end_date')}
          />
        </div>

        {/* Prioridad */}
        <div className="space-y-2">
          <Label htmlFor="priority">Prioridad</Label>
          <Select onValueChange={(value) => setValue('priority', value as any)}>
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar prioridad" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="high">Alta</SelectItem>
              <SelectItem value="medium">Media</SelectItem>
              <SelectItem value="low">Baja</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Descripción */}
      <div className="space-y-2">
        <Label htmlFor="description">Descripción</Label>
        <Textarea
          {...register('description')}
          placeholder="Descripción detallada de la cuota recurrente..."
          rows={3}
        />
      </div>
    </div>
  )
}
