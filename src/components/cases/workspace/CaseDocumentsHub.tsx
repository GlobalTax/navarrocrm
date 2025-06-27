
import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { FileText, Upload, Download, Eye, Plus, Folder } from 'lucide-react'
import { Case } from '@/hooks/useCases'

interface CaseDocumentsHubProps {
  case_: Case
}

interface Document {
  id: string
  name: string
  type: string
  size: string
  uploadDate: string
  category: string
  phase?: string
  version: number
  uploadedBy: string
  tags: string[]
}

export function CaseDocumentsHub({ case_ }: CaseDocumentsHubProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  
  const [documents] = useState<Document[]>([
    {
      id: '1',
      name: 'Contrato_Principal_v2.pdf',
      type: 'pdf',
      size: '2.4 MB',
      uploadDate: '2024-01-15',
      category: 'Contratos',
      phase: 'Investigación',
      version: 2,
      uploadedBy: 'Ana García',
      tags: ['contrato', 'principal', 'firmado']
    },
    {
      id: '2',
      name: 'Propuesta_Inicial.docx',
      type: 'docx',
      size: '856 KB',
      uploadDate: '2024-01-16',
      category: 'Propuestas',
      phase: 'Documentación',
      version: 1,
      uploadedBy: 'Carlos López',
      tags: ['propuesta', 'borrador']
    },
    {
      id: '3',
      name: 'Evidencia_Comunicaciones.zip',
      type: 'zip',
      size: '15.2 MB',
      uploadDate: '2024-01-17',
      category: 'Evidencias',
      phase: 'Investigación',
      version: 1,
      uploadedBy: 'Ana García',
      tags: ['emails', 'evidencia', 'comunicaciones']
    }
  ])

  const categories = [
    'all',
    'Contratos',
    'Propuestas',
    'Evidencias',
    'Dictámenes',
    'Correspondencia'
  ]

  const filteredDocuments = selectedCategory === 'all' 
    ? documents 
    : documents.filter(doc => doc.category === selectedCategory)

  const getFileIcon = (type: string) => {
    return <FileText className="h-5 w-5 text-blue-500" />
  }

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'Contratos': 'bg-blue-100 text-blue-800',
      'Propuestas': 'bg-green-100 text-green-800',
      'Evidencias': 'bg-yellow-100 text-yellow-800',
      'Dictámenes': 'bg-purple-100 text-purple-800',
      'Correspondencia': 'bg-pink-100 text-pink-800'
    }
    return colors[category] || 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="space-y-6">
      {/* Header con acciones */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Centro de Documentos</h2>
        <div className="flex items-center gap-3">
          <Button variant="outline">
            <Folder className="h-4 w-4 mr-2" />
            Crear Carpeta
          </Button>
          <Button>
            <Upload className="h-4 w-4 mr-2" />
            Subir Documento
          </Button>
        </div>
      </div>

      {/* Filtros por categoría */}
      <div className="flex gap-2">
        {categories.map((category) => (
          <Button
            key={category}
            variant={selectedCategory === category ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory(category)}
          >
            {category === 'all' ? 'Todos' : category}
            {category !== 'all' && (
              <Badge variant="secondary" className="ml-2">
                {documents.filter(doc => doc.category === category).length}
              </Badge>
            )}
          </Button>
        ))}
      </div>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">
              {documents.length}
            </div>
            <div className="text-sm text-gray-600">Total Documentos</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {documents.filter(d => d.version > 1).length}
            </div>
            <div className="text-sm text-gray-600">Con Versiones</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">
              {new Set(documents.map(d => d.category)).size}
            </div>
            <div className="text-sm text-gray-600">Categorías</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">
              {documents.reduce((sum, doc) => {
                const size = parseFloat(doc.size.replace(/[^\d.]/g, ''))
                return sum + (doc.size.includes('MB') ? size : size / 1000)
              }, 0).toFixed(1)} MB
            </div>
            <div className="text-sm text-gray-600">Tamaño Total</div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de documentos */}
      <Card>
        <CardHeader>
          <CardTitle>
            Documentos 
            <Badge variant="outline" className="ml-2">
              {filteredDocuments.length}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredDocuments.map((document) => (
              <div key={document.id} className="flex items-center gap-4 p-4 border rounded-lg hover:bg-gray-50">
                <div className="flex items-center gap-3">
                  {getFileIcon(document.type)}
                  <div>
                    <h4 className="font-medium">{document.name}</h4>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <span>{document.size}</span>
                      <span>•</span>
                      <span>v{document.version}</span>
                      <span>•</span>
                      <span>{new Date(document.uploadDate).toLocaleDateString()}</span>
                      <span>•</span>
                      <span>Por {document.uploadedBy}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex-1 flex items-center gap-2">
                  <Badge className={getCategoryColor(document.category)}>
                    {document.category}
                  </Badge>
                  {document.phase && (
                    <Badge variant="outline">
                      {document.phase}
                    </Badge>
                  )}
                  {document.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
                
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm">
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
