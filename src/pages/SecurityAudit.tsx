
import { SecurityAuditPanel } from '@/components/security/SecurityAuditPanel'
import { StandardPageContainer } from '@/components/layout/StandardPageContainer'
import { StandardPageHeader } from '@/components/layout/StandardPageHeader'

export default function SecurityAudit() {
  return (
    <div className="min-h-screen bg-gray-50">
      <StandardPageHeader
        title="Auditoría de Seguridad"
        description="Monitoreo y gestión de la seguridad del sistema"
      />
      
      <StandardPageContainer>
        <SecurityAuditPanel />
      </StandardPageContainer>
    </div>
  )
}
