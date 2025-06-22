
import React from 'react'
import { UseFormRegister, UseFormWatch, UseFormSetValue } from 'react-hook-form'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'

interface FormData {
  auto_invoice: boolean
  auto_send_notifications: boolean
  internal_notes?: string
}

interface RecurringFeeOptionsFieldsProps {
  register: UseFormRegister<FormData>
  watch: UseFormWatch<FormData>
  setValue: UseFormSetValue<FormData>
}

export function RecurringFeeOptionsFields({ 
  register, 
  watch, 
  setValue 
}: RecurringFeeOptionsFieldsProps) {
  return (
    <div className="space-y-6">
      {/* Opciones automáticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex items-center space-x-2">
          <Switch
            checked={watch('auto_invoice')}
            onCheckedChange={(checked) => setValue('auto_invoice', checked)}
          />
          <Label>Facturación automática</Label>
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            checked={watch('auto_send_notifications')}
            onCheckedChange={(checked) => setValue('auto_send_notifications', checked)}
          />
          <Label>Notificaciones automáticas</Label>
        </div>
      </div>

      {/* Notas internas */}
      <div className="space-y-2">
        <Label htmlFor="internal_notes">Notas internas</Label>
        <Textarea
          {...register('internal_notes')}
          placeholder="Notas internas sobre esta cuota recurrente..."
          rows={2}
        />
      </div>
    </div>
  )
}
