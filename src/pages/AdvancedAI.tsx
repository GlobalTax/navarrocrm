
import React, { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { AIToolCard } from '@/components/ai/AIToolCard'
import { AIGuidedTour } from '@/components/ai/AIGuidedTour'
import { VoiceAssistant } from '@/components/ai/VoiceAssistant'
import { DocumentAnalyzer } from '@/components/ai/DocumentAnalyzer'
import { TimeOptimizer } from '@/components/ai/TimeOptimizer'
import { ComplianceMonitor } from '@/components/ai/ComplianceMonitor'
import { BusinessIntelligence } from '@/components/ai/BusinessIntelligence'
import { Brain, Mic, FileText, Clock, Shield, TrendingUp, Search, Filter } from 'lucide-react'

const AdvancedAI = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [difficultyFilter, setDifficultyFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')

  const aiTools = [
    {
      id: 'voice',
      title: 'Asistente de Voz Inteligente',
      description: 'Controla tu despacho con comandos de voz naturales. Crea tareas, busca expedientes, programa citas.',
      icon: Mic,
      difficulty: 'Principiante' as const,
      timeToUse: '5 min',
      usedBy: 1247,
      category: 'Productividad',
      isPopular: true,
      component: VoiceAssistant,
      useCases: ['Crear nuevas tareas por voz', 'Buscar expedientes rápidamente', 'Programar citas automáticamente']
    },
    {
      id: 'documents',
      title: 'Analizador de Documentos IA',
      description: 'Extrae datos automáticamente, detecta cláusulas problemáticas y clasifica documentos legales.',
      icon: FileText,
      difficulty: 'Intermedio' as const,
      timeToUse: '10 min',
      usedBy: 856,
      category: 'Automatización',
      isPopular: true,
      component: DocumentAnalyzer,
      useCases: ['Revisar contratos automáticamente', 'Extraer datos de escrituras', 'Clasificar documentos por tipo']
    },
    {
      id: 'time',
      title: 'Optimizador de Tiempo IA',
      description: 'Analiza tus patrones de trabajo y optimiza tu agenda para máxima productividad.',
      icon: Clock,
      difficulty: 'Intermedio' as const,
      timeToUse: '15 min',
      usedBy: 634,
      category: 'Análisis',
      component: TimeOptimizer,
      useCases: ['Analizar patrones de productividad', 'Optimizar horarios de trabajo', 'Identificar picos de rendimiento']
    },
    {
      id: 'compliance',
      title: 'Monitor de Compliance IA',
      description: 'Monitoreo automático de compliance, detección de riesgos y alertas de vencimientos.',
      icon: Shield,
      difficulty: 'Avanzado' as const,
      timeToUse: '20 min',
      usedBy: 423,
      category: 'Seguridad',
      component: ComplianceMonitor,
      useCases: ['Detectar riesgos de compliance', 'Alertas de vencimientos legales', 'Auditorías automáticas']
    },
    {
      id: 'business',
      title: 'Business Intelligence IA',
      description: 'Análisis predictivo, identificación de oportunidades y insights de negocio avanzados.',
      icon: TrendingUp,
      difficulty: 'Avanzado' as const,
      timeToUse: '25 min',
      usedBy: 312,
      category: 'Estrategia',
      component: BusinessIntelligence,
      useCases: ['Análisis predictivo de ingresos', 'Identificar clientes potenciales', 'Optimizar precios de servicios']
    }
  ]

  const filteredTools = aiTools.filter(tool => {
    const matchesSearch = tool.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tool.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tool.category.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesDifficulty = difficultyFilter === 'all' || tool.difficulty === difficultyFilter
    const matchesCategory = categoryFilter === 'all' || tool.category === categoryFilter

    return matchesSearch && matchesDifficulty && matchesCategory
  })

  const categories = [...new Set(aiTools.map(tool => tool.category))]

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Header mejorado */}
      <div className="text-center lg:text-left">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">IA Avanzada</h1>
            <p className="text-gray-600 mt-2">
              Herramientas de inteligencia artificial para optimizar tu despacho
            </p>
          </div>
          <Badge variant="outline" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            {aiTools.length} Herramientas Disponibles
          </Badge>
        </div>
      </div>

      {/* Tour guiado */}
      <AIGuidedTour />

      {/* Filtros y búsqueda */}
      <div className="flex flex-col sm:flex-row gap-4 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Buscar herramientas IA..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex gap-2">
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Categoría" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las categorías</SelectItem>
              {categories.map(category => (
                <SelectItem key={category} value={category}>{category}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Dificultad" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las dificultades</SelectItem>
              <SelectItem value="Principiante">Principiante</SelectItem>
              <SelectItem value="Intermedio">Intermedio</SelectItem>
              <SelectItem value="Avanzado">Avanzado</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

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
          {filteredTools.length === 0 ? (
            <div className="text-center py-12">
              <Brain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron herramientas</h3>
              <p className="text-gray-600">Intenta ajustar los filtros o términos de búsqueda</p>
            </div>
          ) : (
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
          )}
        </TabsContent>

        <TabsContent value="tools" className="space-y-6">
          <Tabs defaultValue="voice" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="voice" className="flex items-center gap-2">
                <Mic className="h-4 w-4" />
                <span className="hidden sm:inline">Voz</span>
              </TabsTrigger>
              <TabsTrigger value="documents" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                <span className="hidden sm:inline">Documentos</span>
              </TabsTrigger>
              <TabsTrigger value="time" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span className="hidden sm:inline">Tiempo</span>
              </TabsTrigger>
              <TabsTrigger value="compliance" className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                <span className="hidden sm:inline">Compliance</span>
              </TabsTrigger>
              <TabsTrigger value="business" className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                <span className="hidden sm:inline">Business</span>
              </TabsTrigger>
            </TabsList>

            {aiTools.map((tool) => (
              <TabsContent key={tool.id} value={tool.id} className="space-y-4">
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg border">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-white rounded-lg shadow-sm">
                      <tool.icon className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold">{tool.title}</h2>
                      <p className="text-gray-600">{tool.description}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 mb-4">
                    <Badge variant="outline">{tool.difficulty}</Badge>
                    <Badge variant="secondary">{tool.category}</Badge>
                    <span className="text-sm text-gray-600">⏱️ {tool.timeToUse} para dominar</span>
                    <span className="text-sm text-gray-600">👥 {tool.usedBy} usuarios activos</span>
                  </div>
                </div>
                
                <tool.component />
              </TabsContent>
            ))}
          </Tabs>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default AdvancedAI
