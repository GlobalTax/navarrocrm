import { useState } from 'react'
import { useEmployees } from '@/hooks/useEmployees'
import { StandardPageContainer } from '@/components/layout/StandardPageContainer'
import { StandardPageHeader } from '@/components/layout/StandardPageHeader'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Plus, Users, UserCheck, Building, Clock, Calendar } from 'lucide-react'
// TODO: Import components when implemented

interface EmployeesManagementProps {
  orgId: string
}

export function EmployeesManagement({ orgId }: EmployeesManagementProps) {
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [activeTab, setActiveTab] = useState('dashboard')
  
  const { 
    employees, 
    employeeStats, 
    employeesByType,
    isLoading,
    createEmployee,
    isCreating 
  } = useEmployees(orgId)

  const fixedEmployeesQuery = employeesByType('fixed')
  const autonomousEmployeesQuery = employeesByType('autonomous')
  const temporaryEmployeesQuery = employeesByType('temporary')

  const handleCreateEmployee = async (data: any) => {
    try {
      await createEmployee(data)
      setShowCreateDialog(false)
    } catch (error) {
      console.error('Error creating employee:', error)
    }
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

  const totalEmployees = employees.length
  const fixedEmployees = fixedEmployeesQuery.data?.data.length || 0
  const autonomousEmployees = autonomousEmployeesQuery.data?.data.length || 0
  const temporaryEmployees = temporaryEmployeesQuery.data?.data.length || 0

  return (
    <StandardPageContainer>
      <StandardPageHeader
        title="Gestión de Empleados"
        description="Administra tu equipo, contratos, salarios y asistencia"
        actions={
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Empleado
          </Button>
        }
      />

      {/* Métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Empleados</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalEmployees}</div>
            <p className="text-xs text-muted-foreground">
              Activos en la organización
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Empleados Fijos</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{fixedEmployees}</div>
            <p className="text-xs text-muted-foreground">
              Con contrato indefinido/temporal
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Colaboradores</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{autonomousEmployees}</div>
            <p className="text-xs text-muted-foreground">
              Autónomos y freelancers
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Temporales</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{temporaryEmployees}</div>
            <p className="text-xs text-muted-foreground">
              Prácticas y contratos temporales
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Contenido principal */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="employees" className="flex items-center gap-2">
            <UserCheck className="h-4 w-4" />
            Empleados
          </TabsTrigger>
          <TabsTrigger value="collaborators" className="flex items-center gap-2">
            <Building className="h-4 w-4" />
            Colaboradores
          </TabsTrigger>
          <TabsTrigger value="attendance" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Asistencia
          </TabsTrigger>
          <TabsTrigger value="leave" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Permisos
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Dashboard de Empleados</CardTitle>
              <CardDescription>Vista general del equipo</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Dashboard de empleados en desarrollo</p>
                <p className="text-sm">Se implementará en la Fase 2</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="employees" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Lista de Empleados</CardTitle>
              <CardDescription>Total: {employees.length} empleados</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <UserCheck className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Lista de empleados en desarrollo</p>
                <p className="text-sm">Se implementará en la Fase 2</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="collaborators" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Colaboradores Autónomos</CardTitle>
              <CardDescription>Gestión de freelancers y autónomos</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Building className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Gestión de colaboradores en desarrollo</p>
                <p className="text-sm">Se implementará en la Fase 2</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="attendance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Control de Asistencia</CardTitle>
              <CardDescription>
                Sistema de fichaje y control horario
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Funcionalidad de asistencia en desarrollo</p>
                <p className="text-sm">Se implementará en la siguiente fase</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="leave" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Gestión de Permisos</CardTitle>
              <CardDescription>
                Solicitudes de vacaciones y permisos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Gestión de permisos en desarrollo</p>
                <p className="text-sm">Se implementará en la siguiente fase</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* TODO: Dialog para crear empleado - implementar en Fase 2 */}
      {showCreateDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Crear Empleado</h3>
            <p className="text-muted-foreground mb-4">
              La funcionalidad de creación de empleados se implementará en la Fase 2.
            </p>
            <Button onClick={() => setShowCreateDialog(false)}>
              Cerrar
            </Button>
          </div>
        </div>
      )}
    </StandardPageContainer>
  )
}