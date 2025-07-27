import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { useSubscriptionTemplates } from '@/hooks/useSubscriptionTemplates'
import { TEMPLATE_CATEGORIES, BILLING_CYCLES, type SubscriptionTemplate } from '@/types/subscription-templates'

const formSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  category: z.enum(['SOFTWARE', 'IA', 'MARKETING', 'SERVICIOS_LEGALES', 'INFRAESTRUCTURA', 'DISENO', 'COMUNICACION', 'OTROS']),
  default_price: z.number().min(0, 'El precio debe ser mayor o igual a 0'),
  default_billing_cycle: z.enum(['MONTHLY', 'YEARLY', 'OTHER']),
  default_currency: z.string().min(1, 'La moneda es requerida'),
  default_payment_method: z.string().optional(),
  provider_website: z.string().url().optional().or(z.literal('')),
  description: z.string().optional(),
  notes: z.string().optional()
})

type FormData = z.infer<typeof formSchema>

interface Props {
  template?: SubscriptionTemplate
  onSuccess: () => void
  onCancel: () => void
}

export function SubscriptionTemplateForm({ template, onSuccess, onCancel }: Props) {
  const { createTemplate, updateTemplate, isCreating, isUpdating } = useSubscriptionTemplates()

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors }
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: template?.name || '',
      category: template?.category || 'SOFTWARE',
      default_price: template?.default_price || 0,
      default_billing_cycle: template?.default_billing_cycle || 'MONTHLY',
      default_currency: template?.default_currency || 'EUR',
      default_payment_method: template?.default_payment_method || '',
      provider_website: template?.provider_website || '',
      description: template?.description || '',
      notes: template?.notes || ''
    }
  })

  const onSubmit = async (data: FormData) => {
    try {
      // Ensure required fields are present
      const templateData = {
        ...data,
        name: data.name || '',
        category: data.category,
        default_price: data.default_price || 0,
        default_billing_cycle: data.default_billing_cycle
      }

      if (template) {
        await updateTemplate.mutateAsync({ 
          id: template.id, 
          data: { ...templateData, updated_at: new Date().toISOString() }
        })
      } else {
        await createTemplate.mutateAsync(templateData)
      }
      onSuccess()
    } catch (error) {
      console.error('Error saving template:', error)
    }
  }

  const watchedCategory = watch('category')
  const watchedPrice = watch('default_price')
  const watchedCycle = watch('default_billing_cycle')

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Información básica */}
        <div className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Nombre de la Plantilla</Label>
            <Input
              id="name"
              placeholder="ej. ChatGPT Plus"
              {...register('name')}
            />
            {errors.name && (
              <span className="text-sm text-destructive">{errors.name.message}</span>
            )}
          </div>

          <div className="grid gap-2">
            <Label>Categoría</Label>
            <Select
              value={watchedCategory}
              onValueChange={(value) => setValue('category', value as any)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar categoría" />
              </SelectTrigger>
              <SelectContent>
                {TEMPLATE_CATEGORIES.map((category) => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.category && (
              <span className="text-sm text-destructive">{errors.category.message}</span>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="provider_website">Sitio Web del Proveedor</Label>
            <Input
              id="provider_website"
              placeholder="https://ejemplo.com"
              {...register('provider_website')}
            />
            {errors.provider_website && (
              <span className="text-sm text-destructive">{errors.provider_website.message}</span>
            )}
          </div>
        </div>

        {/* Información de precio */}
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-2">
            <div className="grid gap-2">
              <Label htmlFor="default_price">Precio</Label>
              <Input
                id="default_price"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                {...register('default_price', { valueAsNumber: true })}
              />
              {errors.default_price && (
                <span className="text-sm text-destructive">{errors.default_price.message}</span>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="default_currency">Moneda</Label>
              <Input
                id="default_currency"
                placeholder="EUR"
                {...register('default_currency')}
              />
              {errors.default_currency && (
                <span className="text-sm text-destructive">{errors.default_currency.message}</span>
              )}
            </div>
          </div>

          <div className="grid gap-2">
            <Label>Ciclo de Facturación</Label>
            <Select
              value={watchedCycle}
              onValueChange={(value) => setValue('default_billing_cycle', value as any)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar ciclo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MONTHLY">Mensual</SelectItem>
                <SelectItem value="YEARLY">Anual</SelectItem>
                <SelectItem value="OTHER">Otro</SelectItem>
              </SelectContent>
            </Select>
            {errors.default_billing_cycle && (
              <span className="text-sm text-destructive">{errors.default_billing_cycle.message}</span>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="default_payment_method">Método de Pago</Label>
            <Input
              id="default_payment_method"
              placeholder="ej. VISA, Transferencia"
              {...register('default_payment_method')}
            />
          </div>
        </div>
      </div>

      {/* Descripción y notas */}
      <div className="space-y-4">
        <div className="grid gap-2">
          <Label htmlFor="description">Descripción</Label>
          <Textarea
            id="description"
            placeholder="Descripción breve del producto o servicio"
            rows={3}
            {...register('description')}
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="notes">Notas Internas</Label>
          <Textarea
            id="notes"
            placeholder="Notas adicionales para uso interno"
            rows={2}
            {...register('notes')}
          />
        </div>
      </div>

      {/* Preview */}
      <Card>
        <CardContent className="pt-4">
          <h4 className="font-medium mb-2">Vista Previa</h4>
          <div className="text-sm space-y-1">
            <div><strong>Nombre:</strong> {watch('name') || 'Sin nombre'}</div>
            <div><strong>Categoría:</strong> {TEMPLATE_CATEGORIES.find(c => c.value === watchedCategory)?.label}</div>
            <div><strong>Precio:</strong> {watchedPrice ? `€${watchedPrice.toFixed(2)}/${watchedCycle === 'MONTHLY' ? 'mes' : 'año'}` : 'Sin precio'}</div>
            {watch('description') && <div><strong>Descripción:</strong> {watch('description')}</div>}
          </div>
        </CardContent>
      </Card>

      {/* Botones */}
      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button 
          type="submit" 
          disabled={isCreating || isUpdating}
        >
          {isCreating || isUpdating ? 'Guardando...' : template ? 'Actualizar' : 'Crear Plantilla'}
        </Button>
      </div>
    </form>
  )
}