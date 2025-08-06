import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Mail, Phone, Edit, Eye, User, Building2, MapPin } from 'lucide-react'
import { SimpleEmployee } from '@/hooks/useSimpleEmployees'
import { useNavigate } from 'react-router-dom'

interface EmployeeTableProps {
  employees: SimpleEmployee[]
  onEditEmployee: (employee: SimpleEmployee) => void
}

export const EmployeeTable = ({ employees, onEditEmployee }: EmployeeTableProps) => {
  const navigate = useNavigate()

  const handleViewEmployee = (employee: SimpleEmployee) => {
    navigate(`/employees/${employee.id}`)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 border-0.5 rounded-[10px]">
            Activo
          </Badge>
        )
      case 'on_leave':
        return (
          <Badge className="bg-yellow-50 text-yellow-700 border-yellow-200 border-0.5 rounded-[10px]">
            De baja
          </Badge>
        )
      case 'inactive':
        return (
          <Badge className="bg-slate-50 text-slate-600 border-slate-200 border-0.5 rounded-[10px]">
            Inactivo
          </Badge>
        )
      default:
        return (
          <Badge variant="outline" className="border-0.5 rounded-[10px]">
            Sin estado
          </Badge>
        )
    }
  }

  const getDepartmentIcon = (department: string | null) => {
    switch (department) {
      case 'legal':
        return <Building2 className="h-4 w-4" />
      case 'finance':
        return <Building2 className="h-4 w-4" />
      case 'hr':
        return <User className="h-4 w-4" />
      default:
        return <Building2 className="h-4 w-4" />
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Empleado</TableHead>
            <TableHead>Contacto</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Departamento</TableHead>
            <TableHead>Número</TableHead>
            <TableHead>Fecha Contratación</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {employees.map((employee) => (
            <TableRow key={employee.id} className="hover:bg-muted/50">
              <TableCell>
                <div className="flex items-center space-x-3">
                  <Avatar className="w-10 h-10">
                    <AvatarFallback className="bg-muted text-foreground">
                      {getInitials(employee.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-1">
                    <div className="font-medium">{employee.name}</div>
                    {employee.position && (
                      <div className="text-sm text-muted-foreground">{employee.position}</div>
                    )}
                  </div>
                </div>
              </TableCell>
              
              <TableCell>
                <div className="space-y-1">
                  {employee.email && (
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-3 w-3 text-muted-foreground" />
                      {employee.email}
                    </div>
                  )}
                  {employee.phone && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-3 w-3 text-muted-foreground" />
                      {employee.phone}
                    </div>
                  )}
                  {!employee.email && !employee.phone && (
                    <span className="text-muted-foreground text-sm">Sin contacto</span>
                  )}
                </div>
              </TableCell>
              
              <TableCell>
                {getStatusBadge(employee.status)}
              </TableCell>
              
              <TableCell>
                <div className="flex items-center gap-2">
                  {getDepartmentIcon(employee.department)}
                  <span className="capitalize text-sm">
                    {employee.department === 'legal' && 'Legal'}
                    {employee.department === 'finance' && 'Finanzas'}
                    {employee.department === 'hr' && 'RRHH'}
                    {employee.department === 'operations' && 'Operaciones'}
                    {employee.department === 'marketing' && 'Marketing'}
                    {!employee.department && 'No asignado'}
                  </span>
                </div>
              </TableCell>
              
              <TableCell>
                {employee.employee_number ? (
                  <span className="font-mono text-sm">{employee.employee_number}</span>
                ) : (
                  <span className="text-muted-foreground">No asignado</span>
                )}
              </TableCell>
              
              <TableCell>
                <div className="text-sm">
                  {employee.hire_date 
                    ? new Date(employee.hire_date).toLocaleDateString('es-ES')
                    : 'No especificada'
                  }
                </div>
              </TableCell>
              
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-2">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleViewEmployee(employee)}
                    className="hover:bg-muted"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => onEditEmployee(employee)}
                    className="hover:bg-muted"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}