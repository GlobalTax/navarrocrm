import { EnhancedEmployeesManagement } from '@/components/employees/EnhancedEmployeesManagement'

export default function EmployeesPage() {
  // TODO: Get orgId from auth context
  const orgId = "temp-org-id" // Placeholder

  return (
    <div className="container max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Gestión de Empleados</h1>
        <p className="text-gray-600">Administra la información y datos de todos los empleados de la organización</p>
      </div>
      
      <EnhancedEmployeesManagement orgId={orgId} />
    </div>
  )
}