
import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useTaskForm } from '@/hooks/useTaskForm'
import { TaskBasicFields } from './form/TaskBasicFields'
import { TaskDateFields } from './form/TaskDateFields'
import { TaskAssignmentFields } from './form/TaskAssignmentFields'
import { TaskUserAssignmentFields } from './form/TaskUserAssignmentFields'
import { TaskImageExtractor } from './TaskImageExtractor'
import { ImageIcon } from 'lucide-react'

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
    prefillFromExtraction
  } = useTaskForm({ task, isOpen, onClose })

  const [showExtractor, setShowExtractor] = useState(false)

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto border-0.5 border-black rounded-[10px] bg-white animate-scale-in">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>
              {task ? 'Editar Tarea' : 'Nueva Tarea'}
            </DialogTitle>
            {!task && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowExtractor(!showExtractor)}
                className="border-[0.5px] border-black rounded-[10px] hover-lift gap-1.5 text-xs"
              >
                <ImageIcon className="h-3.5 w-3.5" />
                Extraer de imagen
              </Button>
            )}
          </div>
        </DialogHeader>

        {showExtractor && (
          <TaskImageExtractor
            onExtracted={(data) => {
              prefillFromExtraction(data)
              setShowExtractor(false)
            }}
            onClose={() => setShowExtractor(false)}
          />
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
            <Button type="button" variant="outline" onClick={onClose} className="border-0.5 border-black rounded-[10px] hover-lift">
              Cancelar
            </Button>
            <Button type="submit" disabled={isCreating || isUpdating} className="border-0.5 border-black rounded-[10px] hover-lift">
              {task ? 'Actualizar' : 'Crear'} Tarea
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
