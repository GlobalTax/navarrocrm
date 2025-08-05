import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Phone, 
  Mail, 
  MapPin,
  Calendar,
  Clock,
  GraduationCap,
  Building
} from 'lucide-react'
import { SimpleEmployee } from '@/hooks/useSimpleEmployees'

interface EmployeeCardProps {
  employee: SimpleEmployee
  onEdit: (employee: SimpleEmployee) => void
  onDelete: (employeeId: string) => void
}

export function EmployeeCard({ employee, onEdit, onDelete }: EmployeeCardProps) {
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

  const getContractBadge = (contractType?: string) => {
    if (!contractType) return null
    
    const labels = {
      indefinido: 'Indefinido',
      temporal: 'Temporal',
      practicas: 'Prácticas',
      formacion: 'Formación',
      freelance: 'Freelance'
    }

    return (
      <Badge variant="outline" className="text-xs">
        {labels[contractType as keyof typeof labels] || contractType}
      </Badge>
    )
  }

  const initials = employee.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <Card className="border-0.5 border-black rounded-[10px] hover-lift transition-all duration-200">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={employee.avatar_url} alt={employee.name} />
              <AvatarFallback className="bg-primary text-primary-foreground">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold text-lg">{employee.name}</h3>
              <p className="text-sm text-muted-foreground">{employee.position}</p>
              {employee.employee_number && (
                <p className="text-xs text-muted-foreground">#{employee.employee_number}</p>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {getStatusBadge(employee.status)}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit(employee)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Editar
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => onDelete(employee.id)}
                  className="text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Eliminar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="space-y-3">
          {/* Información de contacto */}
          <div className="flex items-center text-sm text-muted-foreground">
            <Mail className="h-4 w-4 mr-2" />
            {employee.email}
          </div>
          
          {employee.phone && (
            <div className="flex items-center text-sm text-muted-foreground">
              <Phone className="h-4 w-4 mr-2" />
              {employee.phone}
            </div>
          )}

          {/* Departamento */}
          {employee.department && (
            <div className="flex items-center text-sm text-muted-foreground">
              <Building className="h-4 w-4 mr-2" />
              {employee.department}
            </div>
          )}

          {/* Ubicación */}
          {employee.address_city && (
            <div className="flex items-center text-sm text-muted-foreground">
              <MapPin className="h-4 w-4 mr-2" />
              {employee.address_city}
              {employee.address_country && employee.address_country !== 'España' && 
                `, ${employee.address_country}`
              }
            </div>
          )}

          {/* Fecha de contratación */}
          <div className="flex items-center text-sm text-muted-foreground">
            <Calendar className="h-4 w-4 mr-2" />
            Contratado: {new Date(employee.hire_date).toLocaleDateString()}
          </div>

          {/* Horas semanales y tipo de contrato */}
          <div className="flex items-center justify-between">
            <div className="flex items-center text-sm text-muted-foreground">
              <Clock className="h-4 w-4 mr-2" />
              {employee.working_hours_per_week || 40}h/semana
            </div>
            {getContractBadge(employee.contract_type)}
          </div>

          {/* Nivel de educación */}
          {employee.education_level && (
            <div className="flex items-center text-sm text-muted-foreground">
              <GraduationCap className="h-4 w-4 mr-2" />
              {employee.education_level}
            </div>
          )}

          {/* Habilidades */}
          {employee.skills && employee.skills.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium">Habilidades:</p>
              <div className="flex flex-wrap gap-1">
                {employee.skills.slice(0, 3).map((skill) => (
                  <Badge key={skill} variant="secondary" className="text-xs">
                    {skill}
                  </Badge>
                ))}
                {employee.skills.length > 3 && (
                  <Badge variant="secondary" className="text-xs">
                    +{employee.skills.length - 3} más
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* Idiomas */}
          {employee.languages && employee.languages.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium">Idiomas:</p>
              <div className="flex flex-wrap gap-1">
                {employee.languages.map((language) => (
                  <Badge key={language} variant="outline" className="text-xs">
                    {language}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}