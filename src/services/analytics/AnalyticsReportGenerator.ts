
import { supabase } from '@/integrations/supabase/client'
import { analyticsCache } from './AnalyticsCache'

export interface ReportData {
  title: string
  period: {
    start: Date
    end: Date
  }
  summary: {
    totalSessions: number
    totalPageViews: number
    totalErrors: number
    avgSessionDuration: number
    bounceRate: number
    topPages: Array<{ page: string; views: number }>
    errorsByType: Array<{ type: string; count: number }>
    performanceMetrics: {
      avgLCP: number
      avgFID: number
      avgCLS: number
    }
  }
  trends: Array<{
    date: string
    sessions: number
    errors: number
    avgPerformance: number
  }>
  recommendations: string[]
}

class AnalyticsReportGenerator {
  async generateReport(
    orgId: string,
    startDate: Date,
    endDate: Date,
    includeRecommendations: boolean = true
  ): Promise<ReportData> {
    const cacheKey = analyticsCache.generateKey('report', {
      orgId,
      start: startDate.toISOString(),
      end: endDate.toISOString()
    })

    return analyticsCache.withCache(
      cacheKey,
      () => this.fetchReportData(orgId, startDate, endDate, includeRecommendations),
      10 * 60 * 1000 // 10 minutos de caché
    )
  }

  private async fetchReportData(
    orgId: string,
    startDate: Date,
    endDate: Date,
    includeRecommendations: boolean
  ): Promise<ReportData> {
    const [
      sessionsData,
      eventsData,
      errorsData,
      performanceData
    ] = await Promise.all([
      this.getSessionsData(orgId, startDate, endDate),
      this.getEventsData(orgId, startDate, endDate),
      this.getErrorsData(orgId, startDate, endDate),
      this.getPerformanceData(orgId, startDate, endDate)
    ])

    const summary = this.calculateSummary(sessionsData, eventsData, errorsData, performanceData)
    const trends = this.calculateTrends(sessionsData, errorsData, performanceData, startDate, endDate)
    const recommendations = includeRecommendations 
      ? this.generateRecommendations(summary, trends)
      : []

    return {
      title: `Reporte Analytics ${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`,
      period: { start: startDate, end: endDate },
      summary,
      trends,
      recommendations
    }
  }

  private async getSessionsData(orgId: string, startDate: Date, endDate: Date) {
    const { data, error } = await supabase
      .from('analytics_sessions')
      .select('*')
      .eq('org_id', orgId)
      .gte('start_time', startDate.toISOString())
      .lte('start_time', endDate.toISOString())

    if (error) throw error
    return data || []
  }

  private async getEventsData(orgId: string, startDate: Date, endDate: Date) {
    const { data, error } = await supabase
      .from('analytics_events')
      .select('*')
      .eq('org_id', orgId)
      .gte('timestamp', startDate.toISOString())
      .lte('timestamp', endDate.toISOString())

    if (error) throw error
    return data || []
  }

  private async getErrorsData(orgId: string, startDate: Date, endDate: Date) {
    const { data, error } = await supabase
      .from('analytics_errors')
      .select('*')
      .eq('org_id', orgId)
      .gte('timestamp', startDate.toISOString())
      .lte('timestamp', endDate.toISOString())

    if (error) throw error
    return data || []
  }

  private async getPerformanceData(orgId: string, startDate: Date, endDate: Date) {
    const { data, error } = await supabase
      .from('analytics_performance')
      .select('*')
      .eq('org_id', orgId)
      .gte('timestamp', startDate.toISOString())
      .lte('timestamp', endDate.toISOString())

    if (error) throw error
    return data || []
  }

  private calculateSummary(sessionsData: any[], eventsData: any[], errorsData: any[], performanceData: any[]) {
    const totalSessions = sessionsData.length
    const totalPageViews = eventsData.filter(e => e.event_type === 'navigation').length
    const totalErrors = errorsData.length

    const avgSessionDuration = sessionsData
      .filter(s => s.end_time)
      .reduce((sum, s) => {
        const duration = new Date(s.end_time).getTime() - new Date(s.start_time).getTime()
        return sum + duration
      }, 0) / Math.max(sessionsData.filter(s => s.end_time).length, 1)

    const bounceRate = totalSessions > 0 
      ? (sessionsData.filter(s => s.page_views <= 1).length / totalSessions) * 100 
      : 0

    // Top páginas
    const pageViews = new Map<string, number>()
    eventsData
      .filter(e => e.event_type === 'navigation')
      .forEach(e => {
        const page = new URL(e.page_url).pathname
        pageViews.set(page, (pageViews.get(page) || 0) + 1)
      })

    const topPages = Array.from(pageViews.entries())
      .map(([page, views]) => ({ page, views }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 10)

    // Errores por tipo
    const errorTypes = new Map<string, number>()
    errorsData.forEach(e => {
      errorTypes.set(e.error_type, (errorTypes.get(e.error_type) || 0) + 1)
    })

    const errorsByType = Array.from(errorTypes.entries())
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count)

    // Métricas de performance
    const performanceMetrics = {
      avgLCP: this.calculateAverage(performanceData, 'largest_contentful_paint'),
      avgFID: this.calculateAverage(performanceData, 'first_input_delay'),
      avgCLS: this.calculateAverage(performanceData, 'cumulative_layout_shift')
    }

    return {
      totalSessions,
      totalPageViews,
      totalErrors,
      avgSessionDuration,
      bounceRate,
      topPages,
      errorsByType,
      performanceMetrics
    }
  }

  private calculateAverage(data: any[], field: string): number {
    const values = data.map(d => d[field]).filter(v => v !== null && v !== undefined)
    return values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0
  }

  private calculateTrends(
    sessionsData: any[], 
    errorsData: any[], 
    performanceData: any[], 
    startDate: Date, 
    endDate: Date
  ) {
    const trends = []
    const currentDate = new Date(startDate)

    while (currentDate <= endDate) {
      const dayStart = new Date(currentDate)
      const dayEnd = new Date(currentDate)
      dayEnd.setHours(23, 59, 59, 999)

      const daySessions = sessionsData.filter(s => {
        const sessionDate = new Date(s.start_time)
        return sessionDate >= dayStart && sessionDate <= dayEnd
      }).length

      const dayErrors = errorsData.filter(e => {
        const errorDate = new Date(e.timestamp)
        return errorDate >= dayStart && errorDate <= dayEnd
      }).length

      const dayPerformance = performanceData.filter(p => {
        const perfDate = new Date(p.timestamp)
        return perfDate >= dayStart && perfDate <= dayEnd
      })

      const avgPerformance = dayPerformance.length > 0
        ? this.calculateAverage(dayPerformance, 'largest_contentful_paint')
        : 0

      trends.push({
        date: currentDate.toISOString().split('T')[0],
        sessions: daySessions,
        errors: dayErrors,
        avgPerformance
      })

      currentDate.setDate(currentDate.getDate() + 1)
    }

    return trends
  }

  private generateRecommendations(summary: any, trends: any[]): string[] {
    const recommendations: string[] = []

    // Recomendaciones basadas en performance
    if (summary.performanceMetrics.avgLCP > 4000) {
      recommendations.push('⚡ Optimizar el Largest Contentful Paint (LCP) - actualmente por encima de 4 segundos')
    }

    if (summary.performanceMetrics.avgFID > 300) {
      recommendations.push('🎯 Mejorar el First Input Delay (FID) - la interactividad está por debajo del estándar')
    }

    if (summary.performanceMetrics.avgCLS > 0.25) {
      recommendations.push('📐 Reducir el Cumulative Layout Shift (CLS) - hay demasiado movimiento inesperado en el layout')
    }

    // Recomendaciones basadas en errores
    const errorRate = summary.totalSessions > 0 
      ? (summary.totalErrors / summary.totalSessions) * 100 
      : 0

    if (errorRate > 5) {
      recommendations.push('🚨 Reducir la tasa de errores - actualmente es muy alta para una buena experiencia de usuario')
    }

    // Recomendaciones basadas en bounce rate
    if (summary.bounceRate > 70) {
      recommendations.push('📊 Mejorar el contenido o UX - la tasa de rebote es alta')
    }

    // Recomendaciones basadas en duración de sesión
    if (summary.avgSessionDuration < 60000) { // menos de 1 minuto
      recommendations.push('⏱️ Aumentar el engagement - las sesiones son muy cortas')
    }

    // Recomendaciones basadas en tendencias
    const recentTrends = trends.slice(-7) // últimos 7 días
    const earlyTrends = trends.slice(0, 7) // primeros 7 días

    if (recentTrends.length > 0 && earlyTrends.length > 0) {
      const recentAvgSessions = recentTrends.reduce((sum, t) => sum + t.sessions, 0) / recentTrends.length
      const earlyAvgSessions = earlyTrends.reduce((sum, t) => sum + t.sessions, 0) / earlyTrends.length

      if (recentAvgSessions < earlyAvgSessions * 0.8) {
        recommendations.push('📉 Las sesiones han disminuido - revisar cambios recientes o campañas de marketing')
      }
    }

    if (recommendations.length === 0) {
      recommendations.push('✅ Excelente trabajo - las métricas están dentro de los rangos recomendados')
    }

    return recommendations
  }

  async exportToCSV(reportData: ReportData): Promise<string> {
    const headers = ['Fecha', 'Sesiones', 'Errores', 'Performance Promedio']
    const rows = reportData.trends.map(trend => [
      trend.date,
      trend.sessions.toString(),
      trend.errors.toString(),
      trend.avgPerformance.toFixed(2)
    ])

    const csvContent = [headers, ...rows]
      .map(row => row.join(','))
      .join('\n')

    return csvContent
  }

  async exportToJSON(reportData: ReportData): Promise<string> {
    return JSON.stringify(reportData, null, 2)
  }
}

export const analyticsReportGenerator = new AnalyticsReportGenerator()
