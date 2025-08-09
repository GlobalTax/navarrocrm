import { useEffect, useState } from 'react'
import { EnhancedDocumentGenerator } from '@/components/documents/EnhancedDocumentGenerator'
import { StandardPageContainer } from '@/components/layout/StandardPageContainer'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { GeneratedDocumentsList } from '@/components/documents/GeneratedDocumentsList'
import { DocumentsFilters } from '@/components/documents/DocumentsFilters'
import { RecentActivity } from '@/components/documents/RecentActivity'
import { useDocumentTemplates } from '@/hooks/useDocumentTemplates'

export default function Documents() {
  const { generatedDocuments, templates } = useDocumentTemplates()

  // Filtros locales para el tab "Gestionar"
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [practiceAreaFilter, setPracticeAreaFilter] = useState('all')
  const [showFavorites, setShowFavorites] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  const handleClearFilters = () => {
    setSearchTerm('')
    setTypeFilter('all')
    setCategoryFilter('all')
    setPracticeAreaFilter('all')
    setShowFavorites(false)
    setViewMode('grid')
  }

  // SEO basics para esta ruta SPA
  useEffect(() => {
    document.title = 'Documentos | Generar, Gestionar, Actividad'
    const meta = document.querySelector('meta[name="description"]') as HTMLMetaElement | null
    if (meta) {
      meta.content = 'Documentos: generar, gestionar y revisar actividad con UI compacta y estable.'
    }
    let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null
    if (!link) {
      link = document.createElement('link')
      link.setAttribute('rel', 'canonical')
      document.head.appendChild(link)
    }
    link.setAttribute('href', window.location.href)
  }, [])

  return (
    <StandardPageContainer>
      <header className="mb-4">
        <h1 className="text-2xl font-bold">Documentos</h1>
        <p className="text-muted-foreground">Generar, gestionar y actividad</p>
      </header>

      <main>
        <Tabs defaultValue="generar" className="w-full">
          <TabsList>
            <TabsTrigger value="generar">Generar</TabsTrigger>
            <TabsTrigger value="gestionar">Gestionar</TabsTrigger>
            <TabsTrigger value="actividad">Actividad</TabsTrigger>
          </TabsList>

          <TabsContent value="generar">
            <EnhancedDocumentGenerator />
          </TabsContent>

          <TabsContent value="gestionar">
            <section className="space-y-4">
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
                templates={templates ?? []}
                onClearFilters={handleClearFilters}
              />
              <GeneratedDocumentsList documents={generatedDocuments ?? []} />
            </section>
          </TabsContent>

          <TabsContent value="actividad">
            <section>
              <RecentActivity
                documents={(generatedDocuments ?? []).slice(0, 20)}
                onViewDocument={() => {}}
              />
            </section>
          </TabsContent>
        </Tabs>
      </main>
    </StandardPageContainer>
  )
}
