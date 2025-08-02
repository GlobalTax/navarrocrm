import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Building2, 
  Users, 
  Edit, 
  Trash2, 
  MoreVertical 
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { Department } from '@/hooks/useTeams'
import { useDepartments } from '@/hooks/useDepartments'

interface DepartmentCardProps {
  department: Department
  onEdit: (department: Department) => void
  onDelete: (department: Department) => void
}

export const DepartmentCard = ({ department, onEdit, onDelete }: DepartmentCardProps) => {
  const { getDepartmentEmployeeCount } = useDepartments()
  const [employeeCount, setEmployeeCount] = useState(0)

  useEffect(() => {
    const loadEmployeeCount = async () => {
      const count = await getDepartmentEmployeeCount(department.id)
      setEmployeeCount(count)
    }
    loadEmployeeCount()
  }, [department.id, getDepartmentEmployeeCount])

  return (
    <Card className="border-0.5 border-black rounded-[10px] hover-lift transition-all duration-200">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div 
              className="w-4 h-4 rounded-full border-0.5 border-black"
              style={{ backgroundColor: department.color || '#6366f1' }}
            />
            <CardTitle className="text-lg">{department.name}</CardTitle>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-white border-0.5 border-black rounded-[10px] shadow-lg">
              <DropdownMenuItem onClick={() => onEdit(department)}>
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => onDelete(department)}
                className="text-red-600"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Desactivar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      
      <CardContent>
        {department.description && (
          <p className="text-sm text-muted-foreground mb-4">
            {department.description}
          </p>
        )}
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              {employeeCount} empleado{employeeCount !== 1 ? 's' : ''}
            </span>
          </div>
          
          <Badge 
            variant="secondary" 
            className="bg-green-100 text-green-800 border-green-200 border-0.5 rounded-[10px]"
          >
            Activo
          </Badge>
        </div>
        
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="text-xs text-muted-foreground">
            Creado: {new Date(department.created_at).toLocaleDateString('es-ES')}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}