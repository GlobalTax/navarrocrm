
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Info } from 'lucide-react'
import { useTaskFormWithCache } from '@/hooks/useTaskFormWithCache'
import { TaskBasicFields } from './form/TaskBasicFields'
import { TaskDateFields } from './form/TaskDateFields'
import { TaskAssignmentFields } from './form/TaskAssignmentFields'
import { TaskUserAssignmentFields } from './form/TaskUserAssignmentFields'

interface TaskFormDialogProps {
  isOpen: boolean
  onClose: () => void
  task?: any
}

export const TaskFormDialog = ({ isOpen, onClose, task }: TaskFormDialogProps) => {
  const {
    formData,
    handleInputChange,
    handleSubmit,
    isCreating,
    isUpdating,
    hasSavedData,
    clearSavedData
  } = useTaskFormWithCache({ task, isOpen, onClose })

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {task ? 'Editar Tarea' : 'Nueva Tarea'}
          </DialogTitle>
        </DialogHeader>

        {/* Draft Recovery Alert */}
        {!task && hasSavedData && (
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <span>Se ha recuperado un borrador guardado automáticamente.</span>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={clearSavedData}
              >
                Descartar borrador
              </Button>
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <TaskBasicFields
            formData={formData}
            onInputChange={handleInputChange}
          />

          <TaskDateFields
            formData={formData}
            onInputChange={handleInputChange}
          />

          <TaskAssignmentFields
            formData={formData}
            onInputChange={handleInputChange}
          />

          <TaskUserAssignmentFields
            formData={formData}
            onInputChange={handleInputChange}
          />

          <div className="flex justify-end space-x-3">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isCreating || isUpdating}>
              {task ? 'Actualizar' : 'Crear'} Tarea
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
