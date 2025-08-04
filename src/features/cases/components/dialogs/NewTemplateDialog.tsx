import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2 } from 'lucide-react'
import { usePracticeAreas } from '@/hooks/usePracticeAreas'

interface NewTemplateDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: {
    name: string
    description: string
    practice_area_id: string
    default_billing_method: string
  }) => void
  isLoading: boolean
}

export function NewTemplateDialog({
  open,
  onOpenChange,
  onSubmit,
  isLoading
}: NewTemplateDialogProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    practice_area_id: '',
    default_billing_method: 'hourly'
  })

  const { practiceAreas } = usePracticeAreas()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name.trim()) {
      return
    }

    onSubmit(formData)
    
    // Reset form
    setFormData({
      name: '',
      description: '',
      practice_area_id: '',
      default_billing_method: 'hourly'
    })
  }

  const handleClose = () => {
    setFormData({
      name: '',
      description: '',
      practice_area_id: '',
      default_billing_method: 'hourly'
    })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Nueva Plantilla de Expediente</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Nombre de la plantilla</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Ej: Constitución de Sociedad"
              disabled={isLoading}
              required
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe el tipo de expediente y cuando usar esta plantilla..."
              disabled={isLoading}
              rows={3}
            />
          </div>

          <div className="grid gap-2">
            <Label>Área de práctica</Label>
            <Select
              value={formData.practice_area_id}
              onValueChange={(value) => setFormData(prev => ({ ...prev, practice_area_id: value }))}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar área de práctica" />
              </SelectTrigger>
              <SelectContent>
                {practiceAreas.map((area) => (
                  <SelectItem key={area.id} value={area.id}>
                    {area.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label>Método de facturación por defecto</Label>
            <Select
              value={formData.default_billing_method}
              onValueChange={(value) => setFormData(prev => ({ ...prev, default_billing_method: value }))}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hourly">Por horas</SelectItem>
                <SelectItem value="fixed">Precio fijo</SelectItem>
                <SelectItem value="contingency">Cuota litis</SelectItem>
                <SelectItem value="retainer">Retainer</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !formData.name.trim()}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creando...
                </>
              ) : (
                'Crear Plantilla'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}