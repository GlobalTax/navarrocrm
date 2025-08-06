import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  User, 
  Mail, 
  Phone, 
  Building, 
  Calendar, 
  DollarSign,
  Badge as BadgeIcon,
  FileText,
  Clock,
  BarChart3
} from 'lucide-react'
import type { SimpleEmployee } from '@/hooks/useSimpleEmployees'

interface EmployeeFixedDataPanelProps {
  employee: SimpleEmployee | null
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

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

export const EmployeeFixedDataPanel = ({ employee }: EmployeeFixedDataPanelProps) => {
  if (!employee) {
    return (
      <div className="h-full flex items-center justify-center">
        <Card className="w-full max-w-md mx-auto border-0.5 border-black rounded-[10px]">
          <CardContent className="text-center py-12">
            <User className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No hay empleado seleccionado
            </h3>
            <p className="text-gray-500">
              Selecciona un empleado de la lista para ver sus datos
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="h-full overflow-y-auto">
      <Card className="border-0.5 border-black rounded-[10px] mb-6">
        <CardHeader className="pb-4">
          <div className="flex items-center space-x-4">
            <Avatar className="w-12 h-12">
              <AvatarImage src={employee.avatar_url} />
              <AvatarFallback>
                {getInitials(employee.name)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-xl font-bold">
                {employee.name}
              </h2>
              <p className="text-sm text-muted-foreground">
                {employee.position} • {employee.employee_number}
              </p>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Tabs defaultValue="personal" className="w-full">
        <TabsList className="grid w-full grid-cols-7 border-0.5 border-black rounded-[10px]">
          <TabsTrigger value="personal" className="rounded-[10px]">Personal</TabsTrigger>
          <TabsTrigger value="laboral" className="rounded-[10px]">Laboral</TabsTrigger>
          <TabsTrigger value="contacto" className="rounded-[10px]">Contacto</TabsTrigger>
          <TabsTrigger value="documentos" className="rounded-[10px]">Docs</TabsTrigger>
          <TabsTrigger value="tiempo" className="rounded-[10px]">Tiempo</TabsTrigger>
          <TabsTrigger value="rendimiento" className="rounded-[10px]">Rendimiento</TabsTrigger>
          <TabsTrigger value="configuracion" className="rounded-[10px]">Config</TabsTrigger>
        </TabsList>

        <TabsContent value="personal" className="space-y-4 mt-6">
          <Card className="border-0.5 border-black rounded-[10px]">
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="h-5 w-5 mr-2" />
                Información Personal
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Nombre:</span>
                  <span className="text-sm">{employee.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Número:</span>
                  <span className="text-sm">{employee.employee_number}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Fecha Alta:</span>
                  <span className="text-sm">{formatDate(employee.hire_date)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Estado:</span>
                  <Badge className={getStatusColor(employee.status)}>
                    {employee.status}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="laboral" className="space-y-4 mt-6">
          <Card className="border-0.5 border-black rounded-[10px]">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Building className="h-5 w-5 mr-2" />
                Información Laboral
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Puesto:</span>
                  <span className="text-sm">{employee.position}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Departamento:</span>
                  <span className="text-sm">{employee.department || 'No asignado'}</span>
                </div>
                {employee.salary && (
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Salario:</span>
                    <span className="text-sm">{employee.salary.toLocaleString()}€</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contacto" className="space-y-4 mt-6">
          <Card className="border-0.5 border-black rounded-[10px]">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Mail className="h-5 w-5 mr-2" />
                Información de Contacto
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{employee.email}</span>
                </div>
                {employee.phone && (
                  <div className="flex items-center space-x-3">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{employee.phone}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documentos" className="space-y-4 mt-6">
          <Card className="border-0.5 border-black rounded-[10px]">
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                Documentos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                No hay documentos disponibles
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tiempo" className="space-y-4 mt-6">
          <Card className="border-0.5 border-black rounded-[10px]">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="h-5 w-5 mr-2" />
                Control de Tiempo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Información de tiempo no disponible
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rendimiento" className="space-y-4 mt-6">
          <Card className="border-0.5 border-black rounded-[10px]">
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="h-5 w-5 mr-2" />
                Rendimiento
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Datos de rendimiento no disponibles
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="configuracion" className="space-y-4 mt-6">
          <Card className="border-0.5 border-black rounded-[10px]">
            <CardHeader>
              <CardTitle className="flex items-center">
                <BadgeIcon className="h-5 w-5 mr-2" />
                Configuración
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Opciones de configuración no disponibles
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}