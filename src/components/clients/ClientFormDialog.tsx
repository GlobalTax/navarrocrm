
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Form } from '@/components/ui/form'
import { ClientFormTabs } from './ClientFormTabs'
import { CompanyLookupSection } from './CompanyLookupSection'
import { ClientFormActions } from './ClientFormActions'
import { useClientForm } from '@/hooks/useClientForm'

interface Client {
  id: string
  name: string
  email: string | null
  phone: string | null
  dni_nif: string | null
  address_street: string | null
  address_city: string | null
  address_postal_code: string | null
  address_country: string | null
  legal_representative: string | null
  client_type: string | null
  business_sector: string | null
  how_found_us: string | null
  contact_preference: string | null
  preferred_language: string | null
  hourly_rate: number | null
  payment_method: string | null
  status: string | null
  tags: string[] | null
  internal_notes: string | null
}

interface ClientFormDialogProps {
  client?: Client | null
  open: boolean
  onClose: () => void
}

export const ClientFormDialog = ({ client, open, onClose }: ClientFormDialogProps) => {
  const { form, isEditing, handleCompanyFound, onSubmit } = useClientForm(client, onClose)

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Editar Cliente' : 'Nuevo Cliente'}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            
            {/* Sección de búsqueda empresarial */}
            {!isEditing && (
              <CompanyLookupSection
                onCompanyFound={handleCompanyFound}
                initialNif={form.watch('dni_nif')}
                disabled={form.formState.isSubmitting}
              />
            )}

            <ClientFormTabs form={form} />

            <ClientFormActions
              isEditing={isEditing}
              isSubmitting={form.formState.isSubmitting}
              onCancel={onClose}
            />
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
