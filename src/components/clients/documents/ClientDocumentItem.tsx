
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  FileText, 
  Download, 
  Eye, 
  File,
  FileCheck,
  FileX
} from 'lucide-react'
import type { ClientDocument } from '@/hooks/useClientDocuments'

interface ClientDocumentItemProps {
  document: ClientDocument
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

export const ClientDocumentItem = ({ document }: ClientDocumentItemProps) => {
  return (
    <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-full ${getDocumentColor(document.document_type)}`}>
          {getDocumentIcon(document.document_type)}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-medium text-gray-900">{document.file_name}</h4>
            <Badge variant="outline" className="text-xs">
              {getTypeLabel(document.document_type)}
            </Badge>
          </div>
          {document.description && (
            <p className="text-sm text-gray-600 mb-1">{document.description}</p>
          )}
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <span>{formatFileSize(document.file_size)}</span>
            <span>
              {new Date(document.created_at).toLocaleDateString('es-ES', {
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
  )
}
