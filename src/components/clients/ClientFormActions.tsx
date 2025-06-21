
import { Button } from '@/components/ui/button'

interface ClientFormActionsProps {
  isEditing: boolean
  isSubmitting: boolean
  onCancel: () => void
}

export const ClientFormActions = ({ 
  isEditing, 
  isSubmitting, 
  onCancel 
}: ClientFormActionsProps) => {
  return (
    <div className="flex justify-end gap-3 pt-4 border-t">
      <Button type="button" variant="outline" onClick={onCancel}>
        Cancelar
      </Button>
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting
          ? 'Guardando...'
          : isEditing
          ? 'Actualizar Cliente'
          : 'Crear Cliente'
        }
      </Button>
    </div>
  )
}
