
import { UseFormReturn } from 'react-hook-form'
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import type { ClientFormData } from '@/components/clients/ClientFormTabs'

interface LegalInfoTabProps {
  form: UseFormReturn<ClientFormData>
}

export const LegalInfoTab = ({ form }: LegalInfoTabProps) => {
  const clientType = form.watch('client_type')

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="dni_nif"
          render={({ field }) => (
            <FormItem>
              <FormLabel>DNI/NIF/CIF</FormLabel>
              <FormControl>
                <Input placeholder="12345678A" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {clientType === 'empresa' && (
          <FormField
            control={form.control}
            name="legal_representative"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Representante Legal</FormLabel>
                <FormControl>
                  <Input placeholder="Nombre del representante" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
      </div>

      <div className="space-y-4">
        <h4 className="font-medium">Dirección</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="address_street"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Calle y Número</FormLabel>
                <FormControl>
                  <Input placeholder="Calle Mayor, 123" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="address_city"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ciudad</FormLabel>
                <FormControl>
                  <Input placeholder="Madrid" {...field} />
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
                  <Input placeholder="28001" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="address_country"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>País</FormLabel>
                <FormControl>
                  <Input placeholder="España" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>
    </div>
  )
}
