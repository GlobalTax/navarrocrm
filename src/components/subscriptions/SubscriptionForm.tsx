import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { useApp } from '@/contexts/AppContext'
import { useSubscriptions } from '@/hooks/useSubscriptions'
import { useSubscriptionPlans } from '@/hooks/useSubscriptionPlans'
import type { Subscription, CreateSubscriptionData } from '@/types/subscriptions'

const subscriptionSchema = z.object({
  contact_id: z.string().min(1, 'Selecciona un cliente'),
  plan_id: z.string().optional(),
  plan_name: z.string().min(1, 'El nombre del plan es requerido'),
  price: z.number().min(0, 'El precio debe ser mayor a 0'),
  start_date: z.string().min(1, 'La fecha de inicio es requerida'),
  end_date: z.string().optional(),
  payment_method: z.string().optional(),
  billing_frequency: z.enum(['monthly', 'quarterly', 'yearly']),
  auto_renew: z.boolean(),
  notes: z.string().optional()
})

type SubscriptionFormData = z.infer<typeof subscriptionSchema>

interface SubscriptionFormProps {
  subscription?: Subscription
  onSuccess: () => void
  onCancel: () => void
}

export const SubscriptionForm: React.FC<SubscriptionFormProps> = ({
  subscription,
  onSuccess,
  onCancel
}) => {
  const { user } = useApp()
  const { createSubscription, updateSubscription, isCreating, isUpdating } = useSubscriptions()
  const { plans } = useSubscriptionPlans()
  const [selectedPlanId, setSelectedPlanId] = useState<string>('')

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset
  } = useForm<SubscriptionFormData>({
    resolver: zodResolver(subscriptionSchema),
    defaultValues: {
      billing_frequency: 'monthly',
      auto_renew: true,
      price: 0
    }
  })

  // Obtener lista de contactos
  const { data: contacts = [] } = useQuery({
    queryKey: ['contacts-for-subscriptions', user?.org_id],
    queryFn: async () => {
      if (!user?.org_id) return []

      const { data, error } = await supabase
        .from('contacts')
        .select('id, name, email')
        .eq('org_id', user.org_id)
        .order('name')

      if (error) throw error
      return data
    },
    enabled: !!user?.org_id
  })

  // Cargar datos del subscription si estamos editando
  useEffect(() => {
    if (subscription) {
      reset({
        contact_id: subscription.contact_id,
        plan_id: subscription.plan_id || '',
        plan_name: subscription.plan_name,
        price: subscription.price,
        start_date: subscription.start_date,
        end_date: subscription.end_date || '',
        payment_method: subscription.payment_method || '',
        billing_frequency: subscription.billing_frequency,
        auto_renew: subscription.auto_renew,
        notes: subscription.notes || ''
      })
      setSelectedPlanId(subscription.plan_id || '')
    }
  }, [subscription, reset])

  // Actualizar precio cuando se selecciona un plan
  useEffect(() => {
    if (selectedPlanId) {
      const selectedPlan = plans.find(p => p.id === selectedPlanId)
      if (selectedPlan) {
        setValue('plan_name', selectedPlan.name)
        setValue('price', selectedPlan.price)
        setValue('billing_frequency', selectedPlan.billing_frequency)
      }
    }
  }, [selectedPlanId, plans, setValue])

  const onSubmit = async (data: SubscriptionFormData) => {
    try {
      if (subscription) {
        // Actualizar subscription existente
        await updateSubscription.mutateAsync({
          id: subscription.id,
          data: {
            ...data,
            price: Number(data.price)
          }
        })
      } else {
        // Crear nuevo subscription
        const createData: CreateSubscriptionData = {
          contact_id: data.contact_id,
          plan_id: data.plan_id,
          plan_name: data.plan_name,
          price: Number(data.price),
          start_date: data.start_date,
          end_date: data.end_date,
          payment_method: data.payment_method,
          billing_frequency: data.billing_frequency,
          auto_renew: data.auto_renew,
          notes: data.notes
        }
        await createSubscription.mutateAsync(createData)
      }
      onSuccess()
    } catch (error) {
      console.error('Error saving subscription:', error)
    }
  }

  const isLoading = isCreating || isUpdating

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Cliente */}
        <div>
          <Label htmlFor="contact_id">Cliente *</Label>
          <Select 
            value={watch('contact_id')} 
            onValueChange={(value) => setValue('contact_id', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecciona un cliente" />
            </SelectTrigger>
            <SelectContent>
              {contacts.map((contact) => (
                <SelectItem key={contact.id} value={contact.id}>
                  {contact.name} {contact.email && `(${contact.email})`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.contact_id && (
            <p className="text-sm text-red-600 mt-1">{errors.contact_id.message}</p>
          )}
        </div>

        {/* Plan predefinido */}
        <div>
          <Label htmlFor="plan_id">Plan Predefinido</Label>
          <Select 
            value={selectedPlanId} 
            onValueChange={setSelectedPlanId}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecciona un plan (opcional)" />
            </SelectTrigger>
            <SelectContent>
              {plans.map((plan) => (
                <SelectItem key={plan.id} value={plan.id}>
                  {plan.name} - €{plan.price}/{plan.billing_frequency === 'monthly' ? 'mes' : plan.billing_frequency === 'quarterly' ? 'trimestre' : 'año'}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Nombre del plan */}
        <div>
          <Label htmlFor="plan_name">Nombre del Plan *</Label>
          <Input
            id="plan_name"
            {...register('plan_name')}
            placeholder="Ej: Plan Básico, Plan Premium..."
          />
          {errors.plan_name && (
            <p className="text-sm text-red-600 mt-1">{errors.plan_name.message}</p>
          )}
        </div>

        {/* Precio */}
        <div>
          <Label htmlFor="price">Precio *</Label>
          <Input
            id="price"
            type="number"
            step="0.01"
            {...register('price', { valueAsNumber: true })}
            placeholder="0.00"
          />
          {errors.price && (
            <p className="text-sm text-red-600 mt-1">{errors.price.message}</p>
          )}
        </div>

        {/* Frecuencia de facturación */}
        <div>
          <Label htmlFor="billing_frequency">Frecuencia de Facturación *</Label>
          <Select 
            value={watch('billing_frequency')} 
            onValueChange={(value) => setValue('billing_frequency', value as 'monthly' | 'quarterly' | 'yearly')}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="monthly">Mensual</SelectItem>
              <SelectItem value="quarterly">Trimestral</SelectItem>
              <SelectItem value="yearly">Anual</SelectItem>
            </SelectContent>
          </Select>
          {errors.billing_frequency && (
            <p className="text-sm text-red-600 mt-1">{errors.billing_frequency.message}</p>
          )}
        </div>

        {/* Fecha de inicio */}
        <div>
          <Label htmlFor="start_date">Fecha de Inicio *</Label>
          <Input
            id="start_date"
            type="date"
            {...register('start_date')}
          />
          {errors.start_date && (
            <p className="text-sm text-red-600 mt-1">{errors.start_date.message}</p>
          )}
        </div>

        {/* Fecha de fin */}
        <div>
          <Label htmlFor="end_date">Fecha de Fin</Label>
          <Input
            id="end_date"
            type="date"
            {...register('end_date')}
          />
        </div>

        {/* Método de pago */}
        <div>
          <Label htmlFor="payment_method">Método de Pago</Label>
          <Select 
            value={watch('payment_method') || ''} 
            onValueChange={(value) => setValue('payment_method', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecciona método de pago" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="transferencia">Transferencia Bancaria</SelectItem>
              <SelectItem value="tarjeta">Tarjeta de Crédito</SelectItem>
              <SelectItem value="efectivo">Efectivo</SelectItem>
              <SelectItem value="cheque">Cheque</SelectItem>
              <SelectItem value="domiciliacion">Domiciliación Bancaria</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Auto renovación */}
      <div className="flex items-center space-x-2">
        <Switch
          id="auto_renew"
          checked={watch('auto_renew')}
          onCheckedChange={(checked) => setValue('auto_renew', checked)}
        />
        <Label htmlFor="auto_renew">Renovación automática</Label>
      </div>

      {/* Notas */}
      <div>
        <Label htmlFor="notes">Notas</Label>
        <Textarea
          id="notes"
          {...register('notes')}
          placeholder="Notas adicionales sobre la suscripción..."
          rows={3}
        />
      </div>

      {/* Botones */}
      <div className="flex justify-end space-x-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          disabled={isLoading}
        >
          {isLoading ? 'Guardando...' : subscription ? 'Actualizar' : 'Crear'} Suscripción
        </Button>
      </div>
    </form>
  )
}