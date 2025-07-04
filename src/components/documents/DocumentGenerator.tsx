import { useState, useMemo, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Plus } from 'lucide-react'
import { useDocumentTemplates } from '@/hooks/useDocumentTemplates'
import { DocumentTemplateDialog } from './DocumentTemplateDialog'
import { DocumentGeneratorDialog } from './DocumentGeneratorDialog'
import { GeneratedDocumentsList } from './GeneratedDocumentsList'
import { DocumentsFilters } from './DocumentsFilters'
import { TemplateCard } from './TemplateCard'
import { TemplatePreviewDialog } from './TemplatePreviewDialog'

export const DocumentGenerator = () => {
  const { templates, generatedDocuments, isLoading, duplicateTemplate } = useDocumentTemplates()
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false)
  const [generatorDialogOpen, setGeneratorDialogOpen] = useState(false)
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)
  const [selectedTemplateForPreview, setSelectedTemplateForPreview] = useState<string | null>(null)
  const [editingTemplate, setEditingTemplate] = useState<any>(null)
  const [activeTab, setActiveTab] = useState('templates')
  
  // Estados para filtros
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [practiceAreaFilter, setPracticeAreaFilter] = useState('all')
  const [showFavorites, setShowFavorites] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [favorites, setFavorites] = useState<Set<string>>(new Set())

  // Cargar favoritos desde localStorage
  useEffect(() => {
    const savedFavorites = localStorage.getItem('document-template-favorites')
    if (savedFavorites) {
      try {
        const favoritesArray = JSON.parse(savedFavorites) as string[]
        setFavorites(new Set(favoritesArray))
      } catch (error) {
        console.error('Error loading favorites:', error)
      }
    }
  }, [])

  // Filtrar templates
  const filteredTemplates = useMemo(() => {
    return templates.filter(template => {
      // Filtro de búsqueda
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase()
        const matchesName = template.name.toLowerCase().includes(searchLower)
        const matchesDescription = template.description?.toLowerCase().includes(searchLower)
        const matchesContent = template.template_content.toLowerCase().includes(searchLower)
        if (!matchesName && !matchesDescription && !matchesContent) {
          return false
        }
      }

      // Filtro de tipo
      if (typeFilter !== 'all' && template.document_type !== typeFilter) {
        return false
      }

      // Filtro de categoría
      if (categoryFilter !== 'all' && template.category !== categoryFilter) {
        return false
      }

      // Filtro de área de práctica
      if (practiceAreaFilter !== 'all' && template.practice_area !== practiceAreaFilter) {
        return false
      }

      // Filtro de favoritos
      if (showFavorites && !favorites.has(template.id)) {
        return false
      }

      return true
    })
  }, [templates, searchTerm, typeFilter, categoryFilter, practiceAreaFilter, showFavorites, favorites])

  const handleGenerateDocument = (templateId: string) => {
    setSelectedTemplate(templateId)
    setGeneratorDialogOpen(true)
  }

  const handleEditTemplate = (templateId: string) => {
    const template = templates.find(t => t.id === templateId)
    if (template) {
      setEditingTemplate(template)
      setTemplateDialogOpen(true)
    }
  }

  const handleDuplicateTemplate = async (templateId: string) => {
    await duplicateTemplate.mutateAsync(templateId)
  }

  const handleToggleFavorite = (templateId: string) => {
    const newFavorites = new Set(favorites)
    if (newFavorites.has(templateId)) {
      newFavorites.delete(templateId)
    } else {
      newFavorites.add(templateId)
    }
    setFavorites(newFavorites)
    
    // Persistir favoritos en localStorage
    try {
      localStorage.setItem('document-template-favorites', JSON.stringify(Array.from(newFavorites)))
    } catch (error) {
      console.error('Error saving favorites:', error)
    }
  }

  const handlePreviewTemplate = (templateId: string) => {
    setSelectedTemplateForPreview(templateId)
    setPreviewDialogOpen(true)
  }

  const handleClearFilters = () => {
    setSearchTerm('')
    setTypeFilter('all')
    setCategoryFilter('all')
    setPracticeAreaFilter('all')
    setShowFavorites(false)
  }

  const selectedTemplateData = selectedTemplateForPreview 
    ? templates.find(t => t.id === selectedTemplateForPreview) 
    : null

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
          {/* Filtros */}
          <DocumentsFilters
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            typeFilter={typeFilter}
            onTypeFilterChange={setTypeFilter}
            categoryFilter={categoryFilter}
            onCategoryFilterChange={setCategoryFilter}
            practiceAreaFilter={practiceAreaFilter}
            onPracticeAreaFilterChange={setPracticeAreaFilter}
            showFavorites={showFavorites}
            onShowFavoritesChange={setShowFavorites}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            templates={templates}
            onClearFilters={handleClearFilters}
          />

          {/* Lista de plantillas */}
          {filteredTemplates.length > 0 ? (
            <div className={
              viewMode === 'grid' 
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" 
                : "space-y-4"
            }>
              {filteredTemplates.map((template) => (
                <TemplateCard
                  key={template.id}
                  template={template}
                  isFavorite={favorites.has(template.id)}
                  onGenerate={handleGenerateDocument}
                  onEdit={handleEditTemplate}
                  onDuplicate={handleDuplicateTemplate}
                  onToggleFavorite={handleToggleFavorite}
                  onPreview={handlePreviewTemplate}
                  viewMode={viewMode}
                />
              ))}
            </div>
          ) : templates.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Plus className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
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
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <div className="text-muted-foreground mb-4">
                  No se encontraron plantillas que coincidan con los filtros aplicados
                </div>
                <Button variant="outline" onClick={handleClearFilters}>
                  Limpiar filtros
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
        onOpenChange={(open) => {
          setTemplateDialogOpen(open)
          if (!open) {
            setEditingTemplate(null)
          }
        }}
        template={editingTemplate}
      />
      
      {selectedTemplate && (
        <DocumentGeneratorDialog
          open={generatorDialogOpen}
          onOpenChange={setGeneratorDialogOpen}
          templateId={selectedTemplate}
        />
      )}

      {/* Preview Dialog */}
      <TemplatePreviewDialog
        open={previewDialogOpen}
        onOpenChange={setPreviewDialogOpen}
        template={selectedTemplateData}
        onGenerate={handleGenerateDocument}
        onEdit={handleEditTemplate}
        onDuplicate={handleDuplicateTemplate}
      />
    </div>
  )
}