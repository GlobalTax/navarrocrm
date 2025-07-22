
import { StandardPageContainer } from '@/components/layout/StandardPageContainer'
import { StandardPageHeader } from '@/components/layout/StandardPageHeader'
import { MainLayout } from '@/components/layout/MainLayout'
import { SecurityAuditPanel } from '@/components/security/SecurityAuditPanel'

const SecurityAudit = () => {
  return (
    <MainLayout>
      <StandardPageContainer>
        <StandardPageHeader
          title="Auditoría de Seguridad"
          description="Monitoreo y verificación del estado de seguridad del sistema"
        />
        
        <SecurityAuditPanel />
      </StandardPageContainer>
    </MainLayout>
  )
}

export default SecurityAudit
