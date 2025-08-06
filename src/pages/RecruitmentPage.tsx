import { RecruitmentDashboard } from '@/components/recruitment/RecruitmentDashboard'
import { StandardPageContainer } from '@/components/layout/StandardPageContainer'
import { StandardPageHeader } from '@/components/layout/StandardPageHeader'

export default function RecruitmentPage() {
  return (
    <StandardPageContainer>
      <StandardPageHeader 
        title="Reclutamiento y Selección"
        description="Gestiona candidatos, entrevistas y procesos de contratación"
      />
      
      <RecruitmentDashboard />
    </StandardPageContainer>
  )
}