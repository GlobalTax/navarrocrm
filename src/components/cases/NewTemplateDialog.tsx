
import { useState } from 'react'

import { toast } from 'sonner'

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'

import { usePracticeAreas } from '@/hooks/usePracticeAreas'

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

  const { practiceAreas, isLoading: isLoadingAreas } = usePracticeAreas()

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
      default_billing_method: formData.default_billing_method || undefined
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
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Nueva Plantilla de Expediente</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="template-name">Nombre de la Plantilla *</Label>
            <Input
              id="template-name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Ej: Compraventa Inmueble"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="template-description">Descripción</Label>
            <Textarea
              id="template-description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Descripción opcional de la plantilla..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>Área de Práctica</Label>
            <Select 
              value={formData.practice_area_id} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, practice_area_id: value }))}
              disabled={isLoadingAreas}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar área..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Sin especificar</SelectItem>
                {practiceAreas?.map((area) => (
                  <SelectItem key={area.id} value={area.id}>
                    {area.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Método de Facturación por Defecto</Label>
            <Select 
              value={formData.default_billing_method} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, default_billing_method: value }))}
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
