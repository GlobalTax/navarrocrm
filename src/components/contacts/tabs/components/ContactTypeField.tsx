
import { UseFormReturn } from 'react-hook-form'
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Lock, Building2 } from 'lucide-react'
import type { ContactFormData } from '@/components/contacts/ContactFormTabs'

interface ContactTypeFieldProps {
  form: UseFormReturn<ContactFormData>
  isCompanyDataLoaded?: boolean
}

export const ContactTypeField = ({ form, isCompanyDataLoaded = false }: ContactTypeFieldProps) => {
  return (
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
  )
}
