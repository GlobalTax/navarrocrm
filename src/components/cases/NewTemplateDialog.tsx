
import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { usePracticeAreas } from '@/hooks/usePracticeAreas'
import { toast } from 'sonner'

interface NewTemplateDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: {
    name: string
    description?: string
    practice_area_id?: string
    default_billing_method?: string
  }) => void
  isLoading: boolean
}

export function NewTemplateDialog({ open, onOpenChange, onSubmit, isLoading }: NewTemplateDialogProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    practice_area_id: '',
    default_billing_method: 'hourly'
  })

  const { practiceAreas = [] } = usePracticeAreas()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name.trim()) {
      toast.error('El nombre de la plantilla es obligatorio')
      return
    }

    onSubmit({
      name: formData.name.trim(),
      description: formData.description.trim() || undefined,
      practice_area_id: formData.practice_area_id || undefined,
      default_billing_method: formData.default_billing_method
    })

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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Nueva Plantilla de Expediente</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Ej: Contrato de Arrendamiento"
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe el tipo de expediente..."
              rows={3}
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="practice_area">Área de Práctica</Label>
            <Select
              value={formData.practice_area_id}
              onValueChange={(value) => setFormData(prev => ({ ...prev, practice_area_id: value }))}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar área..." />
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

          <div className="space-y-2">
            <Label htmlFor="billing_method">Método de Facturación</Label>
            <Select
              value={formData.default_billing_method}
              onValueChange={(value) => setFormData(prev => ({ ...prev, default_billing_method: value }))}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hourly">Por Horas</SelectItem>
                <SelectItem value="fixed">Tarifa Fija</SelectItem>
                <SelectItem value="contingency">Contingencia</SelectItem>
                <SelectItem value="retainer">Anticipo</SelectItem>
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
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Creando...' : 'Crear Plantilla'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
