
import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Play, 
  Clock, 
  Users, 
  TrendingUp, 
  CheckCircle, 
  AlertCircle,
  Zap,
  Star,
  BarChart3
} from 'lucide-react'
import { EnhancedAITool } from '@/types/aiTypes'

interface EnhancedAIToolsViewProps {
  filteredTools: EnhancedAITool[]
  isToolRunning: boolean
  runningToolProgress: number
  selectedTool: EnhancedAITool | null
  onExecuteTool: (toolId: string) => void
  toolStats: {
    totalTools: number
    enabledTools: number
    popularTools: number
    avgSuccessRate: number
    totalUsage: number
  }
}

export const EnhancedAIToolsView: React.FC<EnhancedAIToolsViewProps> = ({
  filteredTools,
  isToolRunning,
  runningToolProgress,
  selectedTool,
  onExecuteTool,
  toolStats
}) => {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'basic': return 'bg-green-100 text-green-800 border-green-200'
      case 'intermediate': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'advanced': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getSuccessRateColor = (rate: number) => {
    if (rate >= 0.9) return 'text-green-600'
    if (rate >= 0.8) return 'text-yellow-600'
    return 'text-red-600'
  }

  const formatLastUsed = (date?: Date) => {
    if (!date) return 'Nunca usado'
    const now = new Date()
    const diffHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffHours < 1) return 'Hace menos de 1 hora'
    if (diffHours < 24) return `Hace ${diffHours} horas`
    const diffDays = Math.floor(diffHours / 24)
    return `Hace ${diffDays} días`
  }

  return (
    <div className="space-y-6">
      {/* Panel de estadísticas generales */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-2xl font-bold">{toolStats.totalTools}</p>
              </div>
              <Zap className="h-5 w-5 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Habilitadas</p>
                <p className="text-2xl font-bold text-green-600">{toolStats.enabledTools}</p>
              </div>
              <CheckCircle className="h-5 w-5 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Populares</p>
                <p className="text-2xl font-bold text-amber-600">{toolStats.popularTools}</p>
              </div>
              <Star className="h-5 w-5 text-amber-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Éxito Promedio</p>
                <p className={`text-2xl font-bold ${getSuccessRateColor(toolStats.avgSuccessRate)}`}>
                  {Math.round(toolStats.avgSuccessRate * 100)}%
                </p>
              </div>
              <BarChart3 className="h-5 w-5 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Uso Total</p>
                <p className="text-2xl font-bold text-blue-600">{toolStats.totalUsage}</p>
              </div>
              <TrendingUp className="h-5 w-5 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Herramienta en ejecución */}
      {isToolRunning && selectedTool && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Play className="h-5 w-5 text-blue-600 animate-pulse" />
              Ejecutando: {selectedTool.name}
            </CardTitle>
            <CardDescription>
              Tiempo estimado: {selectedTool.estimatedTime} minutos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progreso</span>
                <span>{Math.round(runningToolProgress)}%</span>
              </div>
              <Progress value={runningToolProgress} className="h-2" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Grid de herramientas */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredTools.map((tool) => {
          const IconComponent = tool.icon
          
          return (
            <Card key={tool.id} className="group hover:shadow-lg transition-all duration-200">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    {IconComponent && <IconComponent className="h-6 w-6 text-blue-600" />}
                    <div>
                      <CardTitle className="text-lg group-hover:text-blue-600 transition-colors">
                        {tool.name}
                      </CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className={getDifficultyColor(tool.difficulty)}>
                          {tool.difficulty}
                        </Badge>
                        {tool.isPopular && (
                          <Badge variant="secondary" className="bg-amber-100 text-amber-800">
                            <Star className="h-3 w-3 mr-1" />
                            Popular
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {tool.timeToUse || `${tool.estimatedTime} min`}
                    </div>
                    {tool.usedBy && (
                      <div className="flex items-center gap-1 mt-1">
                        <Users className="h-3 w-3" />
                        {tool.usedBy}
                      </div>
                    )}
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <CardDescription className="text-sm">
                  {tool.description}
                </CardDescription>

                {/* Estadísticas de uso */}
                <div className="grid grid-cols-3 gap-4 text-center border-t pt-3">
                  <div>
                    <p className="text-sm font-semibold">{tool.usageCount}</p>
                    <p className="text-xs text-gray-500">Usos</p>
                  </div>
                  <div>
                    <p className={`text-sm font-semibold ${getSuccessRateColor(tool.successRate)}`}>
                      {Math.round(tool.successRate * 100)}%
                    </p>
                    <p className="text-xs text-gray-500">Éxito</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-600">
                      {formatLastUsed(tool.lastUsed)}
                    </p>
                    <p className="text-xs text-gray-500">Último uso</p>
                  </div>
                </div>

                {/* Casos de uso */}
                {tool.useCases && tool.useCases.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-sm mb-2">Casos de uso:</h4>
                    <ul className="text-sm space-y-1">
                      {tool.useCases.slice(0, 2).map((useCase, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-blue-600 mt-1">•</span>
                          <span className="text-gray-600">{useCase}</span>
                        </li>
                      ))}
                      {tool.useCases.length > 2 && (
                        <li className="text-xs text-gray-500">
                          +{tool.useCases.length - 2} más...
                        </li>
                      )}
                    </ul>
                  </div>
                )}

                {/* Tags */}
                <div className="flex flex-wrap gap-1">
                  {tool.tags.slice(0, 3).map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {tool.tags.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{tool.tags.length - 3}
                    </Badge>
                  )}
                </div>

                {/* Botón de acción */}
                <Button
                  onClick={() => onExecuteTool(tool.id)}
                  disabled={!tool.isEnabled || isToolRunning}
                  className="w-full"
                  variant={tool.isEnabled ? "default" : "secondary"}
                >
                  {!tool.isEnabled ? (
                    <>
                      <AlertCircle className="h-4 w-4 mr-2" />
                      No Disponible
                    </>
                  ) : isToolRunning ? (
                    <>
                      <Play className="h-4 w-4 mr-2 animate-pulse" />
                      Ejecutando...
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 mr-2" />
                      Ejecutar Herramienta
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {filteredTools.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">
              No se encontraron herramientas
            </h3>
            <p className="text-gray-500 text-center max-w-md">
              Intenta ajustar los filtros para encontrar las herramientas que necesitas.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
