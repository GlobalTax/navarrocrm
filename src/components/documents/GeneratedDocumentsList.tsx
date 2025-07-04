import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { 
  FileText, 
  MoreHorizontal, 
  Download, 
  Send, 
  Eye, 
  Edit, 
  Trash2,
  Search,
  Filter,
  Calendar
} from 'lucide-react'
import { useDocumentTemplates, type GeneratedDocument } from '@/hooks/useDocumentTemplates'

interface GeneratedDocumentsListProps {
  documents: GeneratedDocument[]
}

export const GeneratedDocumentsList = ({ documents }: GeneratedDocumentsListProps) => {
  const { updateDocumentStatus } = useDocumentTemplates()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'bg-orange-50 text-orange-700 border-orange-200'
      case 'finalized':
        return 'bg-green-50 text-green-700 border-green-200'
      case 'sent':
        return 'bg-blue-50 text-blue-700 border-blue-200'
      default:
        return 'bg-muted text-muted-foreground border-muted'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'draft':
        return 'Borrador'
      case 'finalized':
        return 'Finalizado'
      case 'sent':
        return 'Enviado'
      default:
        return status
    }
  }

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || doc.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const handleStatusChange = async (documentId: string, newStatus: 'draft' | 'finalized' | 'sent') => {
    await updateDocumentStatus.mutateAsync({ id: documentId, status: newStatus })
  }

  const handleDownload = (document: GeneratedDocument) => {
    // TODO: Implementar generación y descarga de PDF
    console.log('Downloading document:', document.id)
  }

  const handleSendEmail = (document: GeneratedDocument) => {
    // TODO: Implementar envío por email
    console.log('Sending document:', document.id)
  }

  const handleView = (document: GeneratedDocument) => {
    // TODO: Implementar vista completa del documento
    console.log('Viewing document:', document.id)
  }

  const handleEdit = (document: GeneratedDocument) => {
    // TODO: Implementar edición del documento
    console.log('Editing document:', document.id)
  }

  const handleDelete = (document: GeneratedDocument) => {
    // TODO: Implementar eliminación del documento
    console.log('Deleting document:', document.id)
  }

  if (documents.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-medium text-foreground mb-2">
            No hay documentos generados
          </h3>
          <p className="text-muted-foreground">
            Los documentos que generes aparecerán aquí
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Filtros */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar documentos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Filtrar por estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                  <SelectItem value="draft">Borradores</SelectItem>
                  <SelectItem value="finalized">Finalizados</SelectItem>
                  <SelectItem value="sent">Enviados</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de documentos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Documentos Generados ({filteredDocuments.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredDocuments.map((document) => (
              <div
                key={document.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className="p-2 bg-muted rounded-lg">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-foreground truncate">
                        {document.title}
                      </h4>
                      <Badge className={`${getStatusColor(document.status)} text-xs font-medium border`}>
                        {getStatusLabel(document.status)}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Creado: {new Date(document.created_at).toLocaleDateString('es-ES')}
                      </div>
                      {document.updated_at !== document.created_at && (
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Actualizado: {new Date(document.updated_at).toLocaleDateString('es-ES')}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {/* Botones de acción rápida */}
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleView(document)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDownload(document)}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                  
                  {document.status !== 'sent' && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleSendEmail(document)}
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  )}

                  {/* Menú de opciones */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button size="sm" variant="ghost">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEdit(document)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Editar
                      </DropdownMenuItem>
                      
                      {document.status === 'draft' && (
                        <DropdownMenuItem onClick={() => handleStatusChange(document.id, 'finalized')}>
                          <FileText className="h-4 w-4 mr-2" />
                          Finalizar
                        </DropdownMenuItem>
                      )}
                      
                      {document.status === 'finalized' && (
                        <DropdownMenuItem onClick={() => handleStatusChange(document.id, 'sent')}>
                          <Send className="h-4 w-4 mr-2" />
                          Marcar como Enviado
                        </DropdownMenuItem>
                      )}
                      
                      <DropdownMenuItem 
                        onClick={() => handleDelete(document)}
                        className="text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Eliminar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}