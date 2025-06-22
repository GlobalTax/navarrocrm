
import React from 'react'
import { UseFormRegister } from 'react-hook-form'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { RecurringFeeFormData } from './types'

interface RecurringFeeHoursFieldsProps {
  register: UseFormRegister<RecurringFeeFormData>
}

export function RecurringFeeHoursFields({ register }: RecurringFeeHoursFieldsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Horas incluidas */}
      <div className="space-y-2">
        <Label htmlFor="included_hours">Horas incluidas</Label>
        <Input
          type="number"
          {...register('included_hours', { valueAsNumber: true })}
          placeholder="0"
        />
      </div>

      {/* Tarifa horas extra */}
      <div className="space-y-2">
        <Label htmlFor="hourly_rate_extra">Tarifa horas extra (€/h)</Label>
        <Input
          type="number"
          step="0.01"
          {...register('hourly_rate_extra', { valueAsNumber: true })}
          placeholder="0.00"
        />
      </div>
    </div>
  )
}
