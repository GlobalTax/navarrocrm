import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DocumentsList } from '../components/DocumentsList'
import { DocumentFilters } from '../components/DocumentFilters'
import { DocumentGeneratorDialog } from '../components/DocumentGeneratorDialog'
import { useDocumentsList } from '../hooks'

export default function DocumentsPage() {
  const [isGeneratorOpen, setIsGeneratorOpen] = useState(false)
  const { documents, isLoading } = useDocumentsList()

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Documentos</h1>
          <p className="text-muted-foreground">
            Gestiona tus documentos y plantillas
          </p>
        </div>
        <Button 
          onClick={() => setIsGeneratorOpen(true)}
          className="border-0.5 border-black rounded-[10px]"
        >
          <Plus className="h-4 w-4 mr-2" />
          Generar Documento
        </Button>
      </div>

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