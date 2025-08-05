import { useState } from 'react'
import { useSimpleEmployees } from '@/hooks/useSimpleEmployees'
import { StandardPageContainer } from '@/components/layout/StandardPageContainer'
import { StandardPageHeader } from '@/components/layout/StandardPageHeader'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Plus, Users, UserCheck, UserX, Calendar } from 'lucide-react'
import { SimpleEmployeeDialog } from './SimpleEmployeeDialog'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'

interface SimpleEmployeesManagementProps {
  orgId: string
}

export function SimpleEmployeesManagement({ orgId }: SimpleEmployeesManagementProps) {
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [employeeToEdit, setEmployeeToEdit] = useState<any>(null)
  const [employeeToDelete, setEmployeeToDelete] = useState<string | null>(null)
  
  const { 
    employees, 
    isLoading, 
    isCreating,
    stats,
    createEmployee,
    updateEmployee,
    deleteEmployee
  } = useSimpleEmployees()

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
        description="Administra tu equipo y empleados"
        actions={
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Empleado
          </Button>
        }
      />

      {/* Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Empleados</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Activos</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.active}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">De Baja</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.onLeave}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inactivos</CardTitle>
            <UserX className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.inactive}</div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de empleados */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Empleados</CardTitle>
        </CardHeader>
        <CardContent>
          {employees.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No hay empleados registrados</p>
              <Button 
                onClick={() => setShowCreateDialog(true)}
                className="mt-4"
              >
                <Plus className="h-4 w-4 mr-2" />
                Agregar Primer Empleado
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Posición</TableHead>
                  <TableHead>Departamento</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Fecha Contratación</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {employees.map((employee) => (
                  <TableRow key={employee.id}>
                    <TableCell className="font-medium">{employee.name}</TableCell>
                    <TableCell>{employee.email}</TableCell>
                    <TableCell>{employee.position}</TableCell>
                    <TableCell>{employee.department || '-'}</TableCell>
                    <TableCell>{getStatusBadge(employee.status)}</TableCell>
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
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Dialogs */}
      <SimpleEmployeeDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onSubmit={handleCreateEmployee}
        isSubmitting={isCreating}
      />

      <SimpleEmployeeDialog
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