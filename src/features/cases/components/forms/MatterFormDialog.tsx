import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useState, useEffect } from 'react'
import { Case, CaseFormData } from '../../types'

interface MatterFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: CaseFormData) => void
  isLoading?: boolean
  initialData?: Case
}

export function MatterFormDialog({
  open,
  onOpenChange,
  onSubmit,
  isLoading = false,
  initialData
}: MatterFormDialogProps) {
  const [formData, setFormData] = useState<CaseFormData>({
    title: '',
    description: '',
    status: 'open',
    contact_id: '',
    practice_area: '',
    responsible_solicitor_id: '',
    originating_solicitor_id: '',
    billing_method: 'hourly',
    estimated_budget: undefined,
    template_selection: 'none'
  })

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title,
        description: initialData.description || '',
        status: initialData.status,
        contact_id: initialData.contact_id || '',
        practice_area: initialData.practice_area || '',
        responsible_solicitor_id: initialData.responsible_solicitor_id || '',
        originating_solicitor_id: initialData.originating_solicitor_id || '',
        billing_method: initialData.billing_method,
        estimated_budget: initialData.estimated_budget || undefined,
        template_selection: 'none'
      })
    }
  }, [initialData])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  const handleInputChange = (field: keyof CaseFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {initialData ? 'Editar Expediente' : 'Nuevo Expediente'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title">Título *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="status">Estado</Label>
              <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="open">Abierto</SelectItem>
                  <SelectItem value="on_hold">En espera</SelectItem>
                  <SelectItem value="closed">Cerrado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div>
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={3}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="practice_area">Área de práctica</Label>
              <Input
                id="practice_area"
                value={formData.practice_area}
                onChange={(e) => handleInputChange('practice_area', e.target.value)}
              />
            </div>
            
            <div>
              <Label htmlFor="billing_method">Método de facturación</Label>
              <Select value={formData.billing_method} onValueChange={(value) => handleInputChange('billing_method', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hourly">Por horas</SelectItem>
                  <SelectItem value="fixed">Tarifa fija</SelectItem>
                  <SelectItem value="contingency">Contingencia</SelectItem>
                  <SelectItem value="retainer">Retainer</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div>
            <Label htmlFor="estimated_budget">Presupuesto estimado (€)</Label>
            <Input
              id="estimated_budget"
              type="number"
              value={formData.estimated_budget || ''}
              onChange={(e) => handleInputChange('estimated_budget', e.target.value ? Number(e.target.value) : undefined)}
            />
          </div>
          
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Guardando...' : (initialData ? 'Actualizar' : 'Crear')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}