import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { NifLookup } from '@/components/contacts/NifLookup'
import { CompanyData } from '@/hooks/useCompanyLookup'

interface BusinessInfoStepProps {
  stepData: any
  clientData: any
  onUpdate: (data: any) => void
}

const businessInfoSchema = z.object({
  business_name: z.string().min(2, 'La razón social debe tener al menos 2 caracteres'),
  tax_id: z.string().min(9, 'El NIF/CIF es requerido'),
  business_sector: z.string().optional(),
  legal_form: z.string().optional(),
  address_street: z.string().optional(),
  address_city: z.string().optional(),
  address_postal_code: z.string().optional(),
  website: z.string().optional(),
  employee_count: z.string().optional(),
  description: z.string().optional()
})

type BusinessInfoData = z.infer<typeof businessInfoSchema>

export function BusinessInfoStep({ stepData, onUpdate }: BusinessInfoStepProps) {
  const form = useForm<BusinessInfoData>({
    resolver: zodResolver(businessInfoSchema),
    defaultValues: {
      business_name: stepData?.business_name || '',
      tax_id: stepData?.tax_id || '',
      business_sector: stepData?.business_sector || '',
      legal_form: stepData?.legal_form || '',
      address_street: stepData?.address_street || '',
      address_city: stepData?.address_city || '',
      address_postal_code: stepData?.address_postal_code || '',
      website: stepData?.website || '',
      employee_count: stepData?.employee_count || '',
      description: stepData?.description || ''
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

  const handleCompanyFound = (companyData: CompanyData) => {
    form.setValue('business_name', companyData.name || '')
    form.setValue('tax_id', companyData.nif || '')
    form.setValue('address_street', companyData.address_street || '')
    
    // Actualizar datos
    onUpdate({
      business_name: companyData.name,
      tax_id: companyData.nif,
      address_street: companyData.address_street,
      companyDataFound: true,
      timestamp: new Date().toISOString()
    })
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h3 className="text-xl font-semibold text-gray-900">
          Información de la Empresa
        </h3>
        <p className="text-gray-600">
          Facilítenos los datos de su empresa para un mejor servicio
        </p>
      </div>

      {/* Búsqueda por NIF/CIF */}
      <div className="bg-gray-50 border border-gray-200 rounded-[10px] p-4">
        <h4 className="font-medium text-gray-900 mb-3">Búsqueda Automática</h4>
        <p className="text-sm text-gray-600 mb-3">
          Introduzca el NIF/CIF de su empresa para completar automáticamente los datos
        </p>
        <NifLookup
          onCompanyFound={handleCompanyFound}
          initialNif={form.watch('tax_id')}
        />
      </div>

      <Form {...form}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="business_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Razón Social *</FormLabel>
                <FormControl>
                  <Input 
                    {...field} 
                    placeholder="Nombre de la empresa"
                    className="border-0.5 border-gray-300 rounded-[10px]" 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="tax_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>NIF/CIF *</FormLabel>
                <FormControl>
                  <Input 
                    {...field} 
                    placeholder="A12345678"
                    className="border-0.5 border-gray-300 rounded-[10px]" 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="business_sector"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Sector de Actividad</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="border-0.5 border-gray-300 rounded-[10px]">
                      <SelectValue placeholder="Seleccionar sector" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="tecnologia">Tecnología</SelectItem>
                    <SelectItem value="retail">Retail</SelectItem>
                    <SelectItem value="servicios">Servicios</SelectItem>
                    <SelectItem value="construccion">Construcción</SelectItem>
                    <SelectItem value="hosteleria">Hostelería</SelectItem>
                    <SelectItem value="industrial">Industrial</SelectItem>
                    <SelectItem value="sanitario">Sanitario</SelectItem>
                    <SelectItem value="educacion">Educación</SelectItem>
                    <SelectItem value="otro">Otro</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="legal_form"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Forma Jurídica</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="border-0.5 border-gray-300 rounded-[10px]">
                      <SelectValue placeholder="Seleccionar forma jurídica" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="sl">Sociedad Limitada (SL)</SelectItem>
                    <SelectItem value="sa">Sociedad Anónima (SA)</SelectItem>
                    <SelectItem value="autonomo">Autónomo</SelectItem>
                    <SelectItem value="cooperativa">Cooperativa</SelectItem>
                    <SelectItem value="asociacion">Asociación</SelectItem>
                    <SelectItem value="fundacion">Fundación</SelectItem>
                    <SelectItem value="otro">Otro</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="employee_count"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Número de Empleados</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="border-0.5 border-gray-300 rounded-[10px]">
                      <SelectValue placeholder="Seleccionar rango" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="1-5">1-5 empleados</SelectItem>
                    <SelectItem value="6-10">6-10 empleados</SelectItem>
                    <SelectItem value="11-25">11-25 empleados</SelectItem>
                    <SelectItem value="26-50">26-50 empleados</SelectItem>
                    <SelectItem value="51-100">51-100 empleados</SelectItem>
                    <SelectItem value="100+">Más de 100 empleados</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="website"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Sitio Web</FormLabel>
                <FormControl>
                  <Input 
                    {...field} 
                    placeholder="https://www.empresa.com"
                    className="border-0.5 border-gray-300 rounded-[10px]" 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="space-y-4">
          <FormField
            control={form.control}
            name="address_street"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Dirección</FormLabel>
                <FormControl>
                  <Input 
                    {...field} 
                    placeholder="Calle, número, piso, puerta"
                    className="border-0.5 border-gray-300 rounded-[10px]" 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="address_city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ciudad</FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      placeholder="Ciudad"
                      className="border-0.5 border-gray-300 rounded-[10px]" 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="address_postal_code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Código Postal</FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      placeholder="28001"
                      className="border-0.5 border-gray-300 rounded-[10px]" 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Descripción de la Actividad</FormLabel>
                <FormControl>
                  <Textarea 
                    {...field} 
                    placeholder="Breve descripción de la actividad principal de su empresa..."
                    className="border-0.5 border-gray-300 rounded-[10px]" 
                    rows={3}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </Form>
    </div>
  )
}