import { EnhancedEmployeesManagement } from '@/components/employees/EnhancedEmployeesManagement'
import { StandardPageContainer } from '@/components/layout/StandardPageContainer'
import { StandardPageHeader } from '@/components/layout/StandardPageHeader'

export default function EmployeesPage() {
  // TODO: Get orgId from auth context
  const orgId = "temp-org-id" // Placeholder

  return (
    <StandardPageContainer>
      <StandardPageHeader 
        title="Gestión de Empleados"
        description="Administra la información y datos de todos los empleados de la organización"
      />
      
      <EnhancedEmployeesManagement orgId={orgId} />
    </StandardPageContainer>
  )
}