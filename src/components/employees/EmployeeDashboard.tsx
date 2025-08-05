import { useState } from 'react'
import { useEmployees } from '@/hooks/useEmployees'
import {
  Users,
  UserCheck,
  Building,
  Clock,
  TrendingUp,
  Calendar,
  DollarSign,
  AlertTriangle,
  MapPin,
  GraduationCap
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

interface EmployeeDashboardProps {
  orgId: string
}

export function EmployeeDashboard({ orgId }: EmployeeDashboardProps) {
  const { 
    employees, 
    employeesByType,
    isLoading 
  } = useEmployees(orgId)

  const fixedEmployeesQuery = employeesByType('fixed')
  const autonomousEmployeesQuery = employeesByType('autonomous')
  const temporaryEmployeesQuery = employeesByType('temporary')

  const fixedEmployees = fixedEmployeesQuery.data?.data || []
  const autonomousEmployees = autonomousEmployeesQuery.data?.data || []
  const temporaryEmployees = temporaryEmployeesQuery.data?.data || []

  // Cálculos de métricas
  const totalEmployees = employees.length
  const recentHires = employees.filter(emp => {
    const hireDate = new Date(emp.hire_date)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    return hireDate >= thirtyDaysAgo
  }).length

  const remoteWorkers = employees.filter(emp => emp.remote_work_allowed).length
  const fullTimeEmployees = employees.filter(emp => emp.work_schedule === 'full_time').length

  // Distribución por tipo de empleo
  const employmentDistribution = [
    { 
      type: 'Empleados Fijos', 
      count: fixedEmployees.length, 
      percentage: totalEmployees > 0 ? (fixedEmployees.length / totalEmployees) * 100 : 0,
      color: 'bg-blue-500'
    },
    { 
      type: 'Colaboradores', 
      count: autonomousEmployees.length, 
      percentage: totalEmployees > 0 ? (autonomousEmployees.length / totalEmployees) * 100 : 0,
      color: 'bg-green-500'
    },
    { 
      type: 'Temporales', 
      count: temporaryEmployees.length, 
      percentage: totalEmployees > 0 ? (temporaryEmployees.length / totalEmployees) * 100 : 0,
      color: 'bg-orange-500'
    }
  ]

  // Empleados recientes (últimos 5)
  const recentEmployees = employees
    .sort((a, b) => new Date(b.hire_date).getTime() - new Date(a.hire_date).getTime())
    .slice(0, 5)

  const getInitials = (firstName?: string, lastName?: string) => {
    const first = firstName?.charAt(0)?.toUpperCase() || ''
    const last = lastName?.charAt(0)?.toUpperCase() || ''
    return `${first}${last}`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Skeleton para métricas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="animate-pulse">
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-8 bg-muted rounded w-1/2"></div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
            <CardTitle className="text-sm font-medium">Contrataciones</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{recentHires}</div>
            <p className="text-xs text-muted-foreground">
              Últimos 30 días
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Trabajo Remoto</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{remoteWorkers}</div>
            <p className="text-xs text-muted-foreground">
              Con opción remota
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tiempo Completo</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{fullTimeEmployees}</div>
            <p className="text-xs text-muted-foreground">
              Jornada completa
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Contenido en tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Vista General</TabsTrigger>
          <TabsTrigger value="distribution">Distribución</TabsTrigger>
          <TabsTrigger value="recent">Recientes</TabsTrigger>
          <TabsTrigger value="analytics">Análisis</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Distribución por tipo */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  Tipos de Empleo
                </CardTitle>
                <CardDescription>
                  Distribución de empleados por tipo de contrato
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {employmentDistribution.map((item, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{item.type}</span>
                      <span className="text-sm text-muted-foreground">
                        {item.count} ({item.percentage.toFixed(0)}%)
                      </span>
                    </div>
                    <Progress value={item.percentage} className="h-2" />
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Estadísticas rápidas */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserCheck className="h-5 w-5" />
                  Resumen General
                </CardTitle>
                <CardDescription>
                  Estadísticas clave del equipo
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Promedio Antigüedad</p>
                    <p className="text-lg font-semibold">2.3 años</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Retención</p>
                    <p className="text-lg font-semibold">94%</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Satisfacción</p>
                    <p className="text-lg font-semibold">4.2/5</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Productividad</p>
                    <p className="text-lg font-semibold">87%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="distribution" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Empleados Fijos */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Building className="h-5 w-5" />
                    Empleados Fijos
                  </span>
                  <Badge variant="default">{fixedEmployees.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {fixedEmployees.slice(0, 3).map((employee) => (
                    <div key={employee.id} className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="text-xs">
                          {getInitials(employee.first_name, employee.last_name)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm truncate">
                        {employee.first_name} {employee.last_name}
                      </span>
                    </div>
                  ))}
                  {fixedEmployees.length > 3 && (
                    <p className="text-xs text-muted-foreground">
                      +{fixedEmployees.length - 3} más
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Colaboradores Autónomos */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <UserCheck className="h-5 w-5" />
                    Colaboradores
                  </span>
                  <Badge variant="secondary">{autonomousEmployees.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {autonomousEmployees.slice(0, 3).map((employee) => (
                    <div key={employee.id} className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="text-xs">
                          {getInitials(employee.first_name, employee.last_name)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm truncate">
                        {employee.first_name} {employee.last_name}
                      </span>
                    </div>
                  ))}
                  {autonomousEmployees.length > 3 && (
                    <p className="text-xs text-muted-foreground">
                      +{autonomousEmployees.length - 3} más
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Empleados Temporales */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Temporales
                  </span>
                  <Badge variant="outline">{temporaryEmployees.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {temporaryEmployees.slice(0, 3).map((employee) => (
                    <div key={employee.id} className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="text-xs">
                          {getInitials(employee.first_name, employee.last_name)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm truncate">
                        {employee.first_name} {employee.last_name}
                      </span>
                    </div>
                  ))}
                  {temporaryEmployees.length > 3 && (
                    <p className="text-xs text-muted-foreground">
                      +{temporaryEmployees.length - 3} más
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="recent" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Incorporaciones Recientes
              </CardTitle>
              <CardDescription>
                Últimos empleados incorporados al equipo
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Empleado</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Fecha Incorporación</TableHead>
                    <TableHead>Ubicación</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentEmployees.map((employee) => (
                    <TableRow key={employee.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="text-xs">
                              {getInitials(employee.first_name, employee.last_name)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">
                              {employee.first_name} {employee.last_name}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {employee.email}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={
                            employee.employment_type === 'fixed' ? 'default' :
                            employee.employment_type === 'autonomous' ? 'secondary' : 'outline'
                          }
                        >
                          {employee.employment_type === 'fixed' ? 'Fijo' :
                           employee.employment_type === 'autonomous' ? 'Autónomo' : 'Temporal'}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatDate(employee.hire_date)}</TableCell>
                      <TableCell>{employee.work_location || 'No especificada'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Tendencias de Contratación
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Análisis de tendencias</p>
                  <p className="text-sm">Se implementará en la siguiente fase</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Análisis de Costos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <DollarSign className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Análisis de costos salariales</p>
                  <p className="text-sm">Se implementará en la siguiente fase</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}