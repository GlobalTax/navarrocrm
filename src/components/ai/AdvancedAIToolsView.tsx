
import React from 'react'
import { Brain } from 'lucide-react'
import { AIToolCard } from '@/components/ai/AIToolCard'

interface AITool {
  id: string
  title: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  difficulty: 'Principiante' | 'Intermedio' | 'Avanzado'
  timeToUse: string
  usedBy: number
  category: string
  isPopular?: boolean
  component: React.ComponentType
  useCases: string[]
}

interface AdvancedAIToolsViewProps {
  filteredTools: AITool[]
}

export const AdvancedAIToolsView = React.memo<AdvancedAIToolsViewProps>(({ filteredTools }) => {
  if (filteredTools.length === 0) {
    return (
      <div className="text-center py-12">
        <Brain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron herramientas</h3>
        <p className="text-gray-600">Intenta ajustar los filtros o términos de búsqueda</p>
      </div>
    )
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {filteredTools.map((tool) => (
        <AIToolCard
          key={tool.id}
          title={tool.title}
          description={tool.description}
          icon={tool.icon}
          difficulty={tool.difficulty}
          timeToUse={tool.timeToUse}
          usedBy={tool.usedBy}
          isPopular={tool.isPopular}
        >
          <div className="space-y-3">
            <div>
              <h4 className="text-sm font-medium mb-2">Casos de uso:</h4>
              <ul className="space-y-1">
                {tool.useCases.map((useCase, index) => (
                  <li key={index} className="text-xs text-muted-foreground flex items-center gap-1">
                    <div className="w-1 h-1 bg-blue-500 rounded-full" />
                    {useCase}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </AIToolCard>
      ))}
    </div>
  )
})

AdvancedAIToolsView.displayName = 'AdvancedAIToolsView'
