
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Case } from '@/hooks/useCases'
import { Archive } from 'lucide-react'

interface CaseArchiveDialogProps {
  case_: Case | null
  open: boolean
  onClose: () => void
  onConfirm: (caseId: string) => void
  isArchiving: boolean
}

export function CaseArchiveDialog({
  case_,
  open,
  onClose,
  onConfirm,
  isArchiving
}: CaseArchiveDialogProps) {
  const handleConfirm = () => {
    if (case_) {
      onConfirm(case_.id)
    }
  }

  // Check if status indicates archived state
  const isArchived = case_?.status === 'closed' // Using 'closed' as archived equivalent

  return (
    <AlertDialog open={open} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <Archive className="h-5 w-5" />
            {isArchived ? 'Reabrir Expediente' : 'Cerrar Expediente'}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {isArchived 
              ? `¿Está seguro de que desea reabrir el expediente "${case_?.title}"? Volverá a aparecer como activo.`
              : `¿Está seguro de que desea cerrar el expediente "${case_?.title}"? Se marcará como cerrado pero conservará todos sus datos.`
            }
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isArchiving}>
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={isArchiving}
          >
            {isArchiving 
              ? (isArchived ? 'Reabriendo...' : 'Cerrando...') 
              : (isArchived ? 'Reabrir' : 'Cerrar')
            }
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
