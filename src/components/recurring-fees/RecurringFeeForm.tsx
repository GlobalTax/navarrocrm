
import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useClients } from '@/hooks/useClients'
import { useCreateRecurringFee, useUpdateRecurringFee, type RecurringFee } from '@/hooks/useRecurringFees'
import { X } from 'lucide-react'

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

type FormData = z.infer<typeof formSchema>

interface RecurringFeeFormProps {
  recurringFee?: RecurringFee
  onSuccess?: () => void
  onCancel?: () => void
}

const availableTags = [
  'Fiscal', 'Laboral', 'Jurídico', 'Contable', 'Mercantil', 
  'Premium', 'Urgente', 'Consultoría', 'Asesoría', 'Compliance'
]

export function RecurringFeeForm({ recurringFee, onSuccess, onCancel }: RecurringFeeFormProps) {
  const { data: clients = [] } = useClients()
  const createMutation = useCreateRecurringFee()
  const updateMutation = useUpdateRecurringFee()
  const [selectedTags, setSelectedTags] = React.useState<string[]>(recurringFee?.tags || [])

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isValid }
  } = useForm<FormData>({
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

  const onSubmit = async (data: FormData) => {
    const formData = {
      ...data,
      tags: selectedTags,
      next_billing_date: data.start_date // La fecha inicial será la primera facturación
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Cliente */}
            <div className="space-y-2">
              <Label htmlFor="client_id">Cliente *</Label>
              <Select onValueChange={(value) => setValue('client_id', value)}>
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

          {/* Etiquetas */}
          <div className="space-y-2">
            <Label>Etiquetas</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {availableTags.map((tag) => (
                <Badge
                  key={tag}
                  variant={selectedTags.includes(tag) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => handleTagToggle(tag)}
                >
                  {tag}
                </Badge>
              ))}
            </div>
            {selectedTags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {selectedTags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="gap-1">
                    {tag}
                    <X 
                      className="w-3 h-3 cursor-pointer" 
                      onClick={() => removeTag(tag)}
                    />
                  </Badge>
                ))}
              </div>
            )}
          </div>

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

          {/* Botones */}
          <div className="flex justify-end space-x-2">
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancelar
              </Button>
            )}
            <Button 
              type="submit" 
              disabled={!isValid || createMutation.isPending || updateMutation.isPending}
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
