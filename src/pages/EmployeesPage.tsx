import { EnhancedEmployeesManagement } from '@/components/employees/EnhancedEmployeesManagement'
import { StandardPageContainer } from '@/components/layout/StandardPageContainer'
import { StandardPageHeader } from '@/components/layout/StandardPageHeader'
import { useState } from 'react'

export default function EmployeesPage() {
  // TODO: Get orgId from auth context
  const orgId = "temp-org-id" // Placeholder
  const [showCreateDialog, setShowCreateDialog] = useState(false)

  return (
    <StandardPageContainer>
      <StandardPageHeader 
        title="Gestión de Empleados"
        description="Administra la información y datos de todos los empleados de la organización"
        primaryAction={{
          label: "Nuevo Empleado",
          onClick: () => setShowCreateDialog(true)
        }}
      />
      
      <EnhancedEmployeesManagement 
        orgId={orgId} 
        showCreateDialog={showCreateDialog}
        setShowCreateDialog={setShowCreateDialog}
      />
    </StandardPageContainer>
  )
}