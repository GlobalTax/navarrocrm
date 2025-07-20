
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useCreateRecurringFee, useUpdateRecurringFee, type RecurringFee } from '@/hooks/useRecurringFees'
import { RecurringFeeBasicFields } from './form/RecurringFeeBasicFields'
import { RecurringFeeHoursFields } from './form/RecurringFeeHoursFields'
import { RecurringFeeBillingFields } from './form/RecurringFeeBillingFields'
import { RecurringFeeTagsManager } from './form/RecurringFeeTagsManager'
import { RecurringFeeOptionsFields } from './form/RecurringFeeOptionsFields'
import { RecurringFeeFormData } from './form/types'

const formSchema = z.object({
  client_id: z.string().min(1, 'Cliente es requerido'),
  name: z.string().min(1, 'Nombre es requerido'),
  description: z.string().optional(),
  amount: z.number().min(0.01, 'El importe debe ser mayor a 0'),
  frequency: z.enum(['monthly', 'quarterly', 'yearly']),
  start_date: z.string().min(1, 'Fecha de inicio es requerida'),
  end_date: z.string().optional(),
  billing_day: z.number().min(1).max(31),
  included_hours: z.number().min(0),
  hourly_rate_extra: z.number().min(0),
  auto_invoice: z.boolean(),
  auto_send_notifications: z.boolean(),
  payment_terms: z.number().min(1),
  priority: z.enum(['high', 'medium', 'low']),
  internal_notes: z.string().optional(),
  tags: z.array(z.string()).optional()
})

interface RecurringFeeFormProps {
  recurringFee?: RecurringFee
  onSuccess?: () => void
  onCancel?: () => void
}

export function RecurringFeeForm({ recurringFee, onSuccess, onCancel }: RecurringFeeFormProps) {
  const createMutation = useCreateRecurringFee()
  const updateMutation = useUpdateRecurringFee()
  const [selectedTags, setSelectedTags] = useState<string[]>(recurringFee?.tags || [])

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors }
  } = useForm<RecurringFeeFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      client_id: recurringFee?.client_id || '',
      name: recurringFee?.name || '',
      description: recurringFee?.description || '',
      amount: recurringFee?.amount || 0,
      frequency: recurringFee?.frequency || 'monthly',
      start_date: recurringFee?.start_date || new Date().toISOString().split('T')[0],
      end_date: recurringFee?.end_date || '',
      billing_day: recurringFee?.billing_day || 1,
      included_hours: recurringFee?.included_hours || 0,
      hourly_rate_extra: recurringFee?.hourly_rate_extra || 0,
      auto_invoice: recurringFee?.auto_invoice ?? true,
      auto_send_notifications: recurringFee?.auto_send_notifications ?? true,
      payment_terms: recurringFee?.payment_terms || 30,
      priority: recurringFee?.priority || 'medium',
      internal_notes: recurringFee?.internal_notes || '',
      tags: recurringFee?.tags || []
    }
  })

  const onSubmit = async (data: RecurringFeeFormData) => {
    const formData = {
      client_id: data.client_id,
      name: data.name,
      description: data.description || '',
      amount: data.amount,
      frequency: data.frequency,
      start_date: data.start_date,
      end_date: data.end_date || undefined,
      billing_day: data.billing_day,
      included_hours: data.included_hours,
      hourly_rate_extra: data.hourly_rate_extra,
      auto_invoice: data.auto_invoice,
      auto_send_notifications: data.auto_send_notifications,
      payment_terms: data.payment_terms,
      priority: data.priority,
      internal_notes: data.internal_notes || undefined,
      tags: selectedTags,
      next_billing_date: data.start_date,
      status: 'active' as const
    }

    if (recurringFee) {
      await updateMutation.mutateAsync({ 
        id: recurringFee.id, 
        data: formData 
      })
    } else {
      await createMutation.mutateAsync(formData)
    }
    
    onSuccess?.()
  }

  const handleTagToggle = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    )
  }

  const removeTag = (tag: string) => {
    setSelectedTags(prev => prev.filter(t => t !== tag))
  }

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle>
          {recurringFee ? 'Editar Cuota Recurrente' : 'Nueva Cuota Recurrente'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <RecurringFeeBasicFields
            register={register}
            setValue={setValue}
            errors={errors}
            defaultClientId={recurringFee?.client_id}
          />

          <RecurringFeeHoursFields register={register} />

          <RecurringFeeBillingFields register={register} />

          <RecurringFeeTagsManager
            selectedTags={selectedTags}
            onTagToggle={handleTagToggle}
            onTagRemove={removeTag}
          />

          <RecurringFeeOptionsFields
            register={register}
            watch={watch}
            setValue={setValue}
          />

          <div className="flex justify-end space-x-2">
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancelar
              </Button>
            )}
            <Button 
              type="submit" 
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {createMutation.isPending || updateMutation.isPending ? 'Guardando...' : 
               recurringFee ? 'Actualizar' : 'Crear Cuota'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
