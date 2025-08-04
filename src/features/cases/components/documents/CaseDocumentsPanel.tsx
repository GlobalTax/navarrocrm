import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { FileText, Download, Eye, MoreHorizontal } from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'

interface CaseDocumentsPanelProps {
  caseId: string
}

export function CaseDocumentsPanel({ caseId }: CaseDocumentsPanelProps) {
  const mockDocuments = [
    {
      id: '1',
      name: 'Contrato inicial.pdf',
      type: 'pdf',
      size: '2.4 MB',
      uploadedAt: '2024-01-15',
      uploadedBy: 'Juan Pérez'
    },
    {
      id: '2',
      name: 'Informe pericial.docx',
      type: 'docx', 
      size: '1.2 MB',
      uploadedAt: '2024-01-18',
      uploadedBy: 'María García'
    }
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Documentos del Expediente
          <Button size="sm">
            Subir documento
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {mockDocuments.map((doc) => (
            <div key={doc.id} className="flex items-center gap-4 p-4 border rounded-lg">
              <FileText className="h-8 w-8 text-blue-600" />
              <div className="flex-1">
                <h4 className="font-medium">{doc.name}</h4>
                <p className="text-sm text-muted-foreground">
                  {doc.size} • Subido por {doc.uploadedBy} el {new Date(doc.uploadedAt).toLocaleDateString('es-ES')}
                </p>
              </div>
              <Badge variant="outline">{doc.type.toUpperCase()}</Badge>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    <Eye className="h-4 w-4 mr-2" />
                    Ver
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Download className="h-4 w-4 mr-2" />
                    Descargar
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ))}
        </div>
        
        {mockDocuments.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No hay documentos subidos para este expediente.
          </div>
        )}
      </CardContent>
    </Card>
  )
}