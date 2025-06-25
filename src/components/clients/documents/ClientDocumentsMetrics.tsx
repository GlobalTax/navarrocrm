
import { Card, CardContent } from '@/components/ui/card'
import { FileCheck, FileText, FileX, File, Folder } from 'lucide-react'
import type { ClientDocument } from '@/hooks/useClientDocuments'

interface ClientDocumentsMetricsProps {
  documents: ClientDocument[]
  totalSize: number
}

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export const ClientDocumentsMetrics = ({ documents, totalSize }: ClientDocumentsMetricsProps) => {
  const contractsCount = documents.filter(d => d.file_name.toLowerCase().includes('contrato')).length
  const proposalsCount = documents.filter(d => d.file_name.toLowerCase().includes('propuesta')).length
  const legalCount = documents.filter(d => 
    d.file_name.toLowerCase().includes('legal') || 
    d.file_name.toLowerCase().includes('informe')
  ).length
  const generalCount = documents.filter(d => 
    !d.file_name.toLowerCase().includes('contrato') && 
    !d.file_name.toLowerCase().includes('propuesta') && 
    !d.file_name.toLowerCase().includes('legal') && 
    !d.file_name.toLowerCase().includes('informe')
  ).length

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
      <Card>
        <CardContent className="p-4 text-center">
          <div className="flex items-center justify-center mb-2">
            <FileCheck className="h-5 w-5 text-green-600" />
          </div>
          <div className="text-2xl font-bold text-green-600">{contractsCount}</div>
          <div className="text-sm text-gray-600">Contratos</div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 text-center">
          <div className="flex items-center justify-center mb-2">
            <FileText className="h-5 w-5 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-blue-600">{proposalsCount}</div>
          <div className="text-sm text-gray-600">Propuestas</div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 text-center">
          <div className="flex items-center justify-center mb-2">
            <FileX className="h-5 w-5 text-red-600" />
          </div>
          <div className="text-2xl font-bold text-red-600">{legalCount}</div>
          <div className="text-sm text-gray-600">Documentos Legales</div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 text-center">
          <div className="flex items-center justify-center mb-2">
            <File className="h-5 w-5 text-gray-600" />
          </div>
          <div className="text-2xl font-bold text-gray-600">{generalCount}</div>
          <div className="text-sm text-gray-600">Generales</div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 text-center">
          <div className="flex items-center justify-center mb-2">
            <Folder className="h-5 w-5 text-purple-600" />
          </div>
          <div className="text-2xl font-bold text-purple-600">
            {formatFileSize(totalSize)}
          </div>
          <div className="text-sm text-gray-600">Tamaño Total</div>
        </CardContent>
      </Card>
    </div>
  )
}
