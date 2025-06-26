
import { useState, useEffect, useCallback } from 'react'
import { AdvancedAnalyticsService } from '@/services/analytics/AdvancedAnalyticsService'
import { AnalyticsMetrics, PredictiveInsights, CustomReport, AnalyticsFilter } from '@/types/analytics'
import { useApp } from '@/contexts/AppContext'
import { toast } from 'sonner'

export const useAdvancedAnalytics = () => {
  const { user } = useApp()
  const [analyticsService, setAnalyticsService] = useState<AdvancedAnalyticsService | null>(null)
  
  // Estados principales
  const [metrics, setMetrics] = useState<AnalyticsMetrics | null>(null)
  const [insights, setInsights] = useState<PredictiveInsights | null>(null)
  const [customReports, setCustomReports] = useState<CustomReport[]>([])
  
  // Estados de carga
  const [isLoadingMetrics, setIsLoadingMetrics] = useState(false)
  const [isLoadingInsights, setIsLoadingInsights] = useState(false)
  const [isLoadingReports, setIsLoadingReports] = useState(false)
  
  // Estados de error
  const [metricsError, setMetricsError] = useState<string | null>(null)
  const [insightsError, setInsightsError] = useState<string | null>(null)

  // Estado de inicialización
  const [isInitialized, setIsInitialized] = useState(false)

  // Inicializar servicio
  useEffect(() => {
    if (user?.org_id) {
      setAnalyticsService(new AdvancedAnalyticsService(user.org_id))
      setIsInitialized(true)
    }
  }, [user?.org_id])

  // Cargar métricas del dashboard
  const loadMetrics = useCallback(async (filters?: AnalyticsFilter) => {
    if (!analyticsService) return

    setIsLoadingMetrics(true)
    setMetricsError(null)
    
    try {
      const dashboardMetrics = await analyticsService.getDashboardMetrics(filters)
      setMetrics(dashboardMetrics)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
      setMetricsError(errorMessage)
      console.error('Error loading metrics:', error)
    } finally {
      setIsLoadingMetrics(false)
    }
  }, [analyticsService])

  // Cargar insights predictivos
  const loadInsights = useCallback(async () => {
    if (!analyticsService) return

    setIsLoadingInsights(true)
    setInsightsError(null)
    
    try {
      const predictiveInsights = await analyticsService.getPredictiveInsights()
      setInsights(predictiveInsights)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
      setInsightsError(errorMessage)
      console.error('Error loading insights:', error)
    } finally {
      setIsLoadingInsights(false)
    }
  }, [analyticsService])

  // Cargar reportes personalizados
  const loadCustomReports = useCallback(async () => {
    if (!analyticsService) return

    setIsLoadingReports(true)
    
    try {
      const reports = await analyticsService.getCustomReports()
      setCustomReports(reports)
    } catch (error) {
      console.error('Error loading custom reports:', error)
      toast.error('Error al cargar reportes personalizados')
    } finally {
      setIsLoadingReports(false)
    }
  }, [analyticsService])

  // Crear reporte personalizado
  const createCustomReport = useCallback(async (
    reportData: Omit<CustomReport, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<CustomReport | null> => {
    if (!analyticsService) return null

    try {
      const newReport = await analyticsService.createCustomReport(reportData)
      setCustomReports(prev => [newReport, ...prev])
      return newReport
    } catch (error) {
      console.error('Error creating custom report:', error)
      return null
    }
  }, [analyticsService])

  // Refrescar todos los datos
  const refreshAll = useCallback(async (filters?: AnalyticsFilter) => {
    await Promise.all([
      loadMetrics(filters),
      loadInsights(),
      loadCustomReports()
    ])
  }, [loadMetrics, loadInsights, loadCustomReports])

  // Funciones de tracking (compatibilidad con sistema legacy)
  const trackEvent = useCallback((
    eventType: string,
    eventName: string,
    eventData?: Record<string, any>
  ) => {
    if (!isInitialized || !user?.org_id) return
    
    console.log('📊 [Analytics] Event tracked:', { eventType, eventName, eventData })
    // Aquí se implementaría el tracking real
  }, [isInitialized, user?.org_id])

  const trackPageView = useCallback((url?: string, title?: string) => {
    if (!isInitialized || !user?.org_id) return
    
    const pageUrl = url || window.location.href
    const pageTitle = title || document.title
    
    console.log('📊 [Analytics] Page view tracked:', { pageUrl, pageTitle })
    // Aquí se implementaría el tracking real
  }, [isInitialized, user?.org_id])

  const flush = useCallback(async () => {
    if (!isInitialized) return
    
    console.log('📊 [Analytics] Flushing analytics data...')
    // Aquí se implementaría el flush real
  }, [isInitialized])

  // Cargar datos iniciales
  useEffect(() => {
    if (analyticsService && isInitialized) {
      refreshAll()
    }
  }, [analyticsService, isInitialized, refreshAll])

  // Función de utilidad para obtener métricas específicas
  const getMetricValue = useCallback((category: keyof AnalyticsMetrics, metric: string): number => {
    if (!metrics || !metrics[category]) return 0
    return (metrics[category] as any)[metric] || 0
  }, [metrics])

  // Función para verificar si hay datos disponibles
  const hasData = useCallback(() => {
    return metrics !== null || insights !== null
  }, [metrics, insights])

  // Estado de carga general
  const isLoading = isLoadingMetrics || isLoadingInsights || isLoadingReports

  return {
    // Datos
    metrics,
    insights,
    customReports,
    
    // Estados de carga
    isLoading,
    isLoadingMetrics,
    isLoadingInsights,
    isLoadingReports,
    
    // Estados de error
    metricsError,
    insightsError,
    
    // Estados de inicialización
    isInitialized,
    
    // Acciones principales
    loadMetrics,
    loadInsights,
    loadCustomReports,
    createCustomReport,
    refreshAll,
    
    // Funciones de tracking (compatibilidad)
    trackEvent,
    trackPageView,
    flush,
    
    // Utilidades
    getMetricValue,
    hasData,
    
    // Servicio
    analyticsService
  }
}
