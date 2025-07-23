
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Form } from '@/components/ui/form'
import { ClientFormTabs } from './ClientFormTabs'
import { CompanyLookupSection } from './CompanyLookupSection'
import { ClientFormActions } from './ClientFormActions'
import { useClientForm } from '@/hooks/useClientForm'
import type { Contact } from '@/types/shared/clientTypes'

interface ClientFormDialogProps {
  client?: Contact | null
  open: boolean
  onClose: () => void
}

export const ClientFormDialog = ({ client, open, onClose }: ClientFormDialogProps) => {
  const { form, isEditing, isCompanyDataLoaded, handleCompanyFound, onSubmit } = useClientForm(client, onClose)

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

            <ClientFormTabs form={form} isCompanyDataLoaded={isCompanyDataLoaded} />

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
