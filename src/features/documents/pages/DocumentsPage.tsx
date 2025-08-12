import { useEffect, useState } from 'react'
import { StandardPageHeader } from '@/components/layout/StandardPageHeader'
import { DocumentsList } from '../components/DocumentsList'
import { DocumentFilters } from '../components/DocumentFilters'
import { DocumentGeneratorDialog } from '../components/DocumentGeneratorDialog'
import { useDocumentsList } from '../hooks'

export default function DocumentsPage() {
  const [isGeneratorOpen, setIsGeneratorOpen] = useState(false)
  const { documents, isLoading } = useDocumentsList()
  useEffect(() => {
    document.title = 'Documentos | CRM';
  }, [])

  return (
    <div className="space-y-6">
        <StandardPageHeader
          title="Documentos"
          description="Gestiona tus documentos y plantillas"
          primaryAction={{
            label: "Generar Documento",
            onClick: () => setIsGeneratorOpen(true)
          }}
        />

      <DocumentFilters />
      
      <DocumentsList 
        documents={documents} 
        isLoading={isLoading}
      />

      <DocumentGeneratorDialog
        open={isGeneratorOpen}
        onClose={() => setIsGeneratorOpen(false)}
      />
    </div>
  )
}