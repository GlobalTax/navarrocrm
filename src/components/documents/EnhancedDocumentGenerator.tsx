import { useState, useMemo, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { 
  Plus, 
  FileText, 
  Bot, 
  TrendingUp, 
  Clock, 
  Star,
  Filter,
  Search,
  Grid3X3,
  List,
  Download,
  Upload,
  Settings,
  Zap
} from 'lucide-react'
import { useDocumentTemplates } from '@/hooks/useDocumentTemplates'
import { DocumentTemplateDialog } from './DocumentTemplateDialog'
import { DocumentGeneratorDialog } from './DocumentGeneratorDialog'
import { GeneratedDocumentsList } from './GeneratedDocumentsList'
import { DocumentsFilters } from './DocumentsFilters'
import { EnhancedTemplateCard } from './EnhancedTemplateCard'
import { TemplatePreviewDialog } from './TemplatePreviewDialog'
import { DocumentStats } from './DocumentStats'
import { RecentActivity } from './RecentActivity'
import { QuickActions } from './QuickActions'

export const EnhancedDocumentGenerator = () => {
  const { templates, generatedDocuments, isLoading, duplicateTemplate } = useDocumentTemplates()
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false)
  const [generatorDialogOpen, setGeneratorDialogOpen] = useState(false)
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)
  const [selectedTemplateForPreview, setSelectedTemplateForPreview] = useState<string | null>(null)
  const [editingTemplate, setEditingTemplate] = useState<any>(null)
  const [activeTab, setActiveTab] = useState('dashboard')
  
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
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase()
        const matchesName = template.name.toLowerCase().includes(searchLower)
        const matchesDescription = template.description?.toLowerCase().includes(searchLower)
        const matchesContent = template.template_content.toLowerCase().includes(searchLower)
        if (!matchesName && !matchesDescription && !matchesContent) {
          return false
        }
      }

      if (typeFilter !== 'all' && template.document_type !== typeFilter) {
        return false
      }

      if (categoryFilter !== 'all' && template.category !== categoryFilter) {
        return false
      }

      if (practiceAreaFilter !== 'all' && template.practice_area !== practiceAreaFilter) {
        return false
      }

      if (showFavorites && !favorites.has(template.id)) {
        return false
      }

      return true
    })
  }, [templates, searchTerm, typeFilter, categoryFilter, practiceAreaFilter, showFavorites, favorites])

  // Calcular estadísticas
  const stats = useMemo(() => {
    const totalTemplates = templates.length
    const aiTemplates = templates.filter(t => t.is_ai_enhanced).length
    const documentsThisMonth = generatedDocuments.filter(d => 
      new Date(d.created_at).getMonth() === new Date().getMonth()
    ).length
    const favoriteTemplates = Array.from(favorites).length

    return {
      totalTemplates,
      aiTemplates,
      documentsThisMonth,
      favoriteTemplates
    }
  }, [templates, generatedDocuments, favorites])

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
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-20 bg-muted rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header mejorado */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <FileText className="h-6 w-6 text-primary" />
            </div>
            Centro de Documentos
          </h1>
          <p className="text-muted-foreground mt-1">
            Crea, gestiona y automatiza documentos legales con IA
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Upload className="h-4 w-4" />
            Importar
          </Button>
          <Button
            onClick={() => setTemplateDialogOpen(true)}
            className="gap-2 bg-primary hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" />
            Nueva Plantilla
          </Button>
        </div>
      </div>

      {/* Tabs mejoradas */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 bg-muted/50">
          <TabsTrigger value="dashboard" className="gap-2">
            <TrendingUp className="h-4 w-4" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="templates" className="gap-2">
            <FileText className="h-4 w-4" />
            Plantillas
          </TabsTrigger>
          <TabsTrigger value="generated" className="gap-2">
            <Download className="h-4 w-4" />
            Generados
          </TabsTrigger>
          <TabsTrigger value="settings" className="gap-2">
            <Settings className="h-4 w-4" />
            Configuración
          </TabsTrigger>
        </TabsList>

        {/* Dashboard Tab */}
        <TabsContent value="dashboard" className="space-y-6">
          {/* Estadísticas */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Plantillas</p>
                    <p className="text-2xl font-bold text-foreground">{stats.totalTemplates}</p>
                  </div>
                  <FileText className="h-8 w-8 text-primary" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-purple-200/20 bg-gradient-to-br from-purple-50/50 to-purple-100/50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Con IA</p>
                    <p className="text-2xl font-bold text-foreground">{stats.aiTemplates}</p>
                  </div>
                  <Bot className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-green-200/20 bg-gradient-to-br from-green-50/50 to-green-100/50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Este Mes</p>
                    <p className="text-2xl font-bold text-foreground">{stats.documentsThisMonth}</p>
                  </div>
                  <Clock className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-amber-200/20 bg-gradient-to-br from-amber-50/50 to-amber-100/50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Favoritas</p>
                    <p className="text-2xl font-bold text-foreground">{stats.favoriteTemplates}</p>
                  </div>
                  <Star className="h-8 w-8 text-amber-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Acciones rápidas */}
          <QuickActions onCreateTemplate={() => setTemplateDialogOpen(true)} />

          {/* Actividad reciente */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <RecentActivity 
                documents={generatedDocuments.slice(0, 5)}
                onViewDocument={handleGenerateDocument}
              />
            </div>
            <div>
              <DocumentStats stats={stats} />
            </div>
          </div>
        </TabsContent>

        {/* Templates Tab */}
        <TabsContent value="templates" className="space-y-6">
          {/* Filtros mejorados */}
          <Card className="border-muted">
            <CardContent className="p-4">
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
            </CardContent>
          </Card>

          {/* Lista de plantillas mejoradas */}
          {filteredTemplates.length > 0 ? (
            <div className={
              viewMode === 'grid' 
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4" 
                : "space-y-4"
            }>
              {filteredTemplates.map((template) => (
                <EnhancedTemplateCard
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
            <Card className="border-dashed border-2 border-muted">
              <CardContent className="p-12 text-center">
                <div className="mx-auto w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                  <FileText className="h-12 w-12 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  Comienza creando plantillas
                </h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  Las plantillas te permiten generar documentos personalizados de forma rápida y consistente
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button onClick={() => setTemplateDialogOpen(true)} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Crear Primera Plantilla
                  </Button>
                  <Button variant="outline" className="gap-2">
                    <Upload className="h-4 w-4" />
                    Importar Plantillas
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <Search className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium text-foreground mb-2">
                  No se encontraron plantillas
                </h3>
                <p className="text-muted-foreground mb-4">
                  Ajusta los filtros o crea una nueva plantilla
                </p>
                <Button variant="outline" onClick={handleClearFilters}>
                  Limpiar filtros
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Generated Documents Tab */}
        <TabsContent value="generated">
          <GeneratedDocumentsList documents={generatedDocuments} />
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Configuración del Centro de Documentos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-muted-foreground">
                Configuraciones avanzadas próximamente...
              </div>
            </CardContent>
          </Card>
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