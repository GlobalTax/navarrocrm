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
import { LicenseManagement } from './LicenseManagement'
import { calculateNextRenewalDate } from '@/lib/utils/dateUtils'
import type { OutgoingSubscription } from '@/types/outgoing-subscriptions'
import type { SubscriptionTemplate } from '@/types/subscription-templates'
import { useTeams } from '@/hooks/useTeams'

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
  department_id: z.string().optional().nullable(),
  notes: z.string().optional(),
  quantity: z.number().min(1, 'La cantidad debe ser mayor a 0').default(1),
  unit_description: z.string().optional()
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
  const { departments, isLoading: loadingDepartments } = useTeams()
  
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
      department_id: (subscription as any)?.department_id || null,
      notes: subscription?.notes || '',
      quantity: subscription?.quantity || 1,
      unit_description: subscription?.unit_description || 'unidad'
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
    <div className="min-h-screen bg-background p-6 space-y-8">
      {/* Header mejorado */}
      <div className="flex items-center gap-6">
        <Button
          variant="outline"
          size="lg"
          onClick={onClose}
          className="h-12 w-12 border-2 border-foreground/20 rounded-[10px] hover:bg-accent hover:border-foreground/40 transition-all duration-200"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-foreground">
            {subscription ? 'Editar Suscripción' : 'Nueva Suscripción Externa'}
          </h1>
          <p className="text-lg text-muted-foreground">
            {subscription ? 'Modifica los datos de la suscripción' : 'Añade una nueva suscripción a un proveedor externo'}
          </p>
        </div>
      </div>

      {/* Formulario mejorado */}
      <Card className="bg-card border-2 border-border rounded-[10px] shadow-lg">
        <CardHeader className="pb-8">
          <div className="flex items-center justify-between">
            <div className="space-y-3">
              <CardTitle className="text-2xl font-semibold text-card-foreground">
                Información de la Suscripción
              </CardTitle>
              <CardDescription className="text-lg text-muted-foreground">
                Completa los datos de la suscripción externa. Los campos marcados con * son obligatorios.
              </CardDescription>
            </div>
            {!subscription && (
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  onClick={() => setShowTemplateSelector(true)}
                  className="flex items-center gap-3 px-6 py-3 border-2 border-border rounded-[10px] hover:bg-accent text-base font-medium transition-all duration-200"
                >
                  <FileText className="w-5 h-5" />
                  Usar Plantilla
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="lg"
                  onClick={handleSaveAsTemplate}
                  className="flex items-center gap-3 px-6 py-3 rounded-[10px] hover:bg-accent text-base font-medium transition-all duration-200"
                  title="Guardar como plantilla"
                >
                  <Save className="w-5 h-5" />
                  Guardar como Plantilla
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Sección: Información Básica */}
            <div className="space-y-6">
              <div className="border-l-4 border-primary pl-4">
                <h3 className="text-xl font-semibold text-foreground mb-2">Información Básica</h3>
                <p className="text-sm text-muted-foreground">Datos principales del proveedor</p>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <Label htmlFor="provider_name" className="text-base font-medium text-foreground">
                    Proveedor <span className="text-destructive text-lg">*</span>
                  </Label>
                  <Input
                    id="provider_name"
                    placeholder="ej. Google Workspace, Notion, Figma"
                    className="h-12 text-base border-2 border-border rounded-[10px] focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                    {...form.register('provider_name')}
                  />
                  {form.formState.errors.provider_name && (
                    <p className="text-sm text-destructive font-medium">{form.formState.errors.provider_name.message}</p>
                  )}
                </div>

                <div className="space-y-3">
                  <Label htmlFor="category" className="text-base font-medium text-foreground">
                    Categoría <span className="text-destructive text-lg">*</span>
                  </Label>
                  <Select
                    value={form.watch('category')}
                    onValueChange={(value) => form.setValue('category', value as any)}
                  >
                    <SelectTrigger className="h-12 text-base border-2 border-border rounded-[10px] focus:border-primary focus:ring-2 focus:ring-primary/20 bg-background">
                      <SelectValue placeholder="Selecciona una categoría" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border-2 border-border rounded-[10px] shadow-lg z-50">
                      {SUBSCRIPTION_CATEGORIES.map((category) => (
                        <SelectItem key={category.value} value={category.value} className="text-base py-3 hover:bg-accent">
                          {category.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {form.formState.errors.category && (
                    <p className="text-sm text-destructive font-medium">{form.formState.errors.category.message}</p>
                  )}
            </div>

            <div className="space-y-3">
              <Label htmlFor="department_id" className="text-base font-medium text-foreground">
                Departamento
              </Label>
              <Select
                value={form.watch('department_id') || ''}
                onValueChange={(value) => form.setValue('department_id', value || null)}
              >
                <SelectTrigger className="h-12 text-base border-2 border-border rounded-[10px] focus:border-primary focus:ring-2 focus:ring-primary/20 bg-background">
                  <SelectValue placeholder={loadingDepartments ? 'Cargando...' : 'Selecciona un departamento (opcional)'} />
                </SelectTrigger>
                <SelectContent className="bg-popover border-2 border-border rounded-[10px] shadow-lg z-50">
                  <SelectItem value="">Sin departamento</SelectItem>
                  {departments.map((dept) => (
                    <SelectItem key={dept.id} value={dept.id} className="text-base py-3 hover:bg-accent">
                      {dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-3">
                <Label htmlFor="description" className="text-base font-medium text-foreground">Descripción</Label>
                <Textarea
                  id="description"
                  placeholder="Describe para qué se usa esta suscripción..."
                  className="min-h-[100px] text-base border-2 border-border rounded-[10px] focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                  {...form.register('description')}
                />
              </div>
            </div>

            {/* Sección: Información Financiera */}
            <div className="space-y-6">
              <div className="border-l-4 border-primary pl-4">
                <h3 className="text-xl font-semibold text-foreground mb-2">Información Financiera</h3>
                <p className="text-sm text-muted-foreground">Costes y facturación</p>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <Label htmlFor="quantity" className="text-base font-medium text-foreground">
                    Cantidad <span className="text-destructive text-lg">*</span>
                  </Label>
                  <Input
                    id="quantity"
                    type="number"
                    min="1"
                    placeholder="1"
                    className="h-12 text-base border-2 border-border rounded-[10px] focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                    {...form.register('quantity', { valueAsNumber: true })}
                  />
                  {form.formState.errors.quantity && (
                    <p className="text-sm text-destructive font-medium">{form.formState.errors.quantity.message}</p>
                  )}
                </div>

                <div className="space-y-3">
                  <Label htmlFor="unit_description" className="text-base font-medium text-foreground">Descripción de Unidad</Label>
                  <Input
                    id="unit_description"
                    placeholder="ej. licencias, cuentas, usuarios"
                    className="h-12 text-base border-2 border-border rounded-[10px] focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                    {...form.register('unit_description')}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="space-y-3">
                  <Label htmlFor="amount" className="text-base font-medium text-foreground">
                    Precio por Unidad <span className="text-destructive text-lg">*</span>
                  </Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    className="h-12 text-base border-2 border-border rounded-[10px] focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                    {...form.register('amount', { valueAsNumber: true })}
                  />
                  {form.formState.errors.amount && (
                    <p className="text-sm text-destructive font-medium">{form.formState.errors.amount.message}</p>
                  )}
                </div>

                <div className="space-y-3">
                  <Label htmlFor="currency" className="text-base font-medium text-foreground">Moneda</Label>
                  <Select
                    value={form.watch('currency')}
                    onValueChange={(value) => form.setValue('currency', value)}
                  >
                    <SelectTrigger className="h-12 text-base border-2 border-border rounded-[10px] focus:border-primary focus:ring-2 focus:ring-primary/20 bg-background">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border-2 border-border rounded-[10px] shadow-lg z-50">
                      <SelectItem value="EUR" className="text-base py-3 hover:bg-accent">EUR (€)</SelectItem>
                      <SelectItem value="USD" className="text-base py-3 hover:bg-accent">USD ($)</SelectItem>
                      <SelectItem value="GBP" className="text-base py-3 hover:bg-accent">GBP (£)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="billing_cycle" className="text-base font-medium text-foreground">
                    Frecuencia de Cobro <span className="text-destructive text-lg">*</span>
                  </Label>
                  <Select
                    value={form.watch('billing_cycle')}
                    onValueChange={(value) => form.setValue('billing_cycle', value as any)}
                  >
                    <SelectTrigger className="h-12 text-base border-2 border-border rounded-[10px] focus:border-primary focus:ring-2 focus:ring-primary/20 bg-background">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border-2 border-border rounded-[10px] shadow-lg z-50">
                      {BILLING_CYCLES.map((cycle) => (
                        <SelectItem key={cycle.value} value={cycle.value} className="text-base py-3 hover:bg-accent">
                          {cycle.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {form.formState.errors.billing_cycle && (
                    <p className="text-sm text-destructive font-medium">{form.formState.errors.billing_cycle.message}</p>
                  )}
                </div>
              </div>

              {/* Total Calculation Display */}
              {form.watch('quantity') && form.watch('amount') && (
                <div className="p-4 bg-accent/50 rounded-[10px] border-2 border-accent">
                  <div className="flex justify-between items-center">
                    <span className="text-base font-medium text-foreground">
                      Total {form.watch('billing_cycle') === 'MONTHLY' ? 'Mensual' : form.watch('billing_cycle') === 'YEARLY' ? 'Anual' : ''}:
                    </span>
                    <span className="text-xl font-bold text-primary">
                      {(form.watch('quantity') * form.watch('amount')).toFixed(2)} {form.watch('currency')}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {form.watch('quantity')} {form.watch('unit_description') || 'unidades'} × {form.watch('amount')} {form.watch('currency')}
                  </p>
                </div>
              )}
            </div>

            {/* Sección: Fechas */}
            <div className="space-y-6">
              <div className="border-l-4 border-primary pl-4">
                <h3 className="text-xl font-semibold text-foreground mb-2">Fechas Importantes</h3>
                <p className="text-sm text-muted-foreground">Inicio y renovación de la suscripción</p>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <Label htmlFor="start_date" className="text-base font-medium text-foreground">
                    Fecha de Inicio <span className="text-destructive text-lg">*</span>
                  </Label>
                  <Input
                    id="start_date"
                    type="date"
                    className="h-12 text-base border-2 border-border rounded-[10px] focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                    {...form.register('start_date')}
                  />
                  {form.formState.errors.start_date && (
                    <p className="text-sm text-destructive font-medium">{form.formState.errors.start_date.message}</p>
                  )}
                </div>

                <div className="space-y-3">
                  <Label htmlFor="next_renewal_date" className="text-base font-medium text-foreground">
                    Próxima Renovación <span className="text-destructive text-lg">*</span>
                    <span className="text-sm text-muted-foreground ml-2 font-normal">(calculada automáticamente)</span>
                  </Label>
                  <Input
                    id="next_renewal_date"
                    type="date"
                    className="h-12 text-base border-2 border-border rounded-[10px] focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                    {...form.register('next_renewal_date')}
                  />
                  {form.formState.errors.next_renewal_date && (
                    <p className="text-sm text-destructive font-medium">{form.formState.errors.next_renewal_date.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Sección: Información Adicional */}
            <div className="space-y-6">
              <div className="border-l-4 border-primary pl-4">
                <h3 className="text-xl font-semibold text-foreground mb-2">Información Adicional</h3>
                <p className="text-sm text-muted-foreground">Detalles opcionales</p>
              </div>
              
              <div className="space-y-6">
                <div className="space-y-3">
                  <Label htmlFor="payment_method" className="text-base font-medium text-foreground">Método de Pago</Label>
                  <Input
                    id="payment_method"
                    placeholder="ej. VISA ****1234, Transferencia, PayPal"
                    className="h-12 text-base border-2 border-border rounded-[10px] focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                    {...form.register('payment_method')}
                  />
                </div>

                <div className="space-y-3">
                  <Label htmlFor="notes" className="text-base font-medium text-foreground">Notas</Label>
                  <Textarea
                    id="notes"
                    placeholder="Información adicional, recordatorios, etc."
                    className="min-h-[100px] text-base border-2 border-border rounded-[10px] focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                    {...form.register('notes')}
                  />
                </div>
              </div>
            </div>

            {/* Sección: Gestión de Licencias - Solo para suscripciones existentes con múltiples licencias */}
            {subscription && (subscription as any).quantity > 1 && (
              <div className="space-y-6">
                <div className="border-l-4 border-blue-600 pl-4">
                  <h3 className="text-xl font-semibold text-foreground mb-2">Gestión de Licencias</h3>
                  <p className="text-sm text-muted-foreground">Asigna licencias a usuarios específicos</p>
                </div>
                
                <LicenseManagement subscription={subscription as any} />
              </div>
            )}

            {/* Botones mejorados */}
            <div className="flex gap-4 pt-8 border-t border-border">
              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={onClose}
                className="px-8 py-3 text-base font-medium border-2 border-border rounded-[10px] hover:bg-accent transition-all duration-200"
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                size="lg"
                className="px-8 py-3 text-base font-medium bg-primary text-primary-foreground border-2 border-primary rounded-[10px] hover:bg-primary/90 transition-all duration-200 shadow-lg hover:shadow-xl"
                disabled={isLoading}
              >
                <Save className="h-5 w-5 mr-3" />
                {isLoading ? 'Guardando...' : subscription ? 'Actualizar Suscripción' : 'Crear Suscripción'}
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