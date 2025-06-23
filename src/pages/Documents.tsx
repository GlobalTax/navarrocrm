
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { StandardPageContainer } from '@/components/layout/StandardPageContainer'
import { StandardPageHeader } from '@/components/layout/StandardPageHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  FileText, 
  Upload, 
  Search, 
  Filter,
  Download,
  Eye,
  Edit,
  Trash2,
  Folder,
  Calendar,
  User
} from 'lucide-react'
import { supabase } from '@/integrations/supabase/client'
import { useApp } from '@/contexts/AppContext'

interface Document {
  id: string
  file_name: string
  file_type: string
  file_size: number
  document_type: string
  description?: string
  created_at: string
  user_id: string
  contact_id?: string
  case_id?: string
}

const Documents = () => {
  const { user } = useApp()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedType, setSelectedType] = useState<string>('all')

  const { data: documents = [], isLoading } = useQuery({
    queryKey: ['documents', user?.org_id],
    queryFn: async () => {
      if (!user?.org_id) return []

      const { data, error } = await supabase
        .from('contact_documents')
        .select(`
          *,
          contacts:contact_id(name),
          cases:case_id(title)
        `)
        .eq('org_id', user.org_id)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching documents:', error)
        return []
      }

      return data as Document[]
    },
    enabled: !!user?.org_id
  })

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.file_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.description?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = selectedType === 'all' || doc.document_type === selectedType
    return matchesSearch && matchesType
  })

  const documentTypes = ['all', 'contract', 'proposal', 'legal', 'general']
  const getTypeColor = (type: string) => {
    const colors = {
      contract: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      proposal: 'bg-blue-50 text-blue-700 border-blue-200',
      legal: 'bg-red-50 text-red-700 border-red-200',
      general: 'bg-slate-50 text-slate-600 border-slate-200'
    }
    return colors[type as keyof typeof colors] || colors.general
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getDocumentStats = () => {
    return {
      total: documents.length,
      contracts: documents.filter(d => d.document_type === 'contract').length,
      proposals: documents.filter(d => d.document_type === 'proposal').length,
      legal: documents.filter(d => d.document_type === 'legal').length,
      general: documents.filter(d => d.document_type === 'general').length
    }
  }

  const stats = getDocumentStats()

  if (isLoading) {
    return (
      <StandardPageContainer>
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div>
        </div>
      </StandardPageContainer>
    )
  }

  return (
    <StandardPageContainer>
      <StandardPageHeader
        title="Gestión de Documentos"
        description="Administra todos los documentos del despacho"
        primaryAction={{
          label: 'Subir Documento',
          onClick: () => console.log('Upload document')
        }}
      />

      {/* Métricas principales */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <Card className="border-slate-200">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-semibold text-slate-900">{stats.total}</div>
            <div className="text-sm text-slate-600">Total</div>
          </CardContent>
        </Card>
        <Card className="border-slate-200">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-semibold text-emerald-700">{stats.contracts}</div>
            <div className="text-sm text-slate-600">Contratos</div>
          </CardContent>
        </Card>
        <Card className="border-slate-200">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-semibold text-blue-700">{stats.proposals}</div>
            <div className="text-sm text-slate-600">Propuestas</div>
          </CardContent>
        </Card>
        <Card className="border-slate-200">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-semibold text-red-700">{stats.legal}</div>
            <div className="text-sm text-slate-600">Legales</div>
          </CardContent>
        </Card>
        <Card className="border-slate-200">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-semibold text-slate-700">{stats.general}</div>
            <div className="text-sm text-slate-600">Generales</div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros y búsqueda */}
      <Card className="border-slate-200 mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Buscar documentos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-slate-300"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {documentTypes.map((type) => (
                <Button
                  key={type}
                  variant={selectedType === type ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedType(type)}
                  className={selectedType === type ? 
                    "bg-slate-900 hover:bg-slate-800" : 
                    "border-slate-300 text-slate-700 hover:bg-slate-50"
                  }
                >
                  {type === 'all' ? 'Todos' : type.charAt(0).toUpperCase() + type.slice(1)}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de documentos */}
      <Card className="border-slate-200">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-medium text-slate-900">
            Documentos ({filteredDocuments.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredDocuments.length === 0 ? (
            <div className="text-center py-12">
              <Folder className="h-12 w-12 mx-auto mb-4 text-slate-300" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">
                {searchTerm || selectedType !== 'all' ? 'No se encontraron documentos' : 'No hay documentos'}
              </h3>
              <p className="text-slate-600 mb-4">
                {searchTerm || selectedType !== 'all' ? 
                  'Intenta ajustar los filtros de búsqueda' : 
                  'Comienza subiendo tu primer documento'
                }
              </p>
              {!searchTerm && selectedType === 'all' && (
                <Button className="bg-slate-900 hover:bg-slate-800">
                  <Upload className="h-4 w-4 mr-2" />
                  Subir Documento
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredDocuments.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="p-2 bg-slate-100 rounded-lg">
                      <FileText className="h-5 w-5 text-slate-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-slate-900 truncate">{doc.file_name}</h4>
                        <Badge className={`${getTypeColor(doc.document_type)} text-xs font-medium border`}>
                          {doc.document_type}
                        </Badge>
                      </div>
                      {doc.description && (
                        <p className="text-sm text-slate-600 mb-1 line-clamp-1">{doc.description}</p>
                      )}
                      <div className="flex items-center gap-4 text-xs text-slate-500">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(doc.created_at).toLocaleDateString('es-ES')}
                        </div>
                        <span>{formatFileSize(doc.file_size)}</span>
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          Usuario
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="ghost" className="text-slate-600 hover:text-slate-900">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost" className="text-slate-600 hover:text-slate-900">
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost" className="text-slate-600 hover:text-slate-900">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost" className="text-red-600 hover:text-red-700">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </StandardPageContainer>
  )
}

export default Documents
