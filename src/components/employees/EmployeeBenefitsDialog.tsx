import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useEmployees } from '@/hooks/useEmployees'
import type { EmployeeWithContract, BenefitFormData } from '@/types/employees'

interface EmployeeBenefitsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  employee: EmployeeWithContract | null
}

export const EmployeeBenefitsDialog = ({ open, onOpenChange, employee }: EmployeeBenefitsDialogProps) => {
  const { createBenefit, isCreatingBenefit } = useEmployees()
  const [formData, setFormData] = useState<BenefitFormData>({
    benefit_type: 'health_insurance',
    benefit_name: '',
    benefit_value: 0,
    description: '',
    start_date: new Date().toISOString().split('T')[0],
    end_date: ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!employee?.contract) return

    createBenefit({
      userId: employee.id,
      contractId: employee.contract.id,
      formData: {
        ...formData,
        benefit_value: formData.benefit_value || undefined,
        description: formData.description || undefined,
        end_date: formData.end_date || undefined
      }
    })

    onOpenChange(false)
    setFormData({
      benefit_type: 'health_insurance',
      benefit_name: '',
      benefit_value: 0,
      description: '',
      start_date: new Date().toISOString().split('T')[0],
      end_date: ''
    })
  }

  const benefitTypeLabels = {
    health_insurance: 'Seguro Médico',
    dental: 'Seguro Dental',
    transport: 'Transporte',
    meal: 'Comida',
    phone: 'Teléfono',
    education: 'Formación',
    other: 'Otro'
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            Añadir Beneficio - {employee?.first_name} {employee?.last_name}
          </DialogTitle>
        </DialogHeader>

        {employee?.contract ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="benefit_type">Tipo de Beneficio</Label>
              <Select
                value={formData.benefit_type}
                onValueChange={(value: any) => setFormData(prev => ({ ...prev, benefit_type: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(benefitTypeLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="benefit_name">Nombre del Beneficio</Label>
              <Input
                id="benefit_name"
                value={formData.benefit_name}
                onChange={(e) => setFormData(prev => ({ ...prev, benefit_name: e.target.value }))}
                placeholder="ej. Seguro médico privado"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="benefit_value">Valor Mensual (€)</Label>
              <Input
                id="benefit_value"
                type="number"
                min="0"
                step="0.01"
                value={formData.benefit_value}
                onChange={(e) => setFormData(prev => ({ ...prev, benefit_value: parseFloat(e.target.value) || 0 }))}
                placeholder="0.00"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe los detalles del beneficio..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start_date">Fecha de Inicio</Label>
                <Input
                  id="start_date"
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="end_date">Fecha de Fin</Label>
                <Input
                  id="end_date"
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, end_date: e.target.value }))}
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isCreatingBenefit}>
                {isCreatingBenefit ? 'Guardando...' : 'Añadir Beneficio'}
              </Button>
            </div>
          </form>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              Este empleado no tiene un contrato activo. Crea un contrato primero.
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}