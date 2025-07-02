import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface BasicInfoStepProps {
  stepData: any
  clientData: any
  onUpdate: (data: any) => void
}

const basicInfoSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  phone: z.string().min(9, 'El teléfono debe tener al menos 9 dígitos').optional().or(z.literal('')),
  dni_nif: z.string().optional(),
  preferred_language: z.string().default('es'),
  contact_preference: z.string().default('email')
})

type BasicInfoData = z.infer<typeof basicInfoSchema>

export function BasicInfoStep({ stepData, onUpdate }: BasicInfoStepProps) {
  const form = useForm<BasicInfoData>({
    resolver: zodResolver(basicInfoSchema),
    defaultValues: {
      name: stepData?.name || '',
      email: stepData?.email || '',
      phone: stepData?.phone || '',
      dni_nif: stepData?.dni_nif || '',
      preferred_language: stepData?.preferred_language || 'es',
      contact_preference: stepData?.contact_preference || 'email'
    }
  })

  // Auto-guardar cambios
  React.useEffect(() => {
    const subscription = form.watch((data) => {
      if (Object.values(data).some(value => value)) {
        onUpdate({ 
          ...data,
          timestamp: new Date().toISOString() 
        })
      }
    })
    return () => subscription.unsubscribe()
  }, [form, onUpdate])

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h3 className="text-xl font-semibold text-gray-900">
          Información Básica
        </h3>
        <p className="text-gray-600">
          Facilítenos sus datos de contacto principales
        </p>
      </div>

      <Form {...form}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre Completo *</FormLabel>
                <FormControl>
                  <Input 
                    {...field} 
                    placeholder="Nombre y apellidos"
                    className="border-0.5 border-gray-300 rounded-[10px]" 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="dni_nif"
            render={({ field }) => (
              <FormItem>
                <FormLabel>DNI/NIE/NIF</FormLabel>
                <FormControl>
                  <Input 
                    {...field} 
                    placeholder="12345678X"
                    className="border-0.5 border-gray-300 rounded-[10px]" 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input 
                    {...field} 
                    type="email" 
                    placeholder="email@ejemplo.com"
                    className="border-0.5 border-gray-300 rounded-[10px]" 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Teléfono</FormLabel>
                <FormControl>
                  <Input 
                    {...field} 
                    placeholder="+34 600 000 000"
                    className="border-0.5 border-gray-300 rounded-[10px]" 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="preferred_language"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Idioma Preferido</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="border-0.5 border-gray-300 rounded-[10px]">
                      <SelectValue placeholder="Seleccionar idioma" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="es">Español</SelectItem>
                    <SelectItem value="ca">Catalán</SelectItem>
                    <SelectItem value="en">Inglés</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="contact_preference"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Preferencia de Contacto</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="border-0.5 border-gray-300 rounded-[10px]">
                      <SelectValue placeholder="Seleccionar preferencia" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="phone">Teléfono</SelectItem>
                    <SelectItem value="whatsapp">WhatsApp</SelectItem>
                    <SelectItem value="in_person">Presencial</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </Form>

      <div className="bg-blue-50 border border-blue-200 rounded-[10px] p-4">
        <p className="text-sm text-blue-800">
          <strong>Protección de datos:</strong> Sus datos serán tratados conforme al RGPD y 
          únicamente se utilizarán para la prestación de nuestros servicios jurídicos.
        </p>
      </div>
    </div>
  )
}