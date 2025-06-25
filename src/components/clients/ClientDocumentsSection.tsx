
import { useClientDocuments } from '@/hooks/useClientDocuments'
import { ClientDocumentsMetrics } from './documents/ClientDocumentsMetrics'
import { ClientDocumentsActions } from './documents/ClientDocumentsActions'
import { ClientDocumentsList } from './documents/ClientDocumentsList'

interface ClientDocumentsSectionProps {
  clientId: string
}

export const ClientDocumentsSection = ({ clientId }: ClientDocumentsSectionProps) => {
  const { documents, metrics, isLoading } = useClientDocuments(clientId)

  if (isLoading) {
    return <div className="animate-pulse">Cargando documentos...</div>
  }

  return (
    <div className="space-y-6">
      <ClientDocumentsMetrics 
        documents={documents} 
        totalSize={metrics.totalSize} 
      />
      
      <ClientDocumentsActions />
      
      <ClientDocumentsList documents={documents} />
    </div>
  )
}
