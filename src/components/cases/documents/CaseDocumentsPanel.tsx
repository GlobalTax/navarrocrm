import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Input } from '@/components/ui/input'
import { 
  FileText, 
  Upload, 
  Download, 
  Eye, 
  Trash2, 
  Search,
  Plus,
  File,
  Image,
  FileSpreadsheet
} from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { useApp } from '@/contexts/AppContext'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

interface CaseDocumentsPanelProps {
  caseId: string
}

interface Document {
  id: string
  file_name: string
  file_type: string
  file_size: number
  document_type: string
  description?: string
  created_at: string
  user: {
    email: string
  }
}

const getFileIcon = (fileType: string) => {
  if (fileType?.includes('image')) return Image
  if (fileType?.includes('spreadsheet') || fileType?.includes('excel')) return FileSpreadsheet
  return File
}

const getFileTypeColor = (fileType: string) => {
  if (fileType?.includes('image')) return 'text-purple-600'
  if (fileType?.includes('pdf')) return 'text-red-600'
  if (fileType?.includes('spreadsheet') || fileType?.includes('excel')) return 'text-green-600'
  if (fileType?.includes('word')) return 'text-blue-600'
  return 'text-muted-foreground'
}

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export const CaseDocumentsPanel = ({ caseId }: CaseDocumentsPanelProps) => {
  const { user } = useApp()
  const [searchTerm, setSearchTerm] = useState('')

  const { data: documents = [], isLoading, error } = useQuery({
    queryKey: ['case-documents', caseId, user?.org_id],
    queryFn: async (): Promise<Document[]> => {
      if (!caseId || !user?.org_id) return []

      // Por ahora devolvemos datos mockeados hasta que se implemente la gestión real de documentos
      // En el futuro esto se conectará con la tabla real de documentos del caso
      return []
    },
    enabled: !!caseId && !!user?.org_id,
  })

  const filteredDocuments = documents.filter(doc =>
    doc.file_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.description?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Documentos del Expediente
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-destructive">
            Error al cargar los documentos
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Documentos del Expediente
          </CardTitle>
          <Button size="sm" className="gap-2">
            <Plus className="h-4 w-4" />
            Subir Documento
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Barra de búsqueda */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar documentos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 p-4 border rounded-lg">
                <Skeleton className="w-10 h-10 rounded" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
                <Skeleton className="w-20 h-8" />
              </div>
            ))}
          </div>
        ) : filteredDocuments.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
            {documents.length === 0 ? (
              <>
                <p className="text-muted-foreground mb-4">No hay documentos para este expediente</p>
                <Button variant="outline" size="sm" className="gap-2">
                  <Upload className="h-4 w-4" />
                  Subir primer documento
                </Button>
              </>
            ) : (
              <p className="text-muted-foreground">No se encontraron documentos con ese término de búsqueda</p>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {/* Resumen de documentos */}
            <div className="flex gap-4 mb-6 p-4 bg-muted/30 rounded-lg">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{documents.length}</div>
                <div className="text-xs text-muted-foreground">Total</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-chart-1">
                  {documents.filter(d => d.file_type?.includes('pdf')).length}
                </div>
                <div className="text-xs text-muted-foreground">PDFs</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-chart-2">
                  {documents.filter(d => d.file_type?.includes('image')).length}
                </div>
                <div className="text-xs text-muted-foreground">Imágenes</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-chart-3">
                  {Math.round(documents.reduce((sum, d) => sum + d.file_size, 0) / 1024 / 1024 * 100) / 100}
                </div>
                <div className="text-xs text-muted-foreground">MB Total</div>
              </div>
            </div>

            {/* Lista de documentos */}
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {filteredDocuments.map((document) => {
                const Icon = getFileIcon(document.file_type)
                
                return (
                  <div
                    key={document.id}
                    className="flex items-center gap-3 p-4 border rounded-lg hover:bg-muted/30 transition-colors"
                  >
                    <div className={`flex-shrink-0 p-2 rounded-lg bg-muted ${getFileTypeColor(document.file_type)}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="text-sm font-medium text-foreground truncate">
                            {document.file_name}
                          </h4>
                          {document.description && (
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                              {document.description}
                            </p>
                          )}
                          <div className="flex items-center gap-3 mt-2">
                            <Badge variant="outline">
                              {document.document_type}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {formatFileSize(document.file_size)}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {format(new Date(document.created_at), 'dd MMM yyyy', { locale: es })}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              por {document.user?.email}
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-1 ml-4">
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-destructive hover:text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}