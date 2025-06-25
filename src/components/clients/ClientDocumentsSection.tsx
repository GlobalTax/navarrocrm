
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useClientDocuments } from '@/hooks/useClientDocuments'
import { 
  FileText, 
  Download, 
  Eye, 
  File,
  FileCheck,
  FileX,
  Upload,
  Folder
} from 'lucide-react'

interface ClientDocumentsSectionProps {
  clientId: string
}

const getDocumentIcon = (type: string) => {
  switch (type) {
    case 'contract':
      return <FileCheck className="h-4 w-4" />
    case 'proposal':
      return <FileText className="h-4 w-4" />
    case 'legal':
      return <FileX className="h-4 w-4" />
    default:
      return <File className="h-4 w-4" />
  }
}

const getDocumentColor = (type: string) => {
  switch (type) {
    case 'contract':
      return 'bg-green-100 text-green-800 border-green-200'
    case 'proposal':
      return 'bg-blue-100 text-blue-800 border-blue-200'
    case 'legal':
      return 'bg-red-100 text-red-800 border-red-200'
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200'
  }
}

const getTypeLabel = (type: string) => {
  switch (type) {
    case 'contract':
      return 'Contrato'
    case 'proposal':
      return 'Propuesta'
    case 'legal':
      return 'Legal'
    case 'general':
      return 'General'
    default:
      return type
  }
}

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export const ClientDocumentsSection = ({ clientId }: ClientDocumentsSectionProps) => {
  const { documents, metrics, isLoading } = useClientDocuments(clientId)

  if (isLoading) {
    return <div className="animate-pulse">Cargando documentos...</div>
  }

  return (
    <div className="space-y-6">
      {/* Métricas Resumen */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <FileCheck className="h-5 w-5 text-green-600" />
            </div>
            <div className="text-2xl font-bold text-green-600">
              {documents.filter(d => d.file_name.toLowerCase().includes('contrato')).length}
            </div>
            <div className="text-sm text-gray-600">Contratos</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <FileText className="h-5 w-5 text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-blue-600">
              {documents.filter(d => d.file_name.toLowerCase().includes('propuesta')).length}
            </div>
            <div className="text-sm text-gray-600">Propuestas</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <FileX className="h-5 w-5 text-red-600" />
            </div>
            <div className="text-2xl font-bold text-red-600">
              {documents.filter(d => d.file_name.toLowerCase().includes('legal') || d.file_name.toLowerCase().includes('informe')).length}
            </div>
            <div className="text-sm text-gray-600">Documentos Legales</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <File className="h-5 w-5 text-gray-600" />
            </div>
            <div className="text-2xl font-bold text-gray-600">
              {documents.filter(d => !d.file_name.toLowerCase().includes('contrato') && 
                                    !d.file_name.toLowerCase().includes('propuesta') && 
                                    !d.file_name.toLowerCase().includes('legal') && 
                                    !d.file_name.toLowerCase().includes('informe')).length}
            </div>
            <div className="text-sm text-gray-600">Generales</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <Folder className="h-5 w-5 text-purple-600" />
            </div>
            <div className="text-2xl font-bold text-purple-600">
              {formatFileSize(metrics.totalSize)}
            </div>
            <div className="text-sm text-gray-600">Tamaño Total</div>
          </CardContent>
        </Card>
      </div>

      {/* Acciones Rápidas */}
      <div className="flex gap-2 flex-wrap">
        <Button size="sm" className="gap-2">
          <Upload className="h-4 w-4" />
          Subir Documento
        </Button>
        <Button size="sm" variant="outline" className="gap-2">
          <FileText className="h-4 w-4" />
          Nueva Propuesta
        </Button>
        <Button size="sm" variant="outline" className="gap-2">
          <FileCheck className="h-4 w-4" />
          Nuevo Contrato
        </Button>
      </div>

      {/* Lista de Documentos */}
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
                <div key={doc.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${getDocumentColor(doc.document_type)}`}>
                      {getDocumentIcon(doc.document_type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-gray-900">{doc.file_name}</h4>
                        <Badge variant="outline" className="text-xs">
                          {getTypeLabel(doc.document_type)}
                        </Badge>
                      </div>
                      {doc.description && (
                        <p className="text-sm text-gray-600 mb-1">{doc.description}</p>
                      )}
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>{formatFileSize(doc.file_size)}</span>
                        <span>
                          {new Date(doc.created_at).toLocaleDateString('es-ES', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline" className="gap-1">
                      <Eye className="h-3 w-3" />
                      Ver
                    </Button>
                    <Button size="sm" variant="outline" className="gap-1">
                      <Download className="h-3 w-3" />
                      Descargar
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
