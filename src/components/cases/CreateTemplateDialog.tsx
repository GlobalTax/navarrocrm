
import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { usePracticeAreas } from '@/hooks/usePracticeAreas'
import { CreateTemplateData } from '@/hooks/useMatterTemplateActions'

interface CreateTemplateDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: CreateTemplateData) => void
  isCreating: boolean
}

export function CreateTemplateDialog({ 
  open, 
  onOpenChange, 
  onSubmit, 
  isCreating 
}: CreateTemplateDialogProps) {
  const { practiceAreas = [] } = usePracticeAreas()
  const [formData, setFormData] = useState<CreateTemplateData>({
    name: '',
    description: '',
    practice_area_id: 'none',
    default_billing_method: 'hourly'
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim()) return
    
    onSubmit({
      ...formData,
      practice_area_id: formData.practice_area_id === 'none' ? undefined : formData.practice_area_id
    })
  }

  const handleClose = () => {
    setFormData({
      name: '',
      description: '',
      practice_area_id: 'none',
      default_billing_method: 'hourly'
    })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Nueva Plantilla de Expediente</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre de la Plantilla *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Ej: Divorcio Express, Constitución de Sociedad..."
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe para qué casos se utilizará esta plantilla..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>Área de Práctica</Label>
            <Select 
              value={formData.practice_area_id} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, practice_area_id: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar área de práctica" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Sin área específica</SelectItem>
                {practiceAreas.map((area) => (
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
                <SelectItem value="contingency">Por Contingencia</SelectItem>
                <SelectItem value="retainer">Retainer</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleClose}
              disabled={isCreating}
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={isCreating || !formData.name.trim()}
            >
              {isCreating ? 'Creando...' : 'Crear Plantilla'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
