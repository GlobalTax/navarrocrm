import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Form } from '@/components/ui/form'
import { Button } from '@/components/ui/button'
import { ContactFormTabs } from '@/components/contacts/ContactFormTabs'
import { NifLookup } from '@/components/contacts/NifLookup'
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
          <DialogTitle className="flex items-center gap-2">
            {isEditing ? 'Editar Contacto' : 'Nuevo Contacto'}
            {isCompanyDataLoaded && (
              <Badge variant="secondary" className="bg-green-50 text-green-700 border-green-200">
                <Building2 className="h-3 w-3 mr-1" />
                Datos empresariales
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <NifLookup onCompanyFound={handleCompanyFound} />
            
            <ContactFormTabs form={form} />

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