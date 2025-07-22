
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Form } from '@/components/ui/form'
import { Button } from '@/components/ui/button'
import { ContactFormTabs } from './ContactFormTabs'
import { NifLookup } from './NifLookup'
import { Building2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { useContactForm } from '@/hooks/useContactForm'
import { Contact } from '@/hooks/useContacts'

interface ContactFormDialogProps {
  contact?: Contact | null
  open: boolean
  onClose: () => void
}

export const ContactFormDialog = ({ contact, open, onClose }: ContactFormDialogProps) => {
  const { form, isEditing, isCompanyDataLoaded, handleCompanyFound, onSubmit } = useContactForm(contact, onClose)

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Editar Contacto' : 'Nuevo Contacto'}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            
            {/* Sección de búsqueda empresarial */}
            {!isEditing && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Building2 className="h-5 w-5 text-blue-600" />
                  <h3 className="font-semibold text-blue-900">Búsqueda Empresarial</h3>
                  <Badge variant="secondary" className="text-xs">
                    Registro Mercantil
                  </Badge>
                </div>
                <p className="text-sm text-blue-700 mb-4">
                  Introduce el NIF/CIF para auto-completar los datos oficiales de la empresa
                </p>
                <NifLookup
                  onCompanyFound={handleCompanyFound}
                  initialNif={form.watch('dni_nif')}
                  disabled={form.formState.isSubmitting}
                />
              </div>
            )}

            <ContactFormTabs form={form} isCompanyDataLoaded={isCompanyDataLoaded} />

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting
                  ? 'Guardando...'
                  : isEditing
                  ? 'Actualizar Contacto'
                  : 'Crear Contacto'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
