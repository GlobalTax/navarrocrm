import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Clock, 
  Bell, 
  Mail, 
  MessageCircle, 
  Calendar,
  CreditCard
} from 'lucide-react'

interface PreferencesStepProps {
  stepData: any
  clientData: any
  onUpdate: (data: any) => void
}

const preferencesSchema = z.object({
  contact_preference: z.string().default('email'),
  preferred_time: z.string().default('morning'),
  communication_frequency: z.string().default('regular'),
  payment_method: z.string().default('transferencia'),
  timezone: z.string().default('Europe/Madrid'),
  email_notifications: z.boolean().default(true),
  sms_notifications: z.boolean().default(false),
  reminder_notifications: z.boolean().default(true),
  marketing_communications: z.boolean().default(false)
})

type PreferencesData = z.infer<typeof preferencesSchema>

export function PreferencesStep({ stepData, onUpdate }: PreferencesStepProps) {
  const form = useForm<PreferencesData>({
    resolver: zodResolver(preferencesSchema),
    defaultValues: {
      contact_preference: stepData?.contact_preference || 'email',
      preferred_time: stepData?.preferred_time || 'morning',
      communication_frequency: stepData?.communication_frequency || 'regular',
      payment_method: stepData?.payment_method || 'transferencia',
      timezone: stepData?.timezone || 'Europe/Madrid',
      email_notifications: stepData?.email_notifications ?? true,
      sms_notifications: stepData?.sms_notifications ?? false,
      reminder_notifications: stepData?.reminder_notifications ?? true,
      marketing_communications: stepData?.marketing_communications ?? false
    }
  })

  // Auto-guardar cambios
  React.useEffect(() => {
    const subscription = form.watch((data) => {
      onUpdate({ 
        ...data,
        timestamp: new Date().toISOString() 
      })
    })
    return () => subscription.unsubscribe()
  }, [form, onUpdate])

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h3 className="text-xl font-semibold text-gray-900">
          Preferencias de Comunicación
        </h3>
        <p className="text-gray-600">
          Configure cómo prefiere que nos comuniquemos con usted
        </p>
      </div>

      <Form {...form}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Preferencias de Contacto */}
          <Card className="border-0.5 border-gray-200 rounded-[10px]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <MessageCircle className="h-5 w-5" />
                Comunicación
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="contact_preference"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Método de Contacto Preferido</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="border-0.5 border-gray-300 rounded-[10px]">
                          <SelectValue placeholder="Seleccionar método" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="phone">Teléfono</SelectItem>
                        <SelectItem value="whatsapp">WhatsApp</SelectItem>
                        <SelectItem value="in_person">Presencial</SelectItem>
                        <SelectItem value="video_call">Videollamada</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="communication_frequency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Frecuencia de Comunicación</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="border-0.5 border-gray-300 rounded-[10px]">
                          <SelectValue placeholder="Seleccionar frecuencia" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="minimal">Solo lo esencial</SelectItem>
                        <SelectItem value="regular">Regular (recomendado)</SelectItem>
                        <SelectItem value="frequent">Frecuente (máximo detalle)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Preferencias de Horario */}
          <Card className="border-0.5 border-gray-200 rounded-[10px]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Clock className="h-5 w-5" />
                Horarios
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="preferred_time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Horario Preferido</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="border-0.5 border-gray-300 rounded-[10px]">
                          <SelectValue placeholder="Seleccionar horario" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="morning">Mañana (9:00 - 13:00)</SelectItem>
                        <SelectItem value="afternoon">Tarde (14:00 - 18:00)</SelectItem>
                        <SelectItem value="evening">Último hora (18:00 - 20:00)</SelectItem>
                        <SelectItem value="flexible">Flexible</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="timezone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Zona Horaria</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="border-0.5 border-gray-300 rounded-[10px]">
                          <SelectValue placeholder="Seleccionar zona horaria" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Europe/Madrid">España (UTC+1/+2)</SelectItem>
                        <SelectItem value="Europe/London">Reino Unido (UTC+0/+1)</SelectItem>
                        <SelectItem value="Europe/Paris">Francia (UTC+1/+2)</SelectItem>
                        <SelectItem value="America/New_York">Nueva York (UTC-5/-4)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Notificaciones */}
          <Card className="border-0.5 border-gray-200 rounded-[10px]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Bell className="h-5 w-5" />
                Notificaciones
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="email_notifications"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className="border-0.5 border-gray-300"
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className="text-sm font-medium">
                        Notificaciones por Email
                      </FormLabel>
                      <p className="text-xs text-gray-600">
                        Recibir actualizaciones importantes por email
                      </p>
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="sms_notifications"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className="border-0.5 border-gray-300"
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className="text-sm font-medium">
                        Notificaciones por SMS
                      </FormLabel>
                      <p className="text-xs text-gray-600">
                        Recibir notificaciones urgentes por SMS
                      </p>
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="reminder_notifications"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className="border-0.5 border-gray-300"
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className="text-sm font-medium">
                        Recordatorios de Citas
                      </FormLabel>
                      <p className="text-xs text-gray-600">
                        Recibir recordatorios de citas y plazos
                      </p>
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="marketing_communications"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className="border-0.5 border-gray-300"
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className="text-sm font-medium">
                        Comunicaciones Informativas
                      </FormLabel>
                      <p className="text-xs text-gray-600">
                        Recibir noticias legales y contenido educativo
                      </p>
                    </div>
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Facturación */}
          <Card className="border-0.5 border-gray-200 rounded-[10px]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <CreditCard className="h-5 w-5" />
                Facturación
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="payment_method"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Método de Pago Preferido</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="border-0.5 border-gray-300 rounded-[10px]">
                          <SelectValue placeholder="Seleccionar método de pago" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="transferencia">Transferencia Bancaria</SelectItem>
                        <SelectItem value="tarjeta">Tarjeta de Crédito/Débito</SelectItem>
                        <SelectItem value="paypal">PayPal</SelectItem>
                        <SelectItem value="bizum">Bizum</SelectItem>
                        <SelectItem value="efectivo">Efectivo (solo presencial)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
        </div>
      </Form>

      <div className="bg-blue-50 border border-blue-200 rounded-[10px] p-4">
        <p className="text-sm text-blue-800">
          <strong>Privacidad:</strong> Estas preferencias pueden modificarse en cualquier momento 
          desde su área de cliente. Sus datos están protegidos según el RGPD.
        </p>
      </div>
    </div>
  )
}