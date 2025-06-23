
import React from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AIGuidedTour } from '@/components/ai/AIGuidedTour'
import { AdvancedAIHeader } from '@/components/ai/AdvancedAIHeader'
import { AdvancedAIToolsView } from '@/components/ai/AdvancedAIToolsView'
import { AdvancedAIWorkPanel } from '@/components/ai/AdvancedAIWorkPanel'
import { useAdvancedAIState } from '@/hooks/ai/useAdvancedAIState'
import { Brain, Filter } from 'lucide-react'

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

  return (
    <div className="container mx-auto py-8 space-y-8">
      <AdvancedAIHeader
        toolsCount={aiTools.length}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        categoryFilter={categoryFilter}
        setCategoryFilter={setCategoryFilter}
        difficultyFilter={difficultyFilter}
        setDifficultyFilter={setDifficultyFilter}
        categories={categories}
      />

      {/* Tour guiado */}
      <AIGuidedTour />

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            Explorar Herramientas
          </TabsTrigger>
          <TabsTrigger value="tools" className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
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
    </div>
  )
}

export default AdvancedAI
