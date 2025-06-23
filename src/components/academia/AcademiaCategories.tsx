
import React from 'react'
import { 
  Users, FolderOpen, CheckSquare, Calendar, Clock, FileText, 
  Repeat, Zap, Brain, Settings, ChevronRight 
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Badge } from '@/components/ui/badge'

interface AcademiaCategoriesProps {
  selectedCategory: string | null
  onCategorySelect: (category: string) => void
  onTopicSelect: (topic: string) => void
}

export function AcademiaCategories({ 
  selectedCategory, 
  onCategorySelect, 
  onTopicSelect 
}: AcademiaCategoriesProps) {
  const categories = [
    {
      id: 'gestion-basica',
      name: 'Gestión Básica',
      icon: Users,
      color: 'text-blue-600',
      topics: [
        { id: 'clientes', name: 'Clientes', lessons: 5 },
        { id: 'expedientes', name: 'Expedientes', lessons: 6 },
        { id: 'tareas', name: 'Tareas', lessons: 4 },
        { id: 'calendario', name: 'Calendario', lessons: 3 }
      ]
    },
    {
      id: 'comercial',
      name: 'Funcionalidades Comerciales',
      icon: FileText,
      color: 'text-green-600',
      topics: [
        { id: 'propuestas', name: 'Propuestas', lessons: 4 },
        { id: 'cuotas-recurrentes', name: 'Cuotas Recurrentes', lessons: 3 },
        { id: 'tiempo', name: 'Control de Tiempo', lessons: 3 }
      ]
    },
    {
      id: 'automatizacion',
      name: 'Automatización y IA',
      icon: Brain,
      color: 'text-purple-600',
      topics: [
        { id: 'workflows', name: 'Workflows', lessons: 4 },
        { id: 'ia-avanzada', name: 'IA Avanzada', lessons: 5 },
        { id: 'integraciones', name: 'Integraciones', lessons: 3 }
      ]
    },
    {
      id: 'administracion',
      name: 'Administración',
      icon: Settings,
      color: 'text-gray-600',
      topics: [
        { id: 'dashboard-ia', name: 'Dashboard IA', lessons: 2 },
        { id: 'configuracion', name: 'Configuración', lessons: 3 }
      ]
    }
  ]

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base md:text-lg">Categorías</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="space-y-1">
          {categories.map((category) => (
            <Collapsible key={category.id}>
              <CollapsibleTrigger 
                className="flex items-center justify-between w-full p-3 hover:bg-gray-50 text-left transition-colors"
                onClick={() => onCategorySelect(category.id)}
              >
                <div className="flex items-center min-w-0 flex-1">
                  <category.icon className={`h-4 w-4 mr-2 flex-shrink-0 ${category.color}`} />
                  <span className="text-sm font-medium truncate">{category.name}</span>
                </div>
                <ChevronRight className="h-4 w-4 text-gray-400 flex-shrink-0 ml-2" />
              </CollapsibleTrigger>
              
              <CollapsibleContent className="border-l-2 border-gray-100 ml-6">
                {category.topics.map((topic) => (
                  <div
                    key={topic.id}
                    className="flex items-center justify-between p-2 pl-4 hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => onTopicSelect(topic.id)}
                  >
                    <span className="text-sm text-gray-700 flex-1 min-w-0 truncate pr-2">{topic.name}</span>
                    <Badge variant="secondary" className="text-xs flex-shrink-0">
                      {topic.lessons}
                    </Badge>
                  </div>
                ))}
              </CollapsibleContent>
            </Collapsible>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
