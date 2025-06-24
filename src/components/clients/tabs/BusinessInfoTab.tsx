
import { UseFormReturn } from 'react-hook-form'
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { ClientFormData } from '@/components/clients/ClientFormTabs'

interface BusinessInfoTabProps {
  form: UseFormReturn<ClientFormData>
}

export const BusinessInfoTab = ({ form }: BusinessInfoTabProps) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="hourly_rate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tarifa por Hora (€)</FormLabel>
              <FormControl>
                <Input type="number" step="0.01" placeholder="150.00" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="payment_method"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Método de Pago Preferido</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar método" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="transferencia">Transferencia</SelectItem>
                  <SelectItem value="domiciliacion">Domiciliación</SelectItem>
                  <SelectItem value="efectivo">Efectivo</SelectItem>
                  <SelectItem value="tarjeta">Tarjeta</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="how_found_us"
          render={({ field }) => (
            <FormItem className="md:col-span-2">
              <FormLabel>¿Cómo nos conoció?</FormLabel>
              <FormControl>
                <Input placeholder="Recomendación, Google, redes sociales..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="internal_notes"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Notas Internas</FormLabel>
            <FormControl>
              <Textarea 
                placeholder="Notas privadas sobre el cliente..."
                className="min-h-[100px]"
                {...field} 
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  )
}
