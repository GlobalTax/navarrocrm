import React, { useState } from 'react'
import { useSimpleEmployees } from '@/hooks/useSimpleEmployees'
import { StandardPageContainer } from '@/components/layout/StandardPageContainer'
import { StandardPageHeader } from '@/components/layout/StandardPageHeader'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, Users, UserCheck, UserX, Calendar } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { AdvancedEmployeeDialog } from './AdvancedEmployeeDialog'
import { EmployeeFilters, EmployeeFilters as FilterType } from './EmployeeFilters'
import { EmployeeFixedDataPanel } from './EmployeeFixedDataPanel'
import { EmployeeCompactList } from './EmployeeCompactList'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'

interface EnhancedEmployeesManagementProps {
  orgId: string
  showCreateDialog: boolean
  setShowCreateDialog: (show: boolean) => void
}

export function EnhancedEmployeesManagement({ 
  orgId, 
  showCreateDialog, 
  setShowCreateDialog 
}: EnhancedEmployeesManagementProps) {
  const [employeeToEdit, setEmployeeToEdit] = useState<any>(null)
  const [employeeToDelete, setEmployeeToDelete] = useState<string | null>(null)
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null)
  const [filters, setFilters] = useState<FilterType>({
    search: '',
    department: 'all',
    status: 'all',
    contract_type: 'all',
    position: '',
    skills: [],
    languages: [],
    education_level: 'all',
    hire_date_from: '',
    hire_date_to: ''
  })
  
  const { 
    employees, 
    allEmployees,
    isLoading, 
    isCreating,
    stats,
    createEmployee,
    updateEmployee,
    deleteEmployee,
    filterEmployees
  } = useSimpleEmployees()

  // Aplicar filtros cuando cambien
  React.useEffect(() => {
    filterEmployees(filters)
  }, [filters, allEmployees])

  const handleCreateEmployee = async (data: any) => {
    try {
      await createEmployee(data)
      setShowCreateDialog(false)
    } catch (error) {
      console.error('Error creating employee:', error)
    }
  }

  const handleUpdateEmployee = async (data: any) => {
    if (!employeeToEdit) return
    
    try {
      await updateEmployee(employeeToEdit.id, data)
      setEmployeeToEdit(null)
    } catch (error) {
      console.error('Error updating employee:', error)
    }
  }

  const handleDeleteEmployee = async () => {
    if (!employeeToDelete) return
    
    try {
      await deleteEmployee(employeeToDelete)
      setEmployeeToDelete(null)
    } catch (error) {
      console.error('Error deleting employee:', error)
    }
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      active: 'default',
      inactive: 'secondary',
      on_leave: 'outline'
    } as const

    const labels = {
      active: 'Activo',
      inactive: 'Inactivo',
      on_leave: 'De Baja'
    }

    return (
      <Badge variant={variants[status as keyof typeof variants] || 'secondary'}>
        {labels[status as keyof typeof labels] || status}
      </Badge>
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando empleados...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Métricas mejoradas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="border-0.5 border-black rounded-[10px] hover-lift transition-all duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Empleados</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold animate-fade-in">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              de {allEmployees.length} registrados
            </p>
          </CardContent>
        </Card>

        <Card className="border-0.5 border-black rounded-[10px] hover-lift transition-all duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Activos</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600 animate-fade-in">{stats.active}</div>
            <p className="text-xs text-muted-foreground">
              {stats.total > 0 ? Math.round((stats.active / stats.total) * 100) : 0}% del total
            </p>
          </CardContent>
        </Card>

        <Card className="border-0.5 border-black rounded-[10px] hover-lift transition-all duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">De Baja</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600 animate-fade-in">{stats.onLeave}</div>
            <p className="text-xs text-muted-foreground">Temporalmente ausentes</p>
          </CardContent>
        </Card>

        <Card className="border-0.5 border-black rounded-[10px] hover-lift transition-all duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inactivos</CardTitle>
            <UserX className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600 animate-fade-in">{stats.inactive}</div>
            <p className="text-xs text-muted-foreground">No trabajando</p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <EmployeeFilters
        filters={filters}
        onFiltersChange={setFilters}
        employeeCount={employees.length}
      />

      {/* Layout de 2 columnas: Lista compacta + Panel fijo */}
      <div className="grid grid-cols-12 gap-6 h-[calc(100vh-400px)]">
        {/* Panel izquierdo: Lista compacta de empleados */}
        <div className="col-span-5 space-y-4">
          <Card className="border-0.5 border-black rounded-[10px] h-full">
            <CardHeader>
              <CardTitle>
                Empleados ({employees.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="h-[calc(100%-80px)] overflow-y-auto">
              {employees.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    {allEmployees.length === 0 ? 'No hay empleados registrados' : 'No se encontraron empleados'}
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    {allEmployees.length === 0 
                      ? 'Comienza agregando tu primer empleado'
                      : 'Intenta ajustar los filtros de búsqueda'
                    }
                  </p>
                  {allEmployees.length === 0 && (
                    <Button onClick={() => setShowCreateDialog(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Agregar Primer Empleado
                    </Button>
                  )}
                </div>
              ) : (
                <EmployeeCompactList
                  employees={employees}
                  selectedEmployeeId={selectedEmployee?.id || null}
                  onSelectEmployee={setSelectedEmployee}
                  onEditEmployee={setEmployeeToEdit}
                  onDeleteEmployee={(employee) => setEmployeeToDelete(employee.id)}
                  isLoading={isLoading}
                />
              )}
            </CardContent>
          </Card>
        </div>

        {/* Panel derecho: Datos del empleado seleccionado */}
        <div className="col-span-7">
          <Card className="border-0.5 border-black rounded-[10px] h-full">
            <CardContent className="p-6 h-full">
              <EmployeeFixedDataPanel employee={selectedEmployee} />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Dialogs */}
      <AdvancedEmployeeDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onSubmit={handleCreateEmployee}
        isSubmitting={isCreating}
      />

      <AdvancedEmployeeDialog
        open={!!employeeToEdit}
        onOpenChange={(open) => !open && setEmployeeToEdit(null)}
        onSubmit={handleUpdateEmployee}
        employee={employeeToEdit}
        isSubmitting={false}
      />


      <ConfirmDialog
        open={!!employeeToDelete}
        onOpenChange={(open) => !open && setEmployeeToDelete(null)}
        onConfirm={handleDeleteEmployee}
        title="Eliminar Empleado"
        description="¿Estás seguro de que deseas eliminar este empleado? Esta acción no se puede deshacer."
        />
    </div>
  )
}