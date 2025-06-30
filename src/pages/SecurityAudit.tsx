
import { StandardPageContainer } from '@/components/layout/StandardPageContainer'
import { StandardPageHeader } from '@/components/layout/StandardPageHeader'
import { SecurityAuditPanel } from '@/components/security/SecurityAuditPanel'
import { Shield } from 'lucide-react'

const SecurityAudit = () => {
  return (
    <StandardPageContainer>
      <StandardPageHeader
        title="Auditoría de Seguridad"
        description="Monitoreo y verificación del estado de seguridad del sistema"
        icon={Shield}
      />
      
      <SecurityAuditPanel />
    </StandardPageContainer>
  )
}

export default SecurityAudit
