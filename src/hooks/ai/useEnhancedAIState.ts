
import { useState, useCallback, useMemo, useEffect } from 'react'
import { useApp } from '@/contexts/AppContext'
import { useGlobalStateContext } from '@/contexts/GlobalStateContext'
import { EnhancedAITool, AIWorkflow, AIAnalytics, AIRecommendation, WorkflowTemplate } from '@/types/aiTypes'
import { Mic, FileText, Clock, Shield, TrendingUp } from 'lucide-react'

export const useEnhancedAIState = () => {
  const { user } = useApp()
  const { addNotification } = useGlobalStateContext()
  
  // Estado de filtros
  const [searchTerm, setSearchTerm] = useState('')
  const [difficultyFilter, setDifficultyFilter] = useState<'all' | 'basic' | 'intermediate' | 'advanced'>('all')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [showOnlyEnabled, setShowOnlyEnabled] = useState(false)
  const [showOnlyPopular, setShowOnlyPopular] = useState(false)
  
  // Estado de herramientas mejoradas
  const [enhancedTools, setEnhancedTools] = useState<EnhancedAITool[]>([])
  const [selectedTool, setSelectedTool] = useState<EnhancedAITool | null>(null)
  const [isToolRunning, setIsToolRunning] = useState(false)
  const [runningToolProgress, setRunningToolProgress] = useState(0)
  
  // Estado de workflows
  const [workflows, setWorkflows] = useState<AIWorkflow[]>([])
  const [workflowTemplates, setWorkflowTemplates] = useState<WorkflowTemplate[]>([])
  const [activeWorkflow, setActiveWorkflow] = useState<AIWorkflow | null>(null)
  const [workflowProgress, setWorkflowProgress] = useState(0)
  const [currentWorkflowStep, setCurrentWorkflowStep] = useState(0)
  
  // Estado de analytics y recomendaciones
  const [analytics, setAnalytics] = useState<AIAnalytics | null>(null)
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([])
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(false)

  // Inicializar herramientas mejoradas
  useEffect(() => {
    const initializeEnhancedTools = async () => {
      try {
        const tools: EnhancedAITool[] = [
          {
            id: 'voice',
            name: 'Asistente de Voz Inteligente',
            description: 'Controla tu despacho con comandos de voz naturales. Crea tareas, busca expedientes, programa citas.',
            icon: Mic,
            difficulty: 'basic',
            timeToUse: '5 min',
            usedBy: 1247,
            category: 'Productividad',
            isPopular: true,
            useCases: ['Crear nuevas tareas por voz', 'Buscar expedientes rápidamente', 'Programar citas automáticamente'],
            isEnabled: true,
            usageCount: 89,
            estimatedTime: 5,
            successRate: 0.94,
            tags: ['voz', 'productividad', 'automatización'],
            lastUsed: new Date(Date.now() - 2 * 60 * 60 * 1000)
          },
          {
            id: 'documents',
            name: 'Analizador de Documentos IA',
            description: 'Extrae datos automáticamente, detecta cláusulas problemáticas y clasifica documentos legales.',
            icon: FileText,
            difficulty: 'intermediate',
            timeToUse: '10 min',
            usedBy: 856,
            category: 'Automatización',
            isPopular: true,
            useCases: ['Revisar contratos automáticamente', 'Extraer datos de escrituras', 'Clasificar documentos por tipo'],
            isEnabled: true,
            usageCount: 156,
            estimatedTime: 10,
            successRate: 0.91,
            tags: ['documentos', 'análisis', 'extracción', 'contratos'],
            lastUsed: new Date(Date.now() - 4 * 60 * 60 * 1000)
          },
          {
            id: 'time',
            name: 'Optimizador de Tiempo IA',
            description: 'Analiza tus patrones de trabajo y optimiza tu agenda para máxima productividad.',
            icon: Clock,
            difficulty: 'intermediate',
            timeToUse: '15 min',
            usedBy: 634,
            category: 'Análisis',
            useCases: ['Analizar patrones de productividad', 'Optimizar horarios de trabajo', 'Identificar picos de rendimiento'],
            isEnabled: true,
            usageCount: 73,
            estimatedTime: 15,
            successRate: 0.87,
            tags: ['tiempo', 'productividad', 'optimización', 'patrones'],
            lastUsed: new Date(Date.now() - 6 * 60 * 60 * 1000)
          },
          {
            id: 'compliance',
            name: 'Monitor de Compliance IA',
            description: 'Monitoreo automático de compliance, detección de riesgos y alertas de vencimientos.',
            icon: Shield,
            difficulty: 'advanced',
            timeToUse: '20 min',
            usedBy: 423,
            category: 'Seguridad',
            useCases: ['Detectar riesgos de compliance', 'Alertas de vencimientos legales', 'Auditorías automáticas'],
            isEnabled: true,
            usageCount: 45,
            estimatedTime: 20,
            successRate: 0.96,
            tags: ['compliance', 'riesgos', 'legal', 'auditoría'],
            lastUsed: new Date(Date.now() - 12 * 60 * 60 * 1000)
          },
          {
            id: 'business',
            name: 'Business Intelligence IA',
            description: 'Análisis predictivo, identificación de oportunidades y insights de negocio avanzados.',
            icon: TrendingUp,
            difficulty: 'advanced',
            timeToUse: '25 min',
            usedBy: 312,
            category: 'Estrategia',
            useCases: ['Análisis predictivo de ingresos', 'Identificar clientes potenciales', 'Optimizar precios de servicios'],
            isEnabled: true,
            usageCount: 28,
            estimatedTime: 25,
            successRate: 0.89,
            tags: ['business', 'estrategia', 'predictivo', 'ingresos'],
            lastUsed: new Date(Date.now() - 24 * 60 * 60 * 1000)
          }
        ]
        
        setEnhancedTools(tools)
        
        // Inicializar templates de workflow
        const templates: WorkflowTemplate[] = [
          {
            id: 'case-complete-analysis',
            name: 'Análisis Completo de Caso',
            description: 'Análisis integral de un nuevo caso incluyendo documentos, riesgos y estrategia',
            category: 'Análisis',
            difficulty: 'advanced',
            estimatedTime: 45,
            tags: ['casos', 'análisis', 'completo'],
            popularity: 85,
            createdBy: 'system',
            steps: [
              {
                toolId: 'documents',
                order: 1,
                parameters: { analysisType: 'comprehensive' },
                description: 'Analizar documentos del caso',
                estimatedTime: 15
              },
              {
                toolId: 'compliance',
                order: 2,
                parameters: { checkType: 'case_review' },
                description: 'Verificar compliance del caso',
                estimatedTime: 20
              },
              {
                toolId: 'business',
                order: 3,
                parameters: { analysisType: 'case_strategy' },
                description: 'Generar insights estratégicos',
                estimatedTime: 10
              }
            ]
          },
          {
            id: 'client-onboarding',
            name: 'Onboarding de Cliente',
            description: 'Proceso completo de incorporación de nuevo cliente',
            category: 'Clientes',
            difficulty: 'intermediate',
            estimatedTime: 30,
            tags: ['clientes', 'onboarding', 'nuevos'],
            popularity: 92,
            createdBy: 'system',
            steps: [
              {
                toolId: 'documents',
                order: 1,
                parameters: { analysisType: 'client_documents' },
                description: 'Procesar documentación del cliente',
                estimatedTime: 15
              },
              {
                toolId: 'compliance',
                order: 2,
                parameters: { checkType: 'client_verification' },
                description: 'Verificación de compliance del cliente',
                estimatedTime: 10
              },
              {
                toolId: 'voice',
                order: 3,
                parameters: { action: 'create_welcome_tasks' },
                description: 'Crear tareas de bienvenida',
                estimatedTime: 5
              }
            ]
          }
        ]
        
        setWorkflowTemplates(templates)
        
      } catch (error) {
        console.error('Error initializing enhanced AI tools:', error)
        addNotification({
          type: 'error',
          title: 'Error de Inicialización',
          message: 'No se pudieron cargar las herramientas de IA mejoradas',
        })
      }
    }

    initializeEnhancedTools()
  }, [addNotification])

  // Filtros mejorados
  const filteredTools = useMemo(() => {
    return enhancedTools.filter(tool => {
      const matchesSearch = tool.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           tool.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           tool.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      
      const matchesDifficulty = difficultyFilter === 'all' || tool.difficulty === difficultyFilter
      const matchesCategory = categoryFilter === 'all' || tool.category === categoryFilter
      const matchesEnabled = !showOnlyEnabled || tool.isEnabled
      const matchesPopular = !showOnlyPopular || tool.isPopular
      
      return matchesSearch && matchesDifficulty && matchesCategory && matchesEnabled && matchesPopular
    })
  }, [enhancedTools, searchTerm, difficultyFilter, categoryFilter, showOnlyEnabled, showOnlyPopular])

  // Categorías y estadísticas
  const categories = useMemo(() => {
    const uniqueCategories = [...new Set(enhancedTools.map(tool => tool.category))]
    return uniqueCategories.sort()
  }, [enhancedTools])

  const toolStats = useMemo(() => {
    return {
      totalTools: enhancedTools.length,
      enabledTools: enhancedTools.filter(t => t.isEnabled).length,
      popularTools: enhancedTools.filter(t => t.isPopular).length,
      avgSuccessRate: enhancedTools.reduce((sum, t) => sum + t.successRate, 0) / enhancedTools.length,
      totalUsage: enhancedTools.reduce((sum, t) => sum + t.usageCount, 0)
    }
  }, [enhancedTools])

  // Ejecutar herramienta mejorada
  const executeTool = useCallback(async (toolId: string, parameters?: Record<string, any>) => {
    const tool = enhancedTools.find(t => t.id === toolId)
    if (!tool || !tool.isEnabled) {
      addNotification({
        type: 'error',
        title: 'Herramienta No Disponible',
        message: 'La herramienta no existe o no está habilitada',
      })
      return null
    }

    setIsToolRunning(true)
    setSelectedTool(tool)
    setRunningToolProgress(0)

    try {
      addNotification({
        type: 'info',
        title: 'Ejecutando Herramienta IA',
        message: `Iniciando ${tool.name}...`,
        autoClose: false,
      })

      // Simular progreso de ejecución
      const progressInterval = setInterval(() => {
        setRunningToolProgress(prev => {
          const newProgress = prev + (100 / (tool.estimatedTime * 2))
          return Math.min(newProgress, 95)
        })
      }, 500)

      // Simular tiempo de ejecución
      await new Promise(resolve => setTimeout(resolve, tool.estimatedTime * 1000))

      clearInterval(progressInterval)
      setRunningToolProgress(100)

      // Actualizar estadísticas
      setEnhancedTools(prev => prev.map(t => 
        t.id === toolId 
          ? { 
              ...t, 
              usageCount: t.usageCount + 1, 
              lastUsed: new Date(),
              successRate: (t.successRate * t.usageCount + 1) / (t.usageCount + 1)
            }
          : t
      ))

      addNotification({
        type: 'success',
        title: 'Herramienta Completada',
        message: `${tool.name} ejecutada exitosamente`,
        autoClose: true,
        duration: 3000,
      })

      return { success: true, result: `Resultado exitoso de ${tool.name}`, toolId }
    } catch (error) {
      console.error('Error executing enhanced AI tool:', error)
      addNotification({
        type: 'error',
        title: 'Error en Herramienta IA',
        message: `Error al ejecutar ${tool.name}`,
        autoClose: true,
        duration: 5000,
      })
      return { success: false, error: error.message, toolId }
    } finally {
      setIsToolRunning(false)
      setSelectedTool(null)
      setRunningToolProgress(0)
    }
  }, [enhancedTools, addNotification])

  // Crear workflow desde template
  const createWorkflowFromTemplate = useCallback((templateId: string, customName?: string) => {
    const template = workflowTemplates.find(t => t.id === templateId)
    if (!template) return null

    const newWorkflow: AIWorkflow = {
      id: `workflow-${Date.now()}`,
      name: customName || template.name,
      description: template.description,
      category: template.category,
      estimatedTime: template.estimatedTime,
      isTemplate: false,
      createdBy: user?.id || 'unknown',
      createdAt: new Date(),
      tags: template.tags,
      usageCount: 0,
      successRate: 1.0,
      steps: template.steps.map((step, index) => ({
        ...step,
        id: `step-${Date.now()}-${index}`
      }))
    }

    setWorkflows(prev => [...prev, newWorkflow])
    
    addNotification({
      type: 'success',
      title: 'Workflow Creado',
      message: `Workflow "${newWorkflow.name}" creado exitosamente`,
      autoClose: true,
      duration: 3000,
    })

    return newWorkflow
  }, [workflowTemplates, user?.id, addNotification])

  // Ejecutar workflow mejorado
  const executeWorkflow = useCallback(async (workflowId: string) => {
    const workflow = workflows.find(w => w.id === workflowId)
    if (!workflow) {
      addNotification({
        type: 'error',
        title: 'Workflow No Encontrado',
        message: 'El workflow especificado no existe',
      })
      return
    }

    setActiveWorkflow(workflow)
    setWorkflowProgress(0)
    setCurrentWorkflowStep(0)

    try {
      addNotification({
        type: 'info',
        title: 'Ejecutando Workflow',
        message: `Iniciando workflow "${workflow.name}"...`,
        autoClose: false,
      })

      let successfulSteps = 0
      
      for (let i = 0; i < workflow.steps.length; i++) {
        const step = workflow.steps[i]
        setCurrentWorkflowStep(i)
        
        const result = await executeTool(step.toolId, step.parameters)
        
        if (result?.success) {
          successfulSteps++
        }
        
        const progress = ((i + 1) / workflow.steps.length) * 100
        setWorkflowProgress(progress)
        
        // Pequeña pausa entre pasos
        await new Promise(resolve => setTimeout(resolve, 1000))
      }

      // Actualizar estadísticas del workflow
      const newSuccessRate = successfulSteps / workflow.steps.length
      setWorkflows(prev => prev.map(w => 
        w.id === workflowId 
          ? { 
              ...w, 
              usageCount: w.usageCount + 1,
              lastUsed: new Date(),
              successRate: (w.successRate * w.usageCount + newSuccessRate) / (w.usageCount + 1)
            }
          : w
      ))

      addNotification({
        type: 'success',
        title: 'Workflow Completado',
        message: `Workflow "${workflow.name}" ejecutado con ${successfulSteps}/${workflow.steps.length} pasos exitosos`,
        autoClose: true,
        duration: 5000,
      })
    } catch (error) {
      console.error('Error executing enhanced workflow:', error)
      addNotification({
        type: 'error',
        title: 'Error en Workflow',
        message: `Error al ejecutar workflow "${workflow.name}"`,
        autoClose: true,
        duration: 5000,
      })
    } finally {
      setActiveWorkflow(null)
      setWorkflowProgress(0)
      setCurrentWorkflowStep(0)
    }
  }, [workflows, executeTool, addNotification])

  // Generar analytics mejorados
  const generateAnalytics = useCallback(async () => {
    setIsLoadingAnalytics(true)
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      const sortedTools = [...enhancedTools].sort((a, b) => b.usageCount - a.usageCount)
      
      const mockAnalytics: AIAnalytics = {
        totalUsage: enhancedTools.reduce((sum, tool) => sum + tool.usageCount, 0),
        mostUsedTools: sortedTools.slice(0, 5),
        averageTimePerTool: enhancedTools.reduce((sum, tool) => sum + tool.estimatedTime, 0) / enhancedTools.length,
        successRate: enhancedTools.reduce((sum, tool) => sum + tool.successRate, 0) / enhancedTools.length,
        userEfficiency: 0.82,
        workflowsCreated: workflows.length,
        timeScheduled: workflows.reduce((sum, w) => sum + w.estimatedTime, 0),
        productivityGains: 0.34, // 34% mejora en productividad
        weeklyTrends: [
          { week: 'Sem 1', usage: 45, efficiency: 0.78 },
          { week: 'Sem 2', usage: 62, efficiency: 0.81 },
          { week: 'Sem 3', usage: 78, efficiency: 0.85 },
          { week: 'Sem 4', usage: 91, efficiency: 0.82 }
        ],
        categoryBreakdown: categories.map(cat => ({
          category: cat,
          usage: enhancedTools.filter(t => t.category === cat).reduce((sum, t) => sum + t.usageCount, 0),
          tools: enhancedTools.filter(t => t.category === cat).length
        }))
      }
      
      setAnalytics(mockAnalytics)

      // Generar recomendaciones inteligentes
      const newRecommendations: AIRecommendation[] = [
        {
          id: 'rec-1',
          type: 'workflow',
          title: 'Crear Workflow de Análisis Semanal',
          description: 'Basado en tu uso frecuente de herramientas de análisis, te recomendamos crear un workflow automatizado',
          confidence: 0.89,
          estimatedBenefit: '3 horas ahorradas por semana',
          actionRequired: 'Crear workflow personalizado'
        },
        {
          id: 'rec-2',
          type: 'tool',
          title: 'Usar más el Monitor de Compliance',
          description: 'Esta herramienta tiene alta tasa de éxito pero bajo uso. Podría mejorar significativamente tu compliance',
          confidence: 0.76,
          estimatedBenefit: '25% reducción en riesgos',
          actionRequired: 'Incluir en rutina semanal',
          toolId: 'compliance'
        }
      ]
      
      setRecommendations(newRecommendations)
      
    } catch (error) {
      console.error('Error generating enhanced analytics:', error)
      addNotification({
        type: 'error',
        title: 'Error en Analytics',
        message: 'No se pudieron generar las estadísticas mejoradas',
      })
    } finally {
      setIsLoadingAnalytics(false)
    }
  }, [enhancedTools, workflows, categories, addNotification])

  // Limpiar filtros
  const clearFilters = useCallback(() => {
    setSearchTerm('')
    setDifficultyFilter('all')
    setCategoryFilter('all')
    setShowOnlyEnabled(false)
    setShowOnlyPopular(false)
  }, [])

  return {
    // Estado de filtros mejorado
    searchTerm,
    setSearchTerm,
    difficultyFilter,
    setDifficultyFilter,
    categoryFilter,
    setCategoryFilter,
    showOnlyEnabled,
    setShowOnlyEnabled,
    showOnlyPopular,
    setShowOnlyPopular,
    
    // Herramientas mejoradas
    enhancedTools,
    filteredTools,
    selectedTool,
    isToolRunning,
    runningToolProgress,
    executeTool,
    
    // Workflows mejorados
    workflows,
    workflowTemplates,
    activeWorkflow,
    workflowProgress,
    currentWorkflowStep,
    createWorkflowFromTemplate,
    executeWorkflow,
    
    // Analytics y recomendaciones
    analytics,
    recommendations,
    isLoadingAnalytics,
    generateAnalytics,
    
    // Estadísticas y utilidades
    categories,
    toolStats,
    clearFilters,
  }
}
