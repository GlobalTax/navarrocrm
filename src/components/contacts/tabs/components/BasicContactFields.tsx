
import { UseFormReturn } from 'react-hook-form'
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import type { ContactFormData } from '@/components/contacts/ContactFormTabs'

interface BasicContactFieldsProps {
  form: UseFormReturn<ContactFormData>
}

export const BasicContactFields = ({ form }: BasicContactFieldsProps) => {
  return (
    <>
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
    </>
  )
}
