import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { FileText, Save } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ArrowLeft } from 'lucide-react'
import { useOutgoingSubscriptions } from '@/hooks/useOutgoingSubscriptions'
import { useSubscriptionTemplates } from '@/hooks/useSubscriptionTemplates'
import { useApp } from '@/contexts/AppContext'
import { SUBSCRIPTION_CATEGORIES, BILLING_CYCLES, CreateOutgoingSubscriptionData } from '@/types/outgoing-subscriptions'
import { SubscriptionTemplateSelector } from '@/components/subscription-templates/SubscriptionTemplateSelector'
import { calculateNextRenewalDate } from '@/lib/utils/dateUtils'
import type { OutgoingSubscription } from '@/types/outgoing-subscriptions'
import type { SubscriptionTemplate } from '@/types/subscription-templates'

const formSchema = z.object({
  provider_name: z.string().min(1, 'El nombre del proveedor es obligatorio'),
  description: z.string().optional(),
  category: z.enum(['SOFTWARE', 'MARKETING', 'SERVICIOS_LEGALES', 'INFRAESTRUCTURA', 'DISENO', 'COMUNICACION', 'OTROS']),
  amount: z.number().min(0, 'El monto debe ser mayor a 0'),
  currency: z.string().default('EUR'),
  billing_cycle: z.enum(['MONTHLY', 'YEARLY', 'OTHER']),
  start_date: z.string().min(1, 'La fecha de inicio es obligatoria'),
  next_renewal_date: z.string().min(1, 'La fecha de renovación es obligatoria'),
  payment_method: z.string().optional(),
  responsible_user_id: z.string().min(1, 'El usuario responsable es obligatorio'),
  notes: z.string().optional()
})

type FormData = z.infer<typeof formSchema>

interface Props {
  subscription?: OutgoingSubscription | null
  onClose: () => void
}

export const OutgoingSubscriptionForm = ({ subscription, onClose }: Props) => {
  const { user } = useApp()
  const { createSubscription, updateSubscription, isCreating, isUpdating } = useOutgoingSubscriptions()
  const { createTemplate } = useSubscriptionTemplates()
  const [showTemplateSelector, setShowTemplateSelector] = useState(false)
  
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      provider_name: subscription?.provider_name || '',
      description: subscription?.description || '',
      category: subscription?.category || 'SOFTWARE',
      amount: subscription?.amount || 0,
      currency: subscription?.currency || 'EUR',
      billing_cycle: subscription?.billing_cycle || 'MONTHLY',
      start_date: subscription?.start_date || new Date().toISOString().split('T')[0],
      next_renewal_date: subscription?.next_renewal_date || new Date().toISOString().split('T')[0],
      payment_method: subscription?.payment_method || '',
      responsible_user_id: subscription?.responsible_user_id || user?.id || '',
      notes: subscription?.notes || ''
    }
  })

  // Watch for changes in start_date and billing_cycle to auto-calculate renewal date
  const startDate = form.watch('start_date')
  const billingCycle = form.watch('billing_cycle')

  useEffect(() => {
    if (startDate && billingCycle) {
      const newRenewalDate = calculateNextRenewalDate(startDate, billingCycle)
      form.setValue('next_renewal_date', newRenewalDate)
    }
  }, [startDate, billingCycle, form])

  const onSubmit = async (data: FormData) => {
    try {
      if (subscription) {
        await updateSubscription.mutateAsync({
          id: subscription.id,
          data: data as Partial<OutgoingSubscription>
        })
      } else {
        await createSubscription.mutateAsync(data as CreateOutgoingSubscriptionData)
      }
      onClose()
    } catch (error) {
      console.error('Error saving subscription:', error)
    }
  }

  const handleSelectTemplate = (template: SubscriptionTemplate) => {
    const currentStartDate = form.getValues('start_date')
    
    form.setValue('provider_name', template.name)
    form.setValue('description', template.description || '')
    form.setValue('category', template.category as any)
    form.setValue('amount', template.default_price)
    form.setValue('billing_cycle', template.default_billing_cycle as any)
    form.setValue('currency', template.default_currency)
    form.setValue('payment_method', template.default_payment_method || '')
    form.setValue('notes', template.notes || '')
    
    // Auto-calculate renewal date based on template's billing cycle
    if (currentStartDate) {
      const newRenewalDate = calculateNextRenewalDate(currentStartDate, template.default_billing_cycle as any)
      form.setValue('next_renewal_date', newRenewalDate)
    }
  }

  const handleSaveAsTemplate = async () => {
    const formData = form.getValues()
    try {
      await createTemplate.mutateAsync({
        name: formData.provider_name,
        category: formData.category as any,
        default_price: formData.amount,
        default_billing_cycle: formData.billing_cycle as any,
        default_currency: formData.currency || 'EUR',
        default_payment_method: formData.payment_method,
        description: formData.description,
        notes: formData.notes
      })
    } catch (error) {
      console.error('Error creating template:', error)
    }
  }

  const isLoading = isCreating || isUpdating

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="sm"
          onClick={onClose}
          className="border-0.5 border-black rounded-[10px] hover:bg-gray-50"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">
            {subscription ? 'Editar Suscripción' : 'Nueva Suscripción Externa'}
          </h1>
          <p className="text-gray-600">
            {subscription ? 'Modifica los datos de la suscripción' : 'Añade una nueva suscripción a un proveedor externo'}
          </p>
        </div>
      </div>

      {/* Formulario */}
      <Card className="bg-white border-0.5 border-black rounded-[10px] shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Información de la Suscripción</CardTitle>
              <CardDescription>
                Completa los datos de la suscripción externa
              </CardDescription>
            </div>
            {!subscription && (
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowTemplateSelector(true)}
                  className="flex items-center gap-2 border-0.5 border-black rounded-[10px]"
                >
                  <FileText className="w-4 h-4" />
                  Usar Plantilla
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleSaveAsTemplate}
                  className="flex items-center gap-2 rounded-[10px]"
                  title="Guardar como plantilla"
                >
                  <Save className="w-4 h-4" />
                  Guardar como Plantilla
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Información básica */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="provider_name">Proveedor *</Label>
                <Input
                  id="provider_name"
                  placeholder="ej. Google Workspace, Notion, Figma"
                  className="border-0.5 border-black rounded-[10px]"
                  {...form.register('provider_name')}
                />
                {form.formState.errors.provider_name && (
                  <p className="text-sm text-red-600">{form.formState.errors.provider_name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Categoría *</Label>
                <Select
                  value={form.watch('category')}
                  onValueChange={(value) => form.setValue('category', value as any)}
                >
                  <SelectTrigger className="border-0.5 border-black rounded-[10px]">
                    <SelectValue placeholder="Selecciona una categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    {SUBSCRIPTION_CATEGORIES.map((category) => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {form.formState.errors.category && (
                  <p className="text-sm text-red-600">{form.formState.errors.category.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                placeholder="Describe para qué se usa esta suscripción..."
                className="border-0.5 border-black rounded-[10px]"
                {...form.register('description')}
              />
            </div>

            {/* Información financiera */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label htmlFor="amount">Monto *</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  className="border-0.5 border-black rounded-[10px]"
                  {...form.register('amount', { valueAsNumber: true })}
                />
                {form.formState.errors.amount && (
                  <p className="text-sm text-red-600">{form.formState.errors.amount.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="currency">Moneda</Label>
                <Select
                  value={form.watch('currency')}
                  onValueChange={(value) => form.setValue('currency', value)}
                >
                  <SelectTrigger className="border-0.5 border-black rounded-[10px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EUR">EUR (€)</SelectItem>
                    <SelectItem value="USD">USD ($)</SelectItem>
                    <SelectItem value="GBP">GBP (£)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="billing_cycle">Frecuencia de Cobro *</Label>
                <Select
                  value={form.watch('billing_cycle')}
                  onValueChange={(value) => form.setValue('billing_cycle', value as any)}
                >
                  <SelectTrigger className="border-0.5 border-black rounded-[10px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {BILLING_CYCLES.map((cycle) => (
                      <SelectItem key={cycle.value} value={cycle.value}>
                        {cycle.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {form.formState.errors.billing_cycle && (
                  <p className="text-sm text-red-600">{form.formState.errors.billing_cycle.message}</p>
                )}
              </div>
            </div>

            {/* Fechas */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="start_date">Fecha de Inicio *</Label>
                <Input
                  id="start_date"
                  type="date"
                  className="border-0.5 border-black rounded-[10px]"
                  {...form.register('start_date')}
                />
                {form.formState.errors.start_date && (
                  <p className="text-sm text-red-600">{form.formState.errors.start_date.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="next_renewal_date">
                  Próxima Renovación *
                  <span className="text-xs text-gray-500 ml-2">(calculada automáticamente)</span>
                </Label>
                <Input
                  id="next_renewal_date"
                  type="date"
                  className="border-0.5 border-black rounded-[10px]"
                  {...form.register('next_renewal_date')}
                />
                {form.formState.errors.next_renewal_date && (
                  <p className="text-sm text-red-600">{form.formState.errors.next_renewal_date.message}</p>
                )}
              </div>
            </div>

            {/* Información adicional */}
            <div className="space-y-2">
              <Label htmlFor="payment_method">Método de Pago</Label>
              <Input
                id="payment_method"
                placeholder="ej. VISA ****1234, Transferencia, PayPal"
                className="border-0.5 border-black rounded-[10px]"
                {...form.register('payment_method')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notas</Label>
              <Textarea
                id="notes"
                placeholder="Información adicional, recordatorios, etc."
                className="border-0.5 border-black rounded-[10px]"
                {...form.register('notes')}
              />
            </div>

            {/* Botones */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="border-0.5 border-black rounded-[10px] hover:bg-gray-50"
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="bg-black text-white border-0.5 border-black rounded-[10px] hover:bg-gray-800"
                disabled={isLoading}
              >
                <Save className="h-4 w-4 mr-2" />
                {isLoading ? 'Guardando...' : subscription ? 'Actualizar' : 'Crear Suscripción'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <SubscriptionTemplateSelector
        open={showTemplateSelector}
        onOpenChange={setShowTemplateSelector}
        onSelectTemplate={handleSelectTemplate}
      />
    </div>
  )
}