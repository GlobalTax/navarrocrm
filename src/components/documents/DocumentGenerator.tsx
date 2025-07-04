import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { FileText, Plus, Settings, Bot, Gavel, MessageCircle } from 'lucide-react'
import { useDocumentTemplates } from '@/hooks/useDocumentTemplates'
import { DocumentTemplateDialog } from './DocumentTemplateDialog'
import { DocumentGeneratorDialog } from './DocumentGeneratorDialog'
import { GeneratedDocumentsList } from './GeneratedDocumentsList'

export const DocumentGenerator = () => {
  const { templates, generatedDocuments, isLoading } = useDocumentTemplates()
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false)
  const [generatorDialogOpen, setGeneratorDialogOpen] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('templates')

  const getDocumentTypeIcon = (type: string) => {
    switch (type) {
      case 'contract':
        return <FileText className="h-4 w-4" />
      case 'communication':
        return <MessageCircle className="h-4 w-4" />
      case 'procedural':
        return <Gavel className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  const getDocumentTypeLabel = (type: string) => {
    switch (type) {
      case 'contract':
        return 'Contrato'
      case 'communication':
        return 'Comunicación'
      case 'procedural':
        return 'Procesal'
      default:
        return type
    }
  }

  const getDocumentTypeColor = (type: string) => {
    switch (type) {
      case 'contract':
        return 'bg-primary/10 text-primary border-primary/20'
      case 'communication':
        return 'bg-blue-50 text-blue-700 border-blue-200'
      case 'procedural':
        return 'bg-purple-50 text-purple-700 border-purple-200'
      default:
        return 'bg-muted text-muted-foreground border-muted'
    }
  }

  const groupedTemplates = templates.reduce((acc, template) => {
    if (!acc[template.document_type]) {
      acc[template.document_type] = []
    }
    acc[template.document_type].push(template)
    return acc
  }, {} as Record<string, typeof templates>)

  const handleGenerateDocument = (templateId: string) => {
    setSelectedTemplate(templateId)
    setGeneratorDialogOpen(true)
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Cargando generador de documentos...</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Generador de Documentos</h1>
          <p className="text-muted-foreground">
            Crea y gestiona documentos legales con plantillas personalizables
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => setTemplateDialogOpen(true)}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            Nueva Plantilla
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="templates">Plantillas</TabsTrigger>
          <TabsTrigger value="generated">Documentos Generados</TabsTrigger>
        </TabsList>

        <TabsContent value="templates" className="space-y-6">
          {/* Plantillas por tipo */}
          {Object.entries(groupedTemplates).map(([type, typeTemplates]) => (
            <Card key={type}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  {getDocumentTypeIcon(type)}
                  {getDocumentTypeLabel(type)}
                  <Badge variant="secondary">{typeTemplates.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {typeTemplates.map((template) => (
                    <Card key={template.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          <div className="flex items-start justify-between">
                            <h3 className="font-medium text-foreground line-clamp-2">
                              {template.name}
                            </h3>
                            {template.is_ai_enhanced && (
                              <Bot className="h-4 w-4 text-primary flex-shrink-0" />
                            )}
                          </div>

                          {template.description && (
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {template.description}
                            </p>
                          )}

                          <div className="flex items-center gap-2">
                            <Badge className={getDocumentTypeColor(template.document_type)}>
                              {getDocumentTypeLabel(template.document_type)}
                            </Badge>
                            {template.category && (
                              <Badge variant="outline" className="text-xs">
                                {template.category}
                              </Badge>
                            )}
                          </div>

                          {template.practice_area && (
                            <p className="text-xs text-muted-foreground">
                              Área: {template.practice_area}
                            </p>
                          )}

                          <div className="flex gap-2 pt-2">
                            <Button
                              size="sm"
                              onClick={() => handleGenerateDocument(template.id)}
                              className="flex-1"
                            >
                              Generar
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                // TODO: Implementar edición de plantilla
                                console.log('Editar plantilla:', template.id)
                              }}
                            >
                              <Settings className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}

          {templates.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center">
                <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium text-foreground mb-2">
                  No hay plantillas disponibles
                </h3>
                <p className="text-muted-foreground mb-4">
                  Crea tu primera plantilla para comenzar a generar documentos
                </p>
                <Button onClick={() => setTemplateDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Crear Primera Plantilla
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="generated">
          <GeneratedDocumentsList documents={generatedDocuments} />
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <DocumentTemplateDialog
        open={templateDialogOpen}
        onOpenChange={setTemplateDialogOpen}
      />
      
      {selectedTemplate && (
        <DocumentGeneratorDialog
          open={generatorDialogOpen}
          onOpenChange={setGeneratorDialogOpen}
          templateId={selectedTemplate}
        />
      )}
    </div>
  )
}