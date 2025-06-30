
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Form } from '@/components/ui/form'
import { Button } from '@/components/ui/button'
import { PersonFormTabs } from './PersonFormTabs'
import { usePersonForm } from '@/hooks/usePersonForm'
import { Person } from '@/hooks/usePersons'

interface PersonFormDialogProps {
  person?: Person | null
  open: boolean
  onClose: () => void
}

export const PersonFormDialog = ({ person, open, onClose }: PersonFormDialogProps) => {
  const { form, isEditing, onSubmit } = usePersonForm(person, onClose)

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Editar Persona Física' : 'Nueva Persona Física'}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <PersonFormTabs form={form} />

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting
                  ? 'Guardando...'
                  : isEditing
                  ? 'Actualizar Persona'
                  : 'Crear Persona'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
