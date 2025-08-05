import { useState } from 'react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import {
  MoreHorizontal,
  Edit,
  Eye,
  Trash2,
  UserCheck,
  DollarSign,
  MapPin,
  Calendar,
  Clock,
  Building2,
  Mail,
  Phone
} from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import type { EmployeeProfile } from '@/lib/dal/employee-profiles'

interface EmployeesListProps {
  employees: EmployeeProfile[]
  onRefresh: () => void
  onEditEmployee?: (employee: EmployeeProfile) => void
  onViewDetails?: (employee: EmployeeProfile) => void
  onManageSalary?: (employee: EmployeeProfile) => void
  onDeactivateEmployee?: (employee: EmployeeProfile) => void
}

export function EmployeesList({
  employees,
  onRefresh,
  onEditEmployee,
  onViewDetails,
  onManageSalary,
  onDeactivateEmployee
}: EmployeesListProps) {
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeProfile | null>(null)

  const getEmploymentTypeBadge = (type: string) => {
    const variants = {
      fixed: { variant: 'default' as const, label: 'Fijo', icon: Building2 },
      autonomous: { variant: 'secondary' as const, label: 'Autónomo', icon: UserCheck },
      temporary: { variant: 'outline' as const, label: 'Temporal', icon: Clock }
    }
    
    const config = variants[type as keyof typeof variants] || variants.fixed
    const IconComponent = config.icon
    
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <IconComponent className="h-3 w-3" />
        {config.label}
      </Badge>
    )
  }

  const getWorkScheduleBadge = (schedule: string) => {
    const variants = {
      full_time: { variant: 'default' as const, label: 'Completo' },
      part_time: { variant: 'secondary' as const, label: 'Parcial' },
      flexible: { variant: 'outline' as const, label: 'Flexible' }
    }
    
    const config = variants[schedule as keyof typeof variants] || variants.full_time
    
    return (
      <Badge variant={config.variant}>
        {config.label}
      </Badge>
    )
  }

  const getInitials = (firstName?: string, lastName?: string) => {
    const first = firstName?.charAt(0)?.toUpperCase() || ''
    const last = lastName?.charAt(0)?.toUpperCase() || ''
    return `${first}${last}`
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'No especificada'
    try {
      return format(new Date(dateString), 'dd MMM yyyy', { locale: es })
    } catch {
      return 'Fecha inválida'
    }
  }

  if (employees.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Lista de Empleados</CardTitle>
          <CardDescription>No hay empleados registrados</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <UserCheck className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No se encontraron empleados</p>
            <p className="text-sm">Comienza agregando tu primer empleado</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <UserCheck className="h-5 w-5" />
            Lista de Empleados ({employees.length})
          </span>
          <Button variant="outline" size="sm" onClick={onRefresh}>
            Actualizar
          </Button>
        </CardTitle>
        <CardDescription>
          Gestiona la información de todos los empleados de la organización
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Empleado</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Horario</TableHead>
                <TableHead>Contratación</TableHead>
                <TableHead>Ubicación</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="w-[50px]">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {employees.map((employee) => (
                <TableRow key={employee.id} className="hover:bg-muted/50">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src="" alt="" />
                        <AvatarFallback className="text-xs">
                          {getInitials(employee.first_name, employee.last_name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="font-medium truncate">
                          {employee.first_name} {employee.last_name}
                        </p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          {employee.email && (
                            <span className="flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {employee.email}
                            </span>
                          )}
                          {employee.phone && (
                            <span className="flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {employee.phone}
                            </span>
                          )}
                        </div>
                        {employee.employee_number && (
                          <p className="text-xs text-muted-foreground">
                            #{employee.employee_number}
                          </p>
                        )}
                      </div>
                    </div>
                  </TableCell>

                  <TableCell>
                    {getEmploymentTypeBadge(employee.employment_type)}
                  </TableCell>

                  <TableCell>
                    <div className="space-y-1">
                      {getWorkScheduleBadge(employee.work_schedule || 'full_time')}
                      {employee.remote_work_allowed && (
                        <Badge variant="outline" className="text-xs">
                          Remoto OK
                        </Badge>
                      )}
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="flex items-center gap-1 text-sm">
                      <Calendar className="h-3 w-3" />
                      {formatDate(employee.hire_date)}
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="flex items-center gap-1 text-sm">
                      <MapPin className="h-3 w-3" />
                      {employee.work_location || 'No especificada'}
                    </div>
                  </TableCell>

                  <TableCell>
                    <Badge variant={employee.is_active ? 'default' : 'secondary'}>
                      {employee.is_active ? 'Activo' : 'Inactivo'}
                    </Badge>
                  </TableCell>

                  <TableCell>
                    <TooltipProvider>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Abrir menú</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                          
                          <DropdownMenuItem
                            onClick={() => onViewDetails?.(employee)}
                            className="flex items-center gap-2"
                          >
                            <Eye className="h-4 w-4" />
                            Ver Detalles
                          </DropdownMenuItem>
                          
                          <DropdownMenuItem
                            onClick={() => onEditEmployee?.(employee)}
                            className="flex items-center gap-2"
                          >
                            <Edit className="h-4 w-4" />
                            Editar
                          </DropdownMenuItem>
                          
                          <DropdownMenuItem
                            onClick={() => onManageSalary?.(employee)}
                            className="flex items-center gap-2"
                          >
                            <DollarSign className="h-4 w-4" />
                            Gestionar Salario
                          </DropdownMenuItem>
                          
                          <DropdownMenuSeparator />
                          
                          <DropdownMenuItem
                            onClick={() => onDeactivateEmployee?.(employee)}
                            className="flex items-center gap-2 text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                            {employee.is_active ? 'Desactivar' : 'Reactivar'}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TooltipProvider>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}