
import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { useCases } from '@/hooks/useCases'
import { useTimeEntries } from '@/hooks/useTimeEntries'
import { toast } from 'sonner'

interface HeaderTimerDialogProps {
  isOpen: boolean
  onClose: () => void
  onSave: () => void
  timerSeconds: number
}

export const HeaderTimerDialog = ({ isOpen, onClose, onSave, timerSeconds }: HeaderTimerDialogProps) => {
  const [selectedCaseId, setSelectedCaseId] = useState<string>('none')
  const [description, setDescription] = useState('')
  const [isBillable, setIsBillable] = useState(true)
  const [isLoading, setIsLoading] = useState(false)

  const { cases } = useCases()
  const { createTimeEntry } = useTimeEntries()

  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    const secs = totalSeconds % 60
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`
    }
    return `${minutes}m ${secs}s`
  }

  const handleSave = async () => {
    if (!description.trim()) {
      toast.error('Añade una descripción del trabajo realizado')
      return
    }

    setIsLoading(true)
    try {
      const minutes = Math.round(timerSeconds / 60)
      
      await createTimeEntry({
        case_id: selectedCaseId === 'none' ? null : selectedCaseId,
        description: description.trim(),
        duration_minutes: minutes,
        is_billable: isBillable
      })

      toast.success(`Tiempo registrado: ${minutes} minutos`)
      
      // Resetear formulario
      setSelectedCaseId('none')
      setDescription('')
      setIsBillable(true)
      
      onSave()
    } catch (error) {
      console.error('❌ Error al registrar tiempo:', error)
      toast.error('Error al registrar el tiempo')
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    // No resetear el formulario al cerrar, por si el usuario quiere intentar de nuevo
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Registrar Tiempo</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Tiempo registrado */}
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <p className="text-lg font-mono font-bold text-blue-700">
              {formatTime(timerSeconds)}
            </p>
            <p className="text-sm text-blue-600">
              Tiempo a registrar: {Math.round(timerSeconds / 60)} minutos
            </p>
          </div>

          {/* Caso (opcional) */}
          <div className="space-y-2">
            <Label htmlFor="case-select">Caso (Opcional)</Label>
            <Select value={selectedCaseId} onValueChange={setSelectedCaseId}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar caso..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Sin caso específico</SelectItem>
                {cases.map((case_) => (
                  <SelectItem key={case_.id} value={case_.id}>
                    {case_.title} ({case_.contact?.name})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Descripción */}
          <div className="space-y-2">
            <Label htmlFor="description">Descripción del trabajo *</Label>
            <Textarea
              id="description"
              placeholder="¿En qué has trabajado?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="resize-none"
              rows={3}
            />
          </div>

          {/* Facturable */}
          <div className="flex items-center justify-between">
            <Label htmlFor="billable">Tiempo facturable</Label>
            <Switch
              id="billable"
              checked={isBillable}
              onCheckedChange={setIsBillable}
            />
          </div>

          {/* Botones */}
          <div className="flex gap-2 pt-4">
            <Button
              variant="outline"
              onClick={handleClose}
              className="flex-1"
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSave}
              className="flex-1"
              disabled={isLoading}
            >
              {isLoading ? 'Guardando...' : 'Guardar Tiempo'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
