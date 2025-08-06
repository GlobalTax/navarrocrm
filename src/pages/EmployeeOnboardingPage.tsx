import { EmployeeOnboardingManager } from '@/components/users/EmployeeOnboardingManager'
import { StandardPageContainer } from '@/components/layout/StandardPageContainer'
import { StandardPageHeader } from '@/components/layout/StandardPageHeader'

export default function EmployeeOnboardingPage() {
  return (
    <StandardPageContainer>
      <StandardPageHeader 
        title="Onboarding de Empleados"
        description="Gestiona el proceso de incorporación de nuevos empleados"
      />
      
      <EmployeeOnboardingManager />
    </StandardPageContainer>
  )
}