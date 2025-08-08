
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
      <DialogContent className="sm:max-w-md rounded-[10px] border-[0.5px] border-border shadow-lg">
        <DialogHeader>
          <DialogTitle className="text-foreground font-medium">Nueva Plantilla de Expediente</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-foreground font-medium">Nombre *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Ej: Contrato de Arrendamiento"
              disabled={isLoading}
              className="border-[0.5px] border-border rounded-[10px] focus:border-primary transition-colors duration-200"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-foreground font-medium">Descripción</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe el tipo de expediente..."
              rows={3}
              disabled={isLoading}
              className="border-[0.5px] border-border rounded-[10px] focus:border-primary transition-colors duration-200"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="practice_area" className="text-foreground font-medium">Área de Práctica</Label>
            <Select
              value={formData.practice_area_id}
              onValueChange={(value) => setFormData(prev => ({ ...prev, practice_area_id: value }))}
              disabled={isLoading}
            >
              <SelectTrigger className="border-[0.5px] border-border rounded-[10px] focus:border-primary transition-colors duration-200">
                <SelectValue placeholder="Seleccionar área..." />
              </SelectTrigger>
              <SelectContent className="rounded-[10px] border-[0.5px] border-border shadow-lg">
                {practiceAreas.map((area) => (
                  <SelectItem 
                    key={area.id} 
                    value={area.id}
                    className="rounded-[8px] hover:bg-muted transition-colors duration-200"
                  >
                    {area.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="billing_method" className="text-foreground font-medium">Método de Facturación</Label>
            <Select
              value={formData.default_billing_method}
              onValueChange={(value) => setFormData(prev => ({ ...prev, default_billing_method: value }))}
              disabled={isLoading}
            >
              <SelectTrigger className="border-[0.5px] border-border rounded-[10px] focus:border-primary transition-colors duration-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-[10px] border-[0.5px] border-border shadow-lg">
                <SelectItem value="hourly" className="rounded-[8px] hover:bg-muted transition-colors duration-200">Por Horas</SelectItem>
                <SelectItem value="fixed" className="rounded-[8px] hover:bg-muted transition-colors duration-200">Tarifa Fija</SelectItem>
                <SelectItem value="contingency" className="rounded-[8px] hover:bg-muted transition-colors duration-200">Contingencia</SelectItem>
                <SelectItem value="retainer" className="rounded-[8px] hover:bg-muted transition-colors duration-200">Anticipo</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
              className="border-[0.5px] border-border rounded-[10px] hover:-translate-y-0.5 transition-all duration-200"
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading}
              className="rounded-[10px] hover:-translate-y-0.5 transition-all duration-200"
            >
              {isLoading ? 'Creando...' : 'Crear Plantilla'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
