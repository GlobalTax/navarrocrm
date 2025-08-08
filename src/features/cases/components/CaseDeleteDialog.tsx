import { useState } from 'react'
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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Case } from '@/features/cases'
import { Trash2 } from 'lucide-react'

interface CaseDeleteDialogProps {
  case_: Case | null
  open: boolean
  onClose: () => void
  onConfirm: (caseId: string) => void
  isDeleting: boolean
}

export function CaseDeleteDialog({
  case_,
  open,
  onClose,
  onConfirm,
  isDeleting
}: CaseDeleteDialogProps) {
  const [confirmText, setConfirmText] = useState('')

  const handleClose = () => {
    setConfirmText('')
    onClose()
  }

  const handleConfirm = () => {
    if (case_ && confirmText === 'eliminar') {
      onConfirm(case_.id)
      setConfirmText('')
    }
  }

  const isConfirmValid = confirmText === 'eliminar'

  return (
    <AlertDialog open={open} onOpenChange={handleClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-red-600">
            <Trash2 className="h-5 w-5" />
            Eliminar Expediente
          </AlertDialogTitle>
          <AlertDialogDescription>
            Esta acción es <strong>irreversible</strong>. Se eliminará permanentemente el expediente 
            <strong> "{case_?.title}"</strong> y todos sus datos asociados.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-4 py-4">
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <h4 className="font-medium text-red-800 mb-2">Se eliminarán:</h4>
            <ul className="text-sm text-red-700 space-y-1">
              <li>• Todas las tareas asociadas</li>
              <li>• Registros de tiempo</li>
              <li>• Documentos vinculados</li>
              <li>• Historial de comunicaciones</li>
            </ul>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm-text">
              Para confirmar, escribe <strong>"eliminar"</strong> en el campo de abajo:
            </Label>
            <Input
              id="confirm-text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="eliminar"
              className="border-red-300 focus:border-red-500"
            />
          </div>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={isDeleting || !isConfirmValid}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            {isDeleting ? 'Eliminando...' : 'Eliminar Expediente'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}