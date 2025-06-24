
import { UseFormReturn } from 'react-hook-form'
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import type { ContactFormData } from '@/components/contacts/ContactFormTabs'

interface CompanySpecificFieldsProps {
  form: UseFormReturn<ContactFormData>
}

export const CompanySpecificFields = ({ form }: CompanySpecificFieldsProps) => {
  return (
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
  )
}
