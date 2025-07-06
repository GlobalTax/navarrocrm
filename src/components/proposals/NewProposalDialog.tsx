import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, Trash2, Loader2 } from 'lucide-react'
import { useClients } from '@/hooks/useClients'
import { useServiceCatalog } from '@/hooks/useServiceCatalog'
import { CreateProposalData, ProposalLineItem } from '@/hooks/useProposals'

interface NewProposalDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: CreateProposalData) => void
  isCreating: boolean
}

export function NewProposalDialog({ open, onOpenChange, onSubmit, isCreating }: NewProposalDialogProps) {
  const { clients = [] } = useClients()
  const { services = [] } = useServiceCatalog()

  const [formData, setFormData] = useState<CreateProposalData>({
    contact_id: '',
    title: '',
    description: '',
    proposal_type: 'service',
    valid_until: '',
    notes: '',
    line_items: []
  })

  const addLineItem = () => {
    const newItem: Omit<ProposalLineItem, 'id' | 'proposal_id'> = {
      service_catalog_id: undefined,
      name: '',
      description: '',
      quantity: 1,
      unit_price: 0,
      total_price: 0,
      billing_unit: 'hour',
      sort_order: formData.line_items.length
    }
    setFormData(prev => ({
      ...prev,
      line_items: [...prev.line_items, newItem]
    }))
  }

  const updateLineItem = (index: number, field: string, value: any) => {
    const updatedItems = [...formData.line_items]
    updatedItems[index] = { 
      ...updatedItems[index], 
      [field]: value 
    }
    
    // Calcular total_price automáticamente
    if (field === 'quantity' || field === 'unit_price') {
      updatedItems[index].total_price = updatedItems[index].quantity * updatedItems[index].unit_price
    }

    setFormData(prev => ({
      ...prev,
      line_items: updatedItems
    }))
  }

  const removeLineItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      line_items: prev.line_items.filter((_, i) => i !== index)
    }))
  }

  const selectService = (index: number, serviceId: string) => {
    const service = services.find(s => s.id === serviceId)
    if (service) {
      updateLineItem(index, 'service_catalog_id', serviceId)
      updateLineItem(index, 'name', service.name)
      updateLineItem(index, 'description', service.description || '')
      updateLineItem(index, 'unit_price', service.default_price || 0)
      updateLineItem(index, 'billing_unit', service.billing_unit)
      updateLineItem(index, 'total_price', (service.default_price || 0) * formData.line_items[index].quantity)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.contact_id || !formData.title) {
      return
    }

    onSubmit(formData)
    
    // Reset form
    setFormData({
      contact_id: '',
      title: '',
      description: '',
      proposal_type: 'service',
      valid_until: '',
      notes: '',
      line_items: []
    })
  }

  const totalAmount = formData.line_items.reduce((sum, item) => sum + item.total_price, 0)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nueva Propuesta</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="client">Cliente *</Label>
              <Select value={formData.contact_id} onValueChange={(value) => setFormData(prev => ({ ...prev, contact_id: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar cliente" />
                </SelectTrigger>
                <SelectContent>
                      {clients.map(client => (
                        <SelectItem key={client.id} value={client.id}>
                          {client.name} ({client.email || 'Sin email'})
                        </SelectItem>
                      ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="proposal_type">Tipo de Propuesta</Label>
              <Select value={formData.proposal_type} onValueChange={(value: any) => setFormData(prev => ({ ...prev, proposal_type: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="service">Servicios</SelectItem>
                  <SelectItem value="retainer">Retainer</SelectItem>
                  <SelectItem value="project">Proyecto</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Título *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Título de la propuesta"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Descripción de la propuesta"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="valid_until">Válida hasta</Label>
            <Input
              type="date"
              id="valid_until"
              value={formData.valid_until}
              onChange={(e) => setFormData(prev => ({ ...prev, valid_until: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notas</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Notas adicionales"
            />
          </div>

          {/* Line Items */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Items de la Propuesta</h4>
            
            {formData.line_items.map((item, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle>Item #{index + 1}</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-3 gap-4">
                  <div className="col-span-2 space-y-2">
                    <Label htmlFor={`service-${index}`}>Servicio</Label>
                    <Select onValueChange={(value) => selectService(index, value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar servicio" />
                      </SelectTrigger>
                      <SelectContent>
                        {services.map(service => (
                          <SelectItem key={service.id} value={service.id}>
                            {service.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`quantity-${index}`}>Cantidad</Label>
                    <Input
                      type="number"
                      id={`quantity-${index}`}
                      value={item.quantity}
                      onChange={(e) => updateLineItem(index, 'quantity', Number(e.target.value))}
                    />
                  </div>

                  <div className="col-span-2 space-y-2">
                    <Label htmlFor={`name-${index}`}>Nombre</Label>
                    <Input
                      id={`name-${index}`}
                      value={item.name}
                      onChange={(e) => updateLineItem(index, 'name', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`unit_price-${index}`}>Precio Unitario</Label>
                    <Input
                      type="number"
                      id={`unit_price-${index}`}
                      value={item.unit_price}
                      onChange={(e) => updateLineItem(index, 'unit_price', Number(e.target.value))}
                    />
                  </div>

                  <div className="col-span-3 space-y-2">
                    <Label htmlFor={`description-${index}`}>Descripción</Label>
                    <Textarea
                      id={`description-${index}`}
                      value={item.description}
                      onChange={(e) => updateLineItem(index, 'description', e.target.value)}
                    />
                  </div>
                </CardContent>
                <div className="flex justify-end p-4">
                  <Button variant="outline" size="sm" onClick={() => removeLineItem(index)}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Eliminar
                  </Button>
                </div>
              </Card>
            ))}

            <Button type="button" variant="secondary" size="sm" onClick={addLineItem}>
              <Plus className="h-4 w-4 mr-2" />
              Agregar Item
            </Button>
          </div>

          <div className="text-right font-semibold text-lg">
            Total: €{totalAmount.toLocaleString()}
          </div>

          <div className="flex justify-end">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isCreating}>
              {isCreating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Creando...
                </>
              ) : (
                'Crear Propuesta'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
