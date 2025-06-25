
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Folder } from 'lucide-react'
import { ClientDocumentItem } from './ClientDocumentItem'
import type { ClientDocument } from '@/hooks/useClientDocuments'

interface ClientDocumentsListProps {
  documents: ClientDocument[]
}

export const ClientDocumentsList = ({ documents }: ClientDocumentsListProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Folder className="h-5 w-5" />
          Documentos del Cliente ({documents.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {documents.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Folder className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No hay documentos para este cliente</p>
            <p className="text-sm mt-2">Los documentos aparecerán aquí cuando se suban</p>
          </div>
        ) : (
          <div className="space-y-3">
            {documents.map((doc) => (
              <ClientDocumentItem key={doc.id} document={doc} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
