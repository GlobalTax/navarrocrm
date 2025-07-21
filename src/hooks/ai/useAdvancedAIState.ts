
import { useState, useMemo, useCallback } from 'react'
import { createLogger } from '@/utils/logger'
import { VoiceAssistant } from '@/components/ai/VoiceAssistant'
import { DocumentAnalyzer } from '@/components/ai/DocumentAnalyzer'
import { TimeOptimizer } from '@/components/ai/TimeOptimizer'
import ComplianceMonitor from '@/components/ai/ComplianceMonitor'
import BusinessIntelligence from '@/components/ai/BusinessIntelligence'
import { Mic, FileText, Clock, Shield, TrendingUp } from 'lucide-react'

/**
 * Hook para gestionar el estado avanzado de herramientas AI
 * Proporciona filtrado, búsqueda y gestión de herramientas de inteligencia artificial
 * 
 * @returns {Object} Estado y funciones para gestionar herramientas AI
 * @returns {string} returns.searchTerm - Término de búsqueda actual
 * @returns {Function} returns.setSearchTerm - Función para actualizar búsqueda
 * @returns {string} returns.difficultyFilter - Filtro de dificultad actual
 * @returns {Function} returns.setDifficultyFilter - Función para actualizar filtro
 * @returns {Array} returns.filteredTools - Herramientas filtradas
 * 
 * @example
 * ```typescript
 * const { 
 *   searchTerm, 
 *   setSearchTerm, 
 *   filteredTools, 
 *   categories 
 * } = useAdvancedAIState()
 * 
 * // Buscar herramientas
 * setSearchTerm('análisis')
 * 
 * // Mostrar herramientas filtradas
 * filteredTools.map(tool => <ToolCard key={tool.id} {...tool} />)
 * ```
 * 
 * @since 1.0.0
 */
export const useAdvancedAIState = () => {
  const logger = createLogger('useAdvancedAIState')
  const [searchTerm, setSearchTerm] = useState('')
  const [difficultyFilter, setDifficultyFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')

  const aiTools = useMemo(() => [
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
  ], [])

  const filteredTools = useMemo(() => {
    return aiTools.filter(tool => {
      const matchesSearch = tool.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tool.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tool.category.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesDifficulty = difficultyFilter === 'all' || tool.difficulty === difficultyFilter
      const matchesCategory = categoryFilter === 'all' || tool.category === categoryFilter

      return matchesSearch && matchesDifficulty && matchesCategory
    })
  }, [aiTools, searchTerm, difficultyFilter, categoryFilter])

  const categories = useMemo(() => {
    return [...new Set(aiTools.map(tool => tool.category))]
  }, [aiTools])

  /**
   * Actualiza el término de búsqueda con logging
   */
  const updateSearchTerm = useCallback((term: string) => {
    logger.debug('Actualizando término de búsqueda', { term, previousTerm: searchTerm })
    setSearchTerm(term)
  }, [logger, searchTerm])

  /**
   * Actualiza el filtro de dificultad con logging
   */
  const updateDifficultyFilter = useCallback((difficulty: string) => {
    logger.debug('Actualizando filtro de dificultad', { difficulty, previousFilter: difficultyFilter })
    setDifficultyFilter(difficulty)
  }, [logger, difficultyFilter])

  /**
   * Actualiza el filtro de categoría con logging
   */
  const updateCategoryFilter = useCallback((category: string) => {
    logger.debug('Actualizando filtro de categoría', { category, previousFilter: categoryFilter })
    setCategoryFilter(category)
  }, [logger, categoryFilter])

  logger.debug('Estado de herramientas AI actualizado', {
    searchTerm,
    difficultyFilter,
    categoryFilter,
    totalTools: aiTools.length,
    filteredCount: filteredTools.length
  })

  return {
    searchTerm,
    setSearchTerm: updateSearchTerm,
    difficultyFilter,
    setDifficultyFilter: updateDifficultyFilter,
    categoryFilter,
    setCategoryFilter: updateCategoryFilter,
    aiTools,
    filteredTools,
    categories
  }
}
