
import { useState, useMemo } from 'react'
import { VoiceAssistant } from '@/components/ai/VoiceAssistant'
import { DocumentAnalyzer } from '@/components/ai/DocumentAnalyzer'
import { TimeOptimizer } from '@/components/ai/TimeOptimizer'
import { ComplianceMonitor } from '@/components/ai/ComplianceMonitor'
import { BusinessIntelligence } from '@/components/ai/BusinessIntelligence'
import { Mic, FileText, Clock, Shield, TrendingUp } from 'lucide-react'

export const useAdvancedAIState = () => {
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

  return {
    searchTerm,
    setSearchTerm,
    difficultyFilter,
    setDifficultyFilter,
    categoryFilter,
    setCategoryFilter,
    aiTools,
    filteredTools,
    categories
  }
}
