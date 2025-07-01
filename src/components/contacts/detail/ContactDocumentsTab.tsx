
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { FileText, Upload, Download, Eye, Trash2, File, FileImage, Archive } from 'lucide-react'
import { useClientDocuments } from '@/hooks/useClientDocuments'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

interface ContactDocumentsTabProps {
  contactId: string
}

export const ContactDocumentsTab = ({ contactId }: ContactDocumentsTabProps) => {
  const { documents, isLoading, metrics } = useClientDocuments(contactId)

  const getFileIcon = (fileType: string) => {
    if (fileType?.startsWith('image/')) return <FileImage className="h-4 w-4" />
    if (fileType?.includes('pdf')) return <File className="h-4 w-4" />
    if (fileType?.includes('zip') || fileType?.includes('rar')) return <Archive className="h-4 w-4" />
    return <FileText className="h-4 w-4" />
  }

  const getDocumentTypeColor = (type: string) => {
    switch (type) {
      case 'contract':
        return 'bg-green-100 text-green-800'
      case 'proposal':
        return 'bg-blue-100 text-blue-800'
      case 'legal':
        return 'bg-purple-100 text-purple-800'
      case 'general':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getDocumentTypeLabel = (type: string) => {
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
        return 'Documento'
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Documentos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center py-8">
            <div className="text-gray-500">Cargando documentos...</div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Métricas de documentos */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-500">Total</p>
              <p className="text-2xl font-bold">{metrics.totalDocuments}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-500">Contratos</p>
              <p className="text-2xl font-bold text-green-600">{metrics.contractsCount}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-500">Propuestas</p>
              <p className="text-2xl font-bold text-blue-600">{metrics.proposalsCount}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-500">Legales</p>
              <p className="text-2xl font-bold text-purple-600">{metrics.legalCount}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-500">Tamaño</p>
              <p className="text-lg font-bold">{formatFileSize(metrics.totalSize)}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de documentos */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Documentos ({documents.length})
            </CardTitle>
            <Button size="sm">
              <Upload className="h-4 w-4 mr-2" />
              Subir Documento
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {documents.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No hay documentos subidos para este contacto</p>
              <Button className="mt-4" variant="outline">
                <Upload className="h-4 w-4 mr-2" />
                Subir primer documento
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {documents.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-100 rounded">
                      {getFileIcon(doc.file_type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{doc.file_name}</h4>
                        <Badge className={getDocumentTypeColor(doc.document_type)}>
                          {getDocumentTypeLabel(doc.document_type)}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                        <span>{formatFileSize(doc.file_size)}</span>
                        <span>
                          {format(new Date(doc.created_at), 'dd/MM/yyyy', { locale: es })}
                        </span>
                      </div>
                      {doc.description && (
                        <p className="text-sm text-gray-600 mt-1">{doc.description}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700">
                      <Trash2 className="h-4 w-4" />
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
