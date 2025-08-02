import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useEmployees } from '@/hooks/useEmployees'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { useApp } from '@/contexts/AppContext'
import type { EmployeeWithContract, EmployeeFormData } from '@/types/employees'

interface EmployeeContractDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  employee: EmployeeWithContract | null
}

export const EmployeeContractDialog = ({ open, onOpenChange, employee }: EmployeeContractDialogProps) => {
  const { user } = useApp()
  const { createContract, updateContract, isCreatingContract, isUpdatingContract } = useEmployees()
  const [formData, setFormData] = useState<EmployeeFormData>({
    contract_type: 'indefinido',
    position: '',
    department_id: '',
    start_date: '',
    end_date: '',
    salary_amount: 0,
    salary_frequency: 'monthly',
    working_hours: 40,
    vacation_days: 22
  })

  // Fetch departments
  const { data: departments = [] } = useQuery({
    queryKey: ['departments', user?.org_id],
    queryFn: async () => {
      if (!user?.org_id) return []
      const { data, error } = await supabase
        .from('departments')
        .select('*')
        .eq('org_id', user.org_id)
        .eq('is_active', true)
      if (error) throw error
      return data
    },
    enabled: !!user?.org_id && open
  })

  useEffect(() => {
    if (employee?.contract) {
      setFormData({
        contract_type: employee.contract.contract_type,
        position: employee.contract.position,
        department_id: employee.contract.department_id || '',
        start_date: employee.contract.start_date,
        end_date: employee.contract.end_date || '',
        salary_amount: employee.contract.salary_amount,
        salary_frequency: employee.contract.salary_frequency,
        working_hours: employee.contract.working_hours,
        vacation_days: employee.contract.vacation_days
      })
    } else {
      setFormData({
        contract_type: 'indefinido',
        position: '',
        department_id: '',
        start_date: '',
        end_date: '',
        salary_amount: 0,
        salary_frequency: 'monthly',
        working_hours: 40,
        vacation_days: 22
      })
    }
  }, [employee, open])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!employee) return

    const submitData = {
      ...formData,
      department_id: formData.department_id || undefined,
      end_date: formData.end_date || undefined
    }

    if (employee.contract) {
      updateContract({ 
        contractId: employee.contract.id, 
        formData: submitData 
      })
    } else {
      createContract({ 
        userId: employee.id, 
        formData: submitData 
      })
    }

    onOpenChange(false)
  }

  const isLoading = isCreatingContract || isUpdatingContract

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {employee?.contract ? 'Editar Contrato' : 'Crear Contrato'} - {employee?.first_name} {employee?.last_name}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="contract_type">Tipo de Contrato</Label>
              <Select
                value={formData.contract_type}
                onValueChange={(value: any) => setFormData(prev => ({ ...prev, contract_type: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="indefinido">Indefinido</SelectItem>
                  <SelectItem value="temporal">Temporal</SelectItem>
                  <SelectItem value="practicas">Prácticas</SelectItem>
                  <SelectItem value="freelance">Freelance</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="position">Puesto</Label>
              <Input
                id="position"
                value={formData.position}
                onChange={(e) => setFormData(prev => ({ ...prev, position: e.target.value }))}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="department_id">Departamento</Label>
            <Select
              value={formData.department_id}
              onValueChange={(value) => setFormData(prev => ({ ...prev, department_id: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar departamento" />
              </SelectTrigger>
              <SelectContent>
                {departments.map(dept => (
                  <SelectItem key={dept.id} value={dept.id}>
                    {dept.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="salary_amount">Salario</Label>
              <Input
                id="salary_amount"
                type="number"
                min="0"
                step="0.01"
                value={formData.salary_amount}
                onChange={(e) => setFormData(prev => ({ ...prev, salary_amount: parseFloat(e.target.value) || 0 }))}
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

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="working_hours">Horas Semanales</Label>
              <Input
                id="working_hours"
                type="number"
                min="1"
                max="60"
                value={formData.working_hours}
                onChange={(e) => setFormData(prev => ({ ...prev, working_hours: parseInt(e.target.value) || 40 }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="vacation_days">Días de Vacaciones</Label>
              <Input
                id="vacation_days"
                type="number"
                min="0"
                max="50"
                value={formData.vacation_days}
                onChange={(e) => setFormData(prev => ({ ...prev, vacation_days: parseInt(e.target.value) || 22 }))}
                required
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Guardando...' : employee?.contract ? 'Actualizar' : 'Crear'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}