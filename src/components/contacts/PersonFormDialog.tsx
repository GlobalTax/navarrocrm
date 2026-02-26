
import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Form } from '@/components/ui/form'
import { Button } from '@/components/ui/button'
import { PersonFormTabs } from './PersonFormTabs'
import { usePersonForm } from '@/hooks/usePersonForm'
import { Person } from '@/hooks/usePersons'
import { detectCompanyPattern } from '@/lib/contactClassification'
import { AlertTriangle } from 'lucide-react'

interface PersonFormDialogProps {
  person?: Person | null
  open: boolean
  onClose: () => void
}

export const PersonFormDialog = ({ person, open, onClose }: PersonFormDialogProps) => {
  const { form, isEditing, onSubmit } = usePersonForm(person, onClose)
  const [showCompanyWarning, setShowCompanyWarning] = useState(false)
  const [pendingData, setPendingData] = useState<any>(null)

  const handleSubmit = async (data: any) => {
    const result = detectCompanyPattern(data.name, data.dni_nif)
    if (result.looksLikeCompany && !showCompanyWarning) {
      setShowCompanyWarning(true)
      setPendingData(data)
      return
    }
    setShowCompanyWarning(false)
    setPendingData(null)
    await onSubmit(data)
  }

  const handleForceSubmit = async () => {
    if (pendingData) {
      setShowCompanyWarning(false)
      await onSubmit(pendingData)
      setPendingData(null)
    }
  }

  const handleDismissWarning = () => {
    setShowCompanyWarning(false)
    setPendingData(null)
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Editar Persona Física' : 'Nueva Persona Física'}
          </DialogTitle>
        </DialogHeader>

        {showCompanyWarning && (
          <div className="flex items-start gap-3 p-4 rounded-[10px] border-[0.5px] border-yellow-400 bg-yellow-50">
            <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 shrink-0" />
            <div className="flex-1">
              <p className="font-medium text-sm text-yellow-800">
                Este nombre parece una empresa
              </p>
              <p className="text-sm text-yellow-700 mt-1">
                El nombre "{pendingData?.name}" tiene patrones típicos de empresa (S.L., S.A., LTD, etc.). ¿Seguro que quieres guardarlo como persona física?
              </p>
              <div className="flex gap-2 mt-3">
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={handleForceSubmit}
                  className="rounded-[10px] border-[0.5px] border-black"
                >
                  Sí, guardar como persona
                </Button>
                <Button 
                  size="sm" 
                  onClick={handleDismissWarning}
                  className="rounded-[10px] border-[0.5px] border-black"
                >
                  Corregir
                </Button>
              </div>
            </div>
          </div>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
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
