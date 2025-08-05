import React, { useState } from 'react'
import { useSimpleEmployees } from '@/hooks/useSimpleEmployees'
import { StandardPageContainer } from '@/components/layout/StandardPageContainer'
import { StandardPageHeader } from '@/components/layout/StandardPageHeader'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Plus, Users, UserCheck, UserX, Calendar, Grid, List } from 'lucide-react'
import { AdvancedEmployeeDialog } from './AdvancedEmployeeDialog'
import { EmployeeFilters, EmployeeFilters as FilterType } from './EmployeeFilters'
import { EmployeeCard } from './EmployeeCard'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'

interface EnhancedEmployeesManagementProps {
  orgId: string
}

export function EnhancedEmployeesManagement({ orgId }: EnhancedEmployeesManagementProps) {
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [employeeToEdit, setEmployeeToEdit] = useState<any>(null)
  const [employeeToDelete, setEmployeeToDelete] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid')
  const [filters, setFilters] = useState<FilterType>({
    search: '',
    department: '',
    status: '',
    contract_type: '',
    position: '',
    skills: [],
    languages: [],
    education_level: '',
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
      <StandardPageContainer>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-muted-foreground">Cargando empleados...</p>
          </div>
        </div>
      </StandardPageContainer>
    )
  }

  return (
    <StandardPageContainer>
      <StandardPageHeader
        title="Gestión de Empleados"
        description="Sistema completo de gestión de recursos humanos"
        actions={
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Empleado
          </Button>
        }
      />

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

      {/* Lista de empleados */}
      <Card className="border-0.5 border-black rounded-[10px]">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Lista de Empleados</CardTitle>
            <div className="flex items-center space-x-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'table' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('table')}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
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
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {employees.map((employee) => (
                <EmployeeCard
                  key={employee.id}
                  employee={employee}
                  onEdit={setEmployeeToEdit}
                  onDelete={setEmployeeToDelete}
                />
              ))}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Empleado</TableHead>
                  <TableHead>Posición</TableHead>
                  <TableHead>Departamento</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Contrato</TableHead>
                  <TableHead>Fecha Contratación</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {employees.map((employee) => {
                  const initials = employee.name
                    .split(' ')
                    .map(n => n[0])
                    .join('')
                    .toUpperCase()
                    .slice(0, 2)

                  return (
                    <TableRow key={employee.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={employee.avatar_url} alt={employee.name} />
                            <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                              {initials}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{employee.name}</div>
                            <div className="text-sm text-muted-foreground">{employee.email}</div>
                            {employee.employee_number && (
                              <div className="text-xs text-muted-foreground">#{employee.employee_number}</div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{employee.position}</TableCell>
                      <TableCell>{employee.department || '-'}</TableCell>
                      <TableCell>{getStatusBadge(employee.status)}</TableCell>
                      <TableCell>
                        {employee.contract_type && (
                          <Badge variant="outline" className="text-xs">
                            {employee.contract_type}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>{new Date(employee.hire_date).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setEmployeeToEdit(employee)}
                          >
                            Editar
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => setEmployeeToDelete(employee.id)}
                          >
                            Eliminar
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

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
    </StandardPageContainer>
  )
}