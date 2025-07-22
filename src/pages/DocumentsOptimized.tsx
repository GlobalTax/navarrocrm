
import { Suspense, useEffect } from 'react'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { FileText, Plus, Sparkles } from 'lucide-react'
import { DocumentGeneratorWithSuspense, DocumentAnalyzerWithSuspense, batchPreloadDocuments } from '@/components/documents/lazy/LazyDocumentComponents'
import { VirtualizedDocumentList } from '@/components/documents/optimized/VirtualizedDocumentList'
import { useDocumentMemory } from '@/hooks/documents/useDocumentMemory'
import { toast } from 'sonner'

const DocumentsOptimized = () => {
  const { trackMemoryUsage } = useDocumentMemory({
    maxMemoryMB: 150,
    cleanupThreshold: 75
  })

  // Preload componentes críticos
  useEffect(() => {
    const preload = async () => {
      try {
        await batchPreloadDocuments()
        trackMemoryUsage('component-preload')
      } catch (error) {
        console.warn('Error en preload de componentes:', error)
      }
    }
    preload()
  }, [trackMemoryUsage])

  // Mock data para testing
  const mockDocuments = [
    {
      id: '1',
      title: 'Contrato de Arrendamiento Comercial',
      document_type: 'contract' as const,
      file_size: 245760,
      created_at: '2024-01-15T10:30:00Z',
      created_by_name: 'María González',
      client_name: 'Inmobiliaria Plaza S.L.',
      status: 'final' as const,
      url: '/documents/1.pdf'
    },
    {
      id: '2',
      title: 'Comunicación con la AEAT',
      document_type: 'communication' as const,
      file_size: 89420,
      created_at: '2024-01-14T15:45:00Z',
      created_by_name: 'Carlos Ruiz',
      client_name: 'Transportes López',
      status: 'draft' as const
    },
    {
      id: '3',
      title: 'Escrito de Demanda Civil',
      document_type: 'procedural' as const,
      file_size: 512000,
      created_at: '2024-01-13T09:15:00Z',
      created_by_name: 'Ana Martín',
      client_name: 'Juan Pérez Díaz',
      status: 'final' as const,
      url: '/documents/3.pdf'
    }
  ]

  const handleViewDocument = (document: any) => {
    trackMemoryUsage('view-document')
    toast.success(`Abriendo: ${document.title}`)
  }

  const handleEditDocument = (document: any) => {
    trackMemoryUsage('edit-document')
    toast.info(`Editando: ${document.title}`)
  }

  const handleDownloadDocument = (document: any) => {
    trackMemoryUsage('download-document')
    toast.success(`Descargando: ${document.title}`)
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <FileText className="h-8 w-8 text-primary" />
            Documentos Optimizados
            <span className="text-sm bg-primary/10 text-primary px-2 py-1 rounded-full font-normal">
              v2.0
            </span>
          </h1>
          <p className="text-muted-foreground mt-2">
            Gestión inteligente de documentos con IA, virtualización y streaming
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button className="gap-2" onClick={() => trackMemoryUsage('new-document')}>
            <Plus className="h-4 w-4" />
            Nuevo Documento
          </Button>
          <Button variant="outline" className="gap-2">
            <Sparkles className="h-4 w-4" />
            Análisis IA
          </Button>
        </div>
      </div>

      {/* Tabs Principales */}
      <Tabs defaultValue="generator" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="generator" className="gap-2">
            <FileText className="h-4 w-4" />
            Generador
          </TabsTrigger>
          <TabsTrigger value="documents" className="gap-2">
            <FileText className="h-4 w-4" />
            Documentos
          </TabsTrigger>
          <TabsTrigger value="analyzer" className="gap-2">
            <Sparkles className="h-4 w-4" />
            Análisis IA
          </TabsTrigger>
          <TabsTrigger value="templates" className="gap-2">
            <FileText className="h-4 w-4" />
            Plantillas
          </TabsTrigger>
        </TabsList>

        {/* Generator Tab */}
        <TabsContent value="generator">
          <Card className="border-0.5 border-black rounded-[10px] shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Generador de Documentos IA
              </CardTitle>
              <CardDescription>
                Crea documentos legales con plantillas inteligentes y procesamiento optimizado
              </CardDescription>
            </CardHeader>
            <Suspense fallback={
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent mx-auto mb-4"></div>
                <p className="text-muted-foreground">Cargando generador optimizado...</p>
              </div>
            }>
              <DocumentGeneratorWithSuspense />
            </Suspense>
          </Card>
        </TabsContent>

        {/* Documents List Tab */}
        <TabsContent value="documents">
          <Card className="border-0.5 border-black rounded-[10px] shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Lista de Documentos Virtualizada
              </CardTitle>
              <CardDescription>
                Navegación optimizada para grandes volúmenes de documentos
              </CardDescription>
            </CardHeader>
            <VirtualizedDocumentList
              documents={mockDocuments}
              onViewDocument={handleViewDocument}
              onEditDocument={handleEditDocument}
              onDownloadDocument={handleDownloadDocument}
              height={500}
            />
          </Card>
        </TabsContent>

        {/* AI Analyzer Tab */}
        <TabsContent value="analyzer">
          <Card className="border-0.5 border-black rounded-[10px] shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                Analizador de Documentos IA
              </CardTitle>
              <CardDescription>
                Análisis inteligente con sanitización progresiva y detección de riesgos
              </CardDescription>
            </CardHeader>
            <Suspense fallback={
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent mx-auto mb-4"></div>
                <p className="text-muted-foreground">Cargando analizador IA...</p>
              </div>
            }>
              <DocumentAnalyzerWithSuspense />
            </Suspense>
          </Card>
        </TabsContent>

        {/* Templates Tab */}
        <TabsContent value="templates">
          <Card className="border-0.5 border-black rounded-[10px] shadow-sm">
            <CardHeader className="text-center py-12">
              <FileText className="h-8 w-8 text-primary mx-auto mb-4" />
              <CardTitle>Gestión de Plantillas</CardTitle>
              <CardDescription>
                Plantillas optimizadas con lazy loading. Próximamente disponible.
              </CardDescription>
            </CardHeader>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Performance Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
        <Card className="p-4">
          <div className="text-2xl font-bold text-green-600">⚡</div>
          <div className="text-sm text-muted-foreground">Lazy Loading Activo</div>
        </Card>
        <Card className="p-4">
          <div className="text-2xl font-bold text-blue-600">🧼</div>
          <div className="text-sm text-muted-foreground">Sanitización Progresiva</div>
        </Card>
        <Card className="p-4">
          <div className="text-2xl font-bold text-purple-600">📊</div>
          <div className="text-sm text-muted-foreground">Virtualización Activa</div>
        </Card>
      </div>
    </div>
  )
}

export default DocumentsOptimized
