import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useEmployees } from '@/hooks/useEmployees'
import type { EmployeeWithContract, SalaryFormData } from '@/types/employees'

interface EmployeeSalaryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  employee: EmployeeWithContract | null
}

export const EmployeeSalaryDialog = ({ open, onOpenChange, employee }: EmployeeSalaryDialogProps) => {
  const { createSalary, isCreatingSalary } = useEmployees()
  const [formData, setFormData] = useState<SalaryFormData>({
    new_salary: 0,
    salary_frequency: 'monthly',
    change_type: 'increase',
    change_reason: '',
    effective_date: new Date().toISOString().split('T')[0]
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!employee?.contract) return

    createSalary({
      userId: employee.id,
      contractId: employee.contract.id,
      formData: {
        ...formData,
        change_reason: formData.change_reason || undefined
      }
    })

    onOpenChange(false)
    setFormData({
      new_salary: 0,
      salary_frequency: 'monthly',
      change_type: 'increase',
      change_reason: '',
      effective_date: new Date().toISOString().split('T')[0]
    })
  }

  const currentSalary = employee?.contract?.salary_amount || 0
  const salaryDifference = formData.new_salary - currentSalary
  const percentageChange = currentSalary > 0 ? ((salaryDifference / currentSalary) * 100) : 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            Gestionar Salario - {employee?.first_name} {employee?.last_name}
          </DialogTitle>
        </DialogHeader>

        {employee?.contract ? (
          <>
            <div className="bg-muted p-4 rounded-lg mb-4">
              <p className="text-sm text-muted-foreground">Salario Actual</p>
              <p className="text-2xl font-bold">
                {new Intl.NumberFormat('es-ES', {
                  style: 'currency',
                  currency: 'EUR'
                }).format(currentSalary)}
                <span className="text-sm font-normal">
                  {employee.contract.salary_frequency === 'monthly' ? '/mes' : '/año'}
                </span>
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="new_salary">Nuevo Salario</Label>
                  <Input
                    id="new_salary"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.new_salary}
                    onChange={(e) => setFormData(prev => ({ ...prev, new_salary: parseFloat(e.target.value) || 0 }))}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="salary_frequency">Frecuencia</Label>
                  <Select
                    value={formData.salary_frequency}
                    onValueChange={(value: any) => setFormData(prev => ({ ...prev, salary_frequency: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monthly">Mensual</SelectItem>
                      <SelectItem value="yearly">Anual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="change_type">Tipo de Cambio</Label>
                <Select
                  value={formData.change_type}
                  onValueChange={(value: any) => setFormData(prev => ({ ...prev, change_type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="increase">Aumento</SelectItem>
                    <SelectItem value="decrease">Reducción</SelectItem>
                    <SelectItem value="bonus">Bonus</SelectItem>
                    <SelectItem value="adjustment">Ajuste</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="effective_date">Fecha Efectiva</Label>
                <Input
                  id="effective_date"
                  type="date"
                  value={formData.effective_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, effective_date: e.target.value }))}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="change_reason">Motivo del Cambio</Label>
                <Textarea
                  id="change_reason"
                  value={formData.change_reason}
                  onChange={(e) => setFormData(prev => ({ ...prev, change_reason: e.target.value }))}
                  placeholder="Describe el motivo del cambio salarial..."
                  rows={3}
                />
              </div>

              {formData.new_salary > 0 && salaryDifference !== 0 && (
                <div className={`p-3 rounded-lg ${salaryDifference > 0 ? 'bg-green-50' : 'bg-red-50'}`}>
                  <p className="text-sm font-medium">
                    Cambio: {salaryDifference > 0 ? '+' : ''}
                    {new Intl.NumberFormat('es-ES', {
                      style: 'currency',
                      currency: 'EUR'
                    }).format(salaryDifference)}
                    {' '}({percentageChange > 0 ? '+' : ''}{percentageChange.toFixed(1)}%)
                  </p>
                </div>
              )}

              <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={isCreatingSalary}>
                  {isCreatingSalary ? 'Guardando...' : 'Actualizar Salario'}
                </Button>
              </div>
            </form>
          </>
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