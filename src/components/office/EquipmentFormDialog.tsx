import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useCreateEquipment, useUpdateEquipment } from '@/hooks/useEquipment'
import { Equipment } from '@/types/office'
import { supabase } from '@/integrations/supabase/client'

interface EquipmentFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  equipment?: Equipment | null
  onSuccess: () => void
}

export const EquipmentFormDialog = ({ 
  open, 
  onOpenChange, 
  equipment, 
  onSuccess 
}: EquipmentFormDialogProps) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'general',
    serial_number: '',
    brand: '',
    model: '',
    purchase_date: '',
    warranty_expiry: '',
    purchase_cost: 0,
    current_location: '',
    status: 'available' as Equipment['status'],
    condition: 'good' as Equipment['condition'],
    notes: ''
  })

  const createEquipment = useCreateEquipment()
  const updateEquipment = useUpdateEquipment()

  useEffect(() => {
    if (equipment) {
      setFormData({
        name: equipment.name,
        description: equipment.description || '',
        category: equipment.category,
        serial_number: equipment.serial_number || '',
        brand: equipment.brand || '',
        model: equipment.model || '',
        purchase_date: equipment.purchase_date || '',
        warranty_expiry: equipment.warranty_expiry || '',
        purchase_cost: equipment.purchase_cost || 0,
        current_location: equipment.current_location || '',
        status: equipment.status,
        condition: equipment.condition,
        notes: equipment.notes || ''
      })
    } else {
      setFormData({
        name: '',
        description: '',
        category: 'general',
        serial_number: '',
        brand: '',
        model: '',
        purchase_date: '',
        warranty_expiry: '',
        purchase_cost: 0,
        current_location: '',
        status: 'available',
        condition: 'good',
        notes: ''
      })
    }
  }, [equipment, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const user = await supabase.auth.getUser()
      if (!user.data.user?.user_metadata?.org_id) {
        throw new Error('No organization ID found')
      }

      if (equipment) {
        await updateEquipment.mutateAsync({ id: equipment.id, ...formData })
      } else {
        await createEquipment.mutateAsync({
          ...formData,
          org_id: user.data.user.user_metadata.org_id
        })
      }
      onSuccess()
    } catch (error) {
      console.error('Error saving equipment:', error)
    }
  }

  const categories = [
    { value: 'general', label: 'General' },
    { value: 'informática', label: 'Informática' },
    { value: 'audiovisual', label: 'Audiovisual' },
    { value: 'mobiliario', label: 'Mobiliario' },
    { value: 'oficina', label: 'Oficina' },
    { value: 'telefonía', label: 'Telefonía' },
    { value: 'red', label: 'Red' },
    { value: 'seguridad', label: 'Seguridad' }
  ]

  const statuses = [
    { value: 'available', label: 'Disponible' },
    { value: 'assigned', label: 'Asignado' },
    { value: 'maintenance', label: 'Mantenimiento' },
    { value: 'retired', label: 'Retirado' }
  ]

  const conditions = [
    { value: 'excellent', label: 'Excelente' },
    { value: 'good', label: 'Bueno' },
    { value: 'fair', label: 'Regular' },
    { value: 'poor', label: 'Deficiente' }
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {equipment ? 'Editar Equipo' : 'Nuevo Equipo'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Nombre del equipo *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                required
              />
            </div>

            <div>
              <Label htmlFor="category">Categoría</Label>
              <Select 
                value={formData.category} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(cat => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="brand">Marca</Label>
              <Input
                id="brand"
                value={formData.brand}
                onChange={(e) => setFormData(prev => ({ ...prev, brand: e.target.value }))}
              />
            </div>

            <div>
              <Label htmlFor="model">Modelo</Label>
              <Input
                id="model"
                value={formData.model}
                onChange={(e) => setFormData(prev => ({ ...prev, model: e.target.value }))}
              />
            </div>

            <div>
              <Label htmlFor="serial_number">Número de serie</Label>
              <Input
                id="serial_number"
                value={formData.serial_number}
                onChange={(e) => setFormData(prev => ({ ...prev, serial_number: e.target.value }))}
              />
            </div>

            <div>
              <Label htmlFor="current_location">Ubicación actual</Label>
              <Input
                id="current_location"
                value={formData.current_location}
                onChange={(e) => setFormData(prev => ({ ...prev, current_location: e.target.value }))}
                placeholder="Ej: Sala A, Escritorio 5"
              />
            </div>

            <div>
              <Label htmlFor="status">Estado</Label>
              <Select 
                value={formData.status} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, status: value as Equipment['status'] }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statuses.map(status => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="condition">Condición</Label>
              <Select 
                value={formData.condition} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, condition: value as Equipment['condition'] }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {conditions.map(condition => (
                    <SelectItem key={condition.value} value={condition.value}>
                      {condition.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="purchase_date">Fecha de compra</Label>
              <Input
                id="purchase_date"
                type="date"
                value={formData.purchase_date}
                onChange={(e) => setFormData(prev => ({ ...prev, purchase_date: e.target.value }))}
              />
            </div>

            <div>
              <Label htmlFor="warranty_expiry">Vencimiento garantía</Label>
              <Input
                id="warranty_expiry"
                type="date"
                value={formData.warranty_expiry}
                onChange={(e) => setFormData(prev => ({ ...prev, warranty_expiry: e.target.value }))}
              />
            </div>

            <div>
              <Label htmlFor="purchase_cost">Coste de compra (€)</Label>
              <Input
                id="purchase_cost"
                type="number"
                min="0"
                step="0.01"
                value={formData.purchase_cost}
                onChange={(e) => setFormData(prev => ({ ...prev, purchase_cost: parseFloat(e.target.value) || 0 }))}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              placeholder="Descripción del equipo, características especiales..."
            />
          </div>

          <div>
            <Label htmlFor="notes">Notas adicionales</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              rows={2}
              placeholder="Notas sobre mantenimiento, problemas conocidos, etc."
            />
          </div>

          <div className="flex gap-3 justify-end">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={createEquipment.isPending || updateEquipment.isPending}
            >
              {equipment ? 'Actualizar' : 'Registrar'} Equipo
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
