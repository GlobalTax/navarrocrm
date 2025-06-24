
import { UseFormReturn } from 'react-hook-form'
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { ContactFormData } from '@/components/contacts/ContactFormTabs'

interface PreferencesTabProps {
  form: UseFormReturn<ContactFormData>
}

export const PreferencesTab = ({ form }: PreferencesTabProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <FormField
        control={form.control}
        name="contact_preference"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Preferencia de Contacto</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar preferencia" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="telefono">Teléfono</SelectItem>
                <SelectItem value="whatsapp">WhatsApp</SelectItem>
                <SelectItem value="presencial">Presencial</SelectItem>
              </SelectContent>
            </Select>
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
                <SelectTrigger>
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
        name="how_found_us"
        render={({ field }) => (
          <FormItem>
            <FormLabel>¿Cómo nos conoció?</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar opción" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="referencia">Referencia</SelectItem>
                <SelectItem value="web">Página web</SelectItem>
                <SelectItem value="redes_sociales">Redes sociales</SelectItem>
                <SelectItem value="publicidad">Publicidad</SelectItem>
                <SelectItem value="otro">Otro</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  )
}
