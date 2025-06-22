
import React from 'react'
import { UseFormRegister } from 'react-hook-form'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { RecurringFeeFormData } from './types'

interface RecurringFeeBillingFieldsProps {
  register: UseFormRegister<RecurringFeeFormData>
}

export function RecurringFeeBillingFields({ register }: RecurringFeeBillingFieldsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Día de facturación */}
      <div className="space-y-2">
        <Label htmlFor="billing_day">Día de facturación</Label>
        <Input
          type="number"
          min="1"
          max="31"
          {...register('billing_day', { valueAsNumber: true })}
          placeholder="1"
        />
      </div>

      {/* Términos de pago */}
      <div className="space-y-2">
        <Label htmlFor="payment_terms">Términos de pago (días)</Label>
        <Input
          type="number"
          {...register('payment_terms', { valueAsNumber: true })}
          placeholder="30"
        />
      </div>
    </div>
  )
}
