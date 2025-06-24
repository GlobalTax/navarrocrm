
import { UseFormReturn } from 'react-hook-form'
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Lock, Building2 } from 'lucide-react'
import type { ContactFormData } from '@/components/contacts/ContactFormTabs'

interface BasicInfoTabProps {
  form: UseFormReturn<ContactFormData>
  isCompanyDataLoaded?: boolean
}

export const BasicInfoTab = ({ form, isCompanyDataLoaded = false }: BasicInfoTabProps) => {
  const clientType = form.watch('client_type')

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Nombre/Razón Social *</FormLabel>
            <FormControl>
              <Input {...field} placeholder="Nombre del contacto" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="client_type"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="flex items-center gap-2">
              Tipo de Contacto
              {isCompanyDataLoaded && (
                <Badge variant="secondary" className="text-xs bg-blue-50 border-blue-200 text-blue-700">
                  <Building2 className="h-3 w-3 mr-1" />
                  Datos oficiales
                </Badge>
              )}
            </FormLabel>
            <Select 
              onValueChange={field.onChange} 
              defaultValue={field.value}
              disabled={isCompanyDataLoaded}
            >
              <FormControl>
                <SelectTrigger className={isCompanyDataLoaded ? 'bg-gray-50 cursor-not-allowed' : ''}>
                  <SelectValue placeholder="Seleccionar tipo" />
                  {isCompanyDataLoaded && (
                    <Lock className="h-4 w-4 text-gray-400 ml-2" />
                  )}
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="particular">Particular</SelectItem>
                <SelectItem value="empresa">Empresa</SelectItem>
                <SelectItem value="autonomo">Autónomo</SelectItem>
              </SelectContent>
            </Select>
            {isCompanyDataLoaded && (
              <p className="text-xs text-blue-600 flex items-center gap-1">
                <Lock className="h-3 w-3" />
                Bloqueado por datos del Registro Mercantil
              </p>
            )}
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
              <Input {...field} type="email" placeholder="email@ejemplo.com" />
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
              <Input {...field} placeholder="+34 600 000 000" />
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
            <FormLabel>DNI/NIF/CIF</FormLabel>
            <FormControl>
              <Input {...field} placeholder="12345678X" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="relationship_type"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Tipo de Relación</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar relación" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="prospecto">Prospecto</SelectItem>
                <SelectItem value="cliente">Cliente</SelectItem>
                <SelectItem value="ex_cliente">Ex Cliente</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="status"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Estado</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar estado" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="prospecto">Prospecto</SelectItem>
                <SelectItem value="activo">Activo</SelectItem>
                <SelectItem value="inactivo">Inactivo</SelectItem>
                <SelectItem value="bloqueado">Bloqueado</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      {clientType === 'empresa' && (
        <>
          <FormField
            control={form.control}
            name="legal_representative"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Representante Legal</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Nombre del representante" />
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
                <FormControl>
                  <Input {...field} placeholder="Ej: Tecnología, Construcción..." />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </>
      )}
    </div>
  )
}
