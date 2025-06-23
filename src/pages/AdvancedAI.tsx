
import React from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AIGuidedTour } from '@/components/ai/AIGuidedTour'
import { AdvancedAIToolsView } from '@/components/ai/AdvancedAIToolsView'
import { AdvancedAIWorkPanel } from '@/components/ai/AdvancedAIWorkPanel'
import { useAdvancedAIState } from '@/hooks/ai/useAdvancedAIState'
import { StandardPageContainer } from '@/components/layout/StandardPageContainer'
import { StandardPageHeader } from '@/components/layout/StandardPageHeader'
import { StandardFilters } from '@/components/layout/StandardFilters'

const AdvancedAI = () => {
  const {
    searchTerm,
    setSearchTerm,
    difficultyFilter,
    setDifficultyFilter,
    categoryFilter,
    setCategoryFilter,
    aiTools,
    filteredTools,
    categories
  } = useAdvancedAIState()

  const difficultyOptions = [
    { label: 'Todas las dificultades', value: 'all' },
    { label: 'Básico', value: 'basic' },
    { label: 'Intermedio', value: 'intermediate' },
    { label: 'Avanzado', value: 'advanced' }
  ]

  const categoryOptions = [
    { label: 'Todas las categorías', value: 'all' },
    ...categories.map(cat => ({ label: cat, value: cat }))
  ]

  const hasActiveFilters = Boolean(
    searchTerm || 
    categoryFilter !== 'all' || 
    difficultyFilter !== 'all'
  )

  const handleClearFilters = () => {
    setSearchTerm('')
    setCategoryFilter('all')
    setDifficultyFilter('all')
  }

  return (
    <StandardPageContainer>
      <StandardPageHeader
        title="IA Avanzada"
        description="Herramientas de inteligencia artificial para potenciar tu trabajo legal"
      />

      <AIGuidedTour />

      <StandardFilters
        searchPlaceholder="Buscar herramientas de IA..."
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        filters={[
          {
            placeholder: 'Categoría',
            value: categoryFilter,
            onChange: setCategoryFilter,
            options: categoryOptions
          },
          {
            placeholder: 'Dificultad',
            value: difficultyFilter,
            onChange: setDifficultyFilter,
            options: difficultyOptions
          }
        ]}
        hasActiveFilters={hasActiveFilters}
        onClearFilters={handleClearFilters}
      />

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="overview">
            Explorar Herramientas
          </TabsTrigger>
          <TabsTrigger value="tools">
            Panel de Trabajo
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <AdvancedAIToolsView filteredTools={filteredTools} />
        </TabsContent>

        <TabsContent value="tools" className="space-y-6">
          <AdvancedAIWorkPanel aiTools={aiTools} />
        </TabsContent>
      </Tabs>
    </StandardPageContainer>
  )
}

export default AdvancedAI
