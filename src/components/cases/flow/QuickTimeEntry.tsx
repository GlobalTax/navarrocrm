import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Clock, Zap } from 'lucide-react'

interface QuickTimeEntryProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (minutes: number, description: string) => Promise<void>
  caseTitle: string
}

export const QuickTimeEntry = ({ open, onOpenChange, onSubmit, caseTitle }: QuickTimeEntryProps) => {
  const [selectedMinutes, setSelectedMinutes] = useState<number | null>(null)
  const [description, setDescription] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const quickTimeOptions = [
    { minutes: 15, label: '15 min', icon: Clock },
    { minutes: 30, label: '30 min', icon: Clock },
    { minutes: 45, label: '45 min', icon: Clock },
    { minutes: 60, label: '1 hora', icon: Clock },
    { minutes: 90, label: '1.5 horas', icon: Zap },
    { minutes: 120, label: '2 horas', icon: Zap },
  ]

  const handleSubmit = async () => {
    if (!selectedMinutes || !description.trim()) return

    setIsSubmitting(true)
    try {
      await onSubmit(selectedMinutes, description.trim())
      setSelectedMinutes(null)
      setDescription('')
    } finally {
      setIsSubmitting(false)
    }
  }

  const canSubmit = selectedMinutes && description.trim()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Registro Rápido - {caseTitle}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Selección de tiempo */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Tiempo trabajado</Label>
            <div className="grid grid-cols-2 gap-3">
              {quickTimeOptions.map((option) => {
                const IconComponent = option.icon
                return (
                  <Button
                    key={option.minutes}
                    variant={selectedMinutes === option.minutes ? 'default' : 'outline'}
                    size="lg"
                    onClick={() => setSelectedMinutes(option.minutes)}
                    className="flex items-center gap-2 h-12"
                  >
                    <IconComponent className="h-4 w-4" />
                    {option.label}
                  </Button>
                )
              })}
            </div>
          </div>

          {/* Descripción */}
          <div className="space-y-2">
            <Label htmlFor="quick-description" className="text-sm font-medium">
              ¿En qué trabajaste? *
            </Label>
            <Textarea
              id="quick-description"
              placeholder="Describe brevemente el trabajo realizado..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="resize-none h-24"
              rows={3}
            />
          </div>

          {/* Acciones */}
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!canSubmit || isSubmitting}
            >
              {isSubmitting ? 'Guardando...' : 'Registrar Tiempo'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}