import { useParams } from 'react-router-dom'
import { DetailPageHeader } from '@/components/layout/DetailPageHeader'
import { EmployeeFixedDataPanel } from '@/components/employees/EmployeeFixedDataPanel'
import { useSimpleEmployees } from '@/hooks/useSimpleEmployees'
import { Card, CardContent } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle } from 'lucide-react'

export default function EmployeeDetailPage() {
  const { id } = useParams<{ id: string }>()
  // TODO: Get orgId from auth context
  const orgId = "temp-org-id" // Placeholder
  
  const { employees, isLoading } = useSimpleEmployees()
  
  const employee = employees.find(emp => emp.id === id)

  const breadcrumbItems = [
    { label: 'Empleados', href: '/employees' },
    { label: employee?.name || 'Empleado', href: undefined }
  ]

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <DetailPageHeader
          title="Cargando..."
          breadcrumbItems={breadcrumbItems}
          backUrl="/employees"
        />
        <div className="max-w-7xl mx-auto px-6 py-8">
          <Card className="border-0.5 border-black rounded-[10px]">
            <CardContent className="p-12 flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (!employee) {
    return (
      <div className="min-h-screen bg-background">
        <DetailPageHeader
          title="Empleado no encontrado"
          breadcrumbItems={breadcrumbItems}
          backUrl="/employees"
        />
        <div className="max-w-7xl mx-auto px-6 py-8">
          <Alert className="border-destructive/20 border-0.5 rounded-[10px]">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              No se pudo encontrar el empleado solicitado. Es posible que haya sido eliminado o que no tengas permisos para verlo.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <DetailPageHeader
        title={employee.name}
        subtitle={employee.position || 'Sin posición asignada'}
        breadcrumbItems={breadcrumbItems}
        backUrl="/employees"
      />
      
      <div className="max-w-7xl mx-auto px-6 py-8">
        <Card className="border-0.5 border-black rounded-[10px]">
          <CardContent className="p-6">
            <EmployeeFixedDataPanel employee={employee} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}