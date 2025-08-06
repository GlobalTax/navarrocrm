import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import type { SimpleEmployee } from '@/hooks/useSimpleEmployees'

interface EmployeeCompactListProps {
  employees: SimpleEmployee[]
  selectedEmployeeId: string | null
  onSelectEmployee: (employee: SimpleEmployee) => void
  onEditEmployee: (employee: SimpleEmployee) => void
  onDeleteEmployee: (employee: SimpleEmployee) => void
  isLoading?: boolean
}

const getInitials = (name: string) => {
  return name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'NN'
}

const getStatusColor = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'active':
    case 'activo':
      return 'bg-green-100 text-green-800 border-green-300'
    case 'inactive':
    case 'inactivo':
      return 'bg-red-100 text-red-800 border-red-300'
    case 'on_leave':
    case 'de_baja':
      return 'bg-yellow-100 text-yellow-800 border-yellow-300'
    default:
      return 'bg-gray-100 text-gray-800 border-gray-300'
  }
}

export const EmployeeCompactList = ({
  employees,
  selectedEmployeeId,
  onSelectEmployee,
  onEditEmployee,
  onDeleteEmployee,
  isLoading = false
}: EmployeeCompactListProps) => {
  if (isLoading) {
    return (
      <div className="space-y-2">
        {[...Array(5)].map((_, i) => (
          <Card key={i} className="border-0.5 border-gray-200 rounded-[10px] animate-pulse">
            <CardContent className="p-3">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gray-200 rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (employees.length === 0) {
    return (
      <Card className="border-0.5 border-black rounded-[10px]">
        <CardContent className="p-6 text-center">
          <p className="text-gray-500">No hay empleados</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-2">
      {employees.map((employee) => (
        <Card 
          key={employee.id}
          className={`border-0.5 rounded-[10px] cursor-pointer transition-all hover-lift ${
            selectedEmployeeId === employee.id 
              ? 'border-primary bg-primary/5' 
              : 'border-black hover:border-primary'
          }`}
          onClick={() => onSelectEmployee(employee)}
        >
          <CardContent className="p-3">
            <div className="flex items-center space-x-3">
              <Avatar className="w-10 h-10">
                <AvatarImage src={employee.avatar_url} />
                <AvatarFallback className="text-xs">
                  {getInitials(employee.name)}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium truncate">
                  {employee.name}
                </h4>
                <p className="text-xs text-muted-foreground truncate">
                  {employee.position}
                </p>
                <div className="flex items-center space-x-2 mt-1">
                  <Badge 
                    className={`text-xs ${getStatusColor(employee.status)}`}
                    variant="outline"
                  >
                    {employee.status}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    #{employee.employee_number}
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-1">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 w-8 p-0"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={(e) => {
                      e.stopPropagation()
                      onEditEmployee(employee)
                    }}>
                      <Pencil className="h-4 w-4 mr-2" />
                      Editar
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={(e) => {
                        e.stopPropagation()
                        onDeleteEmployee(employee)
                      }}
                      className="text-red-600"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Eliminar
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}