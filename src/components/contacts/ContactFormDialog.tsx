
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Form } from '@/components/ui/form'
import { Button } from '@/components/ui/button'
import { ContactFormTabs } from './ContactFormTabs'
import { NifLookup } from './NifLookup'
import { Building2, Loader2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { useContactForm } from '@/hooks/useContactForm'
import { Contact } from '@/hooks/useContacts'
import { FormErrorBoundary } from '@/components/error-boundaries/FormErrorBoundary'
import { toast } from 'sonner'
import { useEffect } from 'react'

interface ContactFormDialogProps {
  contact?: Contact | null
  open: boolean
  onClose: () => void
}

export const ContactFormDialog = ({ contact, open, onClose }: ContactFormDialogProps) => {
  const { form, isEditing, isCompanyDataLoaded, handleCompanyFound, submitForm, isValid, errors } = useContactForm(contact, onClose)

  // Auto-save draft functionality
  useEffect(() => {
    if (!isEditing && open) {
      const interval = setInterval(() => {
        const formData = form.getValues()
        if (form.formState.isDirty && formData.name) {
          localStorage.setItem('contact_draft', JSON.stringify({
            data: formData,
            timestamp: Date.now()
          }))
        }
      }, 30000) // Auto-save every 30 seconds

      return () => clearInterval(interval)
    }
  }, [isEditing, open, form])

  // Load draft on mount
  useEffect(() => {
    if (!isEditing && open) {
      const saved = localStorage.getItem('contact_draft')
      if (saved) {
        try {
          const { data, timestamp } = JSON.parse(saved)
          const hoursSinceLastSave = (Date.now() - timestamp) / (1000 * 60 * 60)
          
          if (hoursSinceLastSave < 24) {
            toast.info('Se encontró un borrador guardado', {
              action: {
                label: 'Cargar borrador',
                onClick: () => {
                  Object.keys(data).forEach(key => {
                    form.setValue(key as any, data[key])
                  })
                  toast.success('Borrador cargado')
                }
              }
            })
          }
        } catch (error) {
          console.warn('Error loading draft:', error)
        }
      }
    }
  }, [isEditing, open, form])

  const handleSubmit = async (data: any) => {
    try {
      await submitForm(data)
      // Clear draft on successful submit
      localStorage.removeItem('contact_draft')
    } catch (error) {
      console.error('Submit error:', error)
    }
  }

  const handleClose = () => {
    // Clear draft if explicitly closing
    if (form.formState.isDirty) {
      localStorage.removeItem('contact_draft')
    }
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isEditing ? 'Editar Contacto' : 'Nuevo Contacto'}
            {form.formState.isDirty && (
              <Badge variant="secondary" className="text-xs">
                Sin guardar
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        <FormErrorBoundary formName="ContactForm" autoSave>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
              
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

              <ContactFormTabs 
                form={form} 
                isCompanyDataLoaded={isCompanyDataLoaded}
                currentContactId={contact?.id}
              />

              {/* Form validation summary */}
              {Object.keys(errors).length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h4 className="font-semibold text-red-900 mb-2">
                    Errores de validación ({Object.keys(errors).length})
                  </h4>
                  <ul className="text-sm text-red-700 space-y-1">
                    {Object.entries(errors).map(([field, message]) => (
                      <li key={field}>• {message}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={handleClose}>
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  disabled={form.formState.isSubmitting || !isValid}
                >
                  {form.formState.isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Guardando...
                    </>
                  ) : (
                    isEditing ? 'Actualizar Contacto' : 'Crear Contacto'
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </FormErrorBoundary>
      </DialogContent>
    </Dialog>
  )
}
