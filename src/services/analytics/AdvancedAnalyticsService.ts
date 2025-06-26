
import { supabase } from '@/integrations/supabase/client'
import { 
  AnalyticsMetrics, 
  PredictiveInsights, 
  CustomReport, 
  HistoricalMetric,
  AnalyticsFilter,
  ExportFormat 
} from '@/types/analytics'
import { toast } from 'sonner'

export class AdvancedAnalyticsService {
  private orgId: string

  constructor(orgId: string) {
    this.orgId = orgId
  }

  // ===== MÉTRICAS BÁSICAS =====
  async getDashboardMetrics(filters?: AnalyticsFilter): Promise<AnalyticsMetrics> {
    try {
      const [revenue, cases, clients, productivity, performance] = await Promise.all([
        this.getRevenueMetrics(filters),
        this.getCasesMetrics(filters),
        this.getClientsMetrics(filters),
        this.getProductivityMetrics(filters),
        this.getPerformanceMetrics(filters)
      ])

      const metrics = {
        revenue,
        cases,
        clients,
        productivity,
        performance
      }

      // Guardar métricas en cache
      await this.saveMetricsToCache('dashboard', metrics)
      
      return metrics
    } catch (error) {
      console.error('Error fetching dashboard metrics:', error)
      toast.error('Error al cargar métricas del dashboard')
      throw error
    }
  }

  private async getRevenueMetrics(filters?: AnalyticsFilter) {
    const { data: historicalData } = await supabase
      .rpc('get_historical_revenue', { 
        org_uuid: this.orgId,
        months_back: 6
      })

    if (!historicalData || historicalData.length === 0) {
      return {
        current: 0,
        previous: 0,
        growth: 0,
        mrr: 0,
        arr: 0
      }
    }

    const current = historicalData[historicalData.length - 1]?.revenue || 0
    const previous = historicalData[historicalData.length - 2]?.revenue || 0
    const growth = previous > 0 ? ((current - previous) / previous) * 100 : 0

    // Calcular MRR/ARR basado en propuestas recurrentes activas
    const { data: recurringRevenue } = await supabase
      .from('proposals')
      .select('total_amount, recurring_frequency')
      .eq('org_id', this.orgId)
      .eq('is_recurring', true)
      .eq('status', 'won')

    let mrr = 0
    recurringRevenue?.forEach(proposal => {
      const amount = proposal.total_amount || 0
      switch (proposal.recurring_frequency) {
        case 'monthly':
          mrr += amount
          break
        case 'quarterly':
          mrr += amount / 3
          break
        case 'yearly':
          mrr += amount / 12
          break
      }
    })

    return {
      current,
      previous,
      growth,
      mrr,
      arr: mrr * 12
    }
  }

  private async getCasesMetrics(filters?: AnalyticsFilter) {
    let query = supabase
      .from('cases')
      .select('status, created_at, date_closed')
      .eq('org_id', this.orgId)

    if (filters?.dateRange) {
      query = query
        .gte('created_at', filters.dateRange.start.toISOString())
        .lte('created_at', filters.dateRange.end.toISOString())
    }

    const { data: cases } = await query

    const total = cases?.length || 0
    const active = cases?.filter(c => ['open', 'in_progress'].includes(c.status)).length || 0
    const closed = cases?.filter(c => c.status === 'closed').length || 0
    const conversionRate = total > 0 ? (closed / total) * 100 : 0

    return {
      total,
      active,
      closed,
      conversionRate
    }
  }

  private async getClientsMetrics(filters?: AnalyticsFilter) {
    const { data: contacts } = await supabase
      .from('contacts')
      .select('created_at, relationship_type')
      .eq('org_id', this.orgId)

    const total = contacts?.length || 0
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    
    const newThisMonth = contacts?.filter(c => 
      new Date(c.created_at) >= startOfMonth
    ).length || 0

    // Calcular churn rate simplificado (5% por defecto)
    const churnRate = 5.0

    // Calcular lifetime value promedio basado en propuestas ganadas
    const { data: wonProposals } = await supabase
      .from('proposals')
      .select('total_amount')
      .eq('org_id', this.orgId)
      .eq('status', 'won')

    const totalRevenue = wonProposals?.reduce((sum, p) => sum + (p.total_amount || 0), 0) || 0
    const lifetimeValue = total > 0 ? totalRevenue / total : 0

    return {
      total,
      new: newThisMonth,
      churnRate,
      lifetimeValue
    }
  }

  private async getProductivityMetrics(filters?: AnalyticsFilter) {
    const { data } = await supabase
      .rpc('calculate_productivity_metrics', { 
        org_uuid: this.orgId 
      })

    if (!data) {
      return {
        hoursTracked: 0,
        billableHours: 0,
        utilizationRate: 0,
        averageCaseTime: 0
      }
    }

    // Calcular tiempo promedio por caso
    const { data: closedCases } = await supabase
      .from('cases')
      .select('created_at, date_closed')
      .eq('org_id', this.orgId)
      .not('date_closed', 'is', null)

    let averageCaseTime = 0
    if (closedCases && closedCases.length > 0) {
      const totalDays = closedCases.reduce((sum, c) => {
        const created = new Date(c.created_at)
        const closed = new Date(c.date_closed)
        return sum + (closed.getTime() - created.getTime()) / (1000 * 60 * 60 * 24)
      }, 0)
      averageCaseTime = totalDays / closedCases.length
    }

    return {
      hoursTracked: data.total_hours || 0,
      billableHours: data.billable_hours || 0,
      utilizationRate: data.utilization_rate || 0,
      averageCaseTime
    }
  }

  private async getPerformanceMetrics(filters?: AnalyticsFilter) {
    const { data: productivityData } = await supabase
      .rpc('calculate_productivity_metrics', { 
        org_uuid: this.orgId 
      })

    return {
      taskCompletionRate: productivityData?.task_completion_rate || 0,
      averageResponseTime: 2.5, // Horas promedio (dato mock)
      clientSatisfaction: 4.2, // Escala 1-5 (dato mock)
      teamEfficiency: 85 // Porcentaje (dato mock)
    }
  }

  // ===== INSIGHTS PREDICTIVOS =====
  async getPredictiveInsights(): Promise<PredictiveInsights> {
    try {
      const [revenueForecast, churnRisk, opportunities, optimization] = await Promise.all([
        this.calculateRevenueForecast(),
        this.analyzeChurnRisk(),
        this.identifyOpportunities(),
        this.optimizeResources()
      ])

      const insights = {
        revenueForecast,
        churnRisk,
        opportunityInsights: opportunities,
        resourceOptimization: optimization
      }

      // Guardar insights en base de datos
      await this.savePredictiveInsights(insights)

      return insights
    } catch (error) {
      console.error('Error generating predictive insights:', error)
      toast.error('Error al generar insights predictivos')
      throw error
    }
  }

  private async calculateRevenueForecast() {
    const { data: historicalData } = await supabase
      .rpc('get_historical_revenue', { 
        org_uuid: this.orgId,
        months_back: 12
      })

    if (!historicalData || historicalData.length < 3) {
      return {
        nextMonth: 0,
        nextQuarter: 0,
        nextYear: 0,
        confidence: 0.5
      }
    }

    // Algoritmo simple de tendencia lineal
    const revenues = historicalData.map(d => d.revenue)
    const avgGrowth = this.calculateAverageGrowthRate(revenues)
    const lastRevenue = revenues[revenues.length - 1] || 0

    const nextMonth = lastRevenue * (1 + avgGrowth)
    const nextQuarter = lastRevenue * Math.pow(1 + avgGrowth, 3)
    const nextYear = lastRevenue * Math.pow(1 + avgGrowth, 12)

    // Calcular confianza basada en la consistencia del crecimiento
    const confidence = this.calculateForecastConfidence(revenues)

    return {
      nextMonth,
      nextQuarter,
      nextYear,
      confidence
    }
  }

  private async analyzeChurnRisk() {
    const { data: riskClients } = await supabase
      .rpc('identify_churn_risk_clients', { 
        org_uuid: this.orgId 
      })

    const highRiskClients = (riskClients || []).map(client => ({
      id: client.client_id,
      name: client.client_name,
      riskScore: client.risk_score,
      riskFactors: client.risk_factors?.filter(Boolean) || [],
      lastActivityDays: client.last_activity_days
    }))

    return {
      highRiskClients,
      riskFactors: [
        'Inactividad prolongada (>60 días)',
        'Bajo valor de cliente (<€1000)',
        'Falta de comunicación reciente',
        'Pocos casos históricos'
      ],
      mitigationStrategies: [
        'Programar llamadas de seguimiento proactivas',
        'Ofrecer servicios complementarios',
        'Implementar programa de fidelización',
        'Mejorar comunicación automatizada'
      ]
    }
  }

  private async identifyOpportunities() {
    const { data: clients } = await supabase
      .from('contacts')
      .select('name, relationship_type')
      .eq('org_id', this.orgId)
      .eq('relationship_type', 'cliente')

    // Identificar oportunidades de cross-sell (simplificado)
    const crossSellOpportunities = clients?.slice(0, 5).map(c => c.name) || []

    return {
      crossSellOpportunities,
      upSellPotential: 15, // 15% de potencial
      marketTrends: [
        'Aumento en demandas laborales (+12%)',
        'Crecimiento en servicios de compliance (+8%)',
        'Mayor demanda de asesoría fiscal (+15%)',
        'Digitalización de procesos legales (+20%)'
      ]
    }
  }

  private async optimizeResources() {
    const { data: users } = await supabase
      .from('users')
      .select('id')
      .eq('org_id', this.orgId)

    const currentStaff = users?.length || 1
    const recommendedStaff = Math.ceil(currentStaff * 1.15) // 15% más personal

    return {
      recommendedStaffing: recommendedStaff,
      workloadDistribution: [
        'Redistribuir casos complejos entre abogados senior',
        'Asignar más tareas administrativas a personal junior',
        'Optimizar horarios según carga de trabajo',
        'Implementar rotación de especialidades'
      ],
      efficiencyGaps: [
        'Subutilización de herramientas de IA (35%)',
        'Falta de automatización en tareas repetitivas',
        'Comunicación interna ineficiente',
        'Gestión documental manual'
      ]
    }
  }

  // ===== REPORTES PERSONALIZADOS =====
  async createCustomReport(reportData: Omit<CustomReport, 'id' | 'createdAt' | 'updatedAt'>): Promise<CustomReport> {
    try {
      const { data, error } = await supabase
        .from('custom_reports')
        .insert({
          org_id: this.orgId,
          name: reportData.name,
          description: reportData.description,
          metrics: reportData.metrics,
          filters: reportData.filters,
          schedule: reportData.schedule,
          recipients: reportData.recipients,
          is_active: reportData.isActive,
          last_generated: reportData.lastGenerated?.toISOString(),
          next_generation: reportData.nextGeneration?.toISOString(),
          created_by: reportData.createdBy
        })
        .select()
        .single()

      if (error) throw error

      toast.success('Reporte personalizado creado exitosamente')
      return this.mapDatabaseReportToCustomReport(data)
    } catch (error) {
      console.error('Error creating custom report:', error)
      toast.error('Error al crear reporte personalizado')
      throw error
    }
  }

  async getCustomReports(): Promise<CustomReport[]> {
    try {
      const { data, error } = await supabase
        .from('custom_reports')
        .select('*')
        .eq('org_id', this.orgId)
        .eq('is_active', true)
        .order('created_at', { ascending: false })

      if (error) throw error

      return (data || []).map(this.mapDatabaseReportToCustomReport)
    } catch (error) {
      console.error('Error fetching custom reports:', error)
      toast.error('Error al cargar reportes personalizados')
      return []
    }
  }

  // ===== UTILIDADES =====
  private calculateAverageGrowthRate(values: number[]): number {
    if (values.length < 2) return 0.05 // 5% por defecto

    let totalGrowth = 0
    let validPeriods = 0

    for (let i = 1; i < values.length; i++) {
      if (values[i - 1] > 0) {
        totalGrowth += (values[i] - values[i - 1]) / values[i - 1]
        validPeriods++
      }
    }

    return validPeriods > 0 ? totalGrowth / validPeriods : 0.05
  }

  private calculateForecastConfidence(values: number[]): number {
    if (values.length < 3) return 0.5

    // Calcular variabilidad en el crecimiento
    const growthRates = []
    for (let i = 1; i < values.length; i++) {
      if (values[i - 1] > 0) {
        growthRates.push((values[i] - values[i - 1]) / values[i - 1])
      }
    }

    if (growthRates.length === 0) return 0.5

    const avgGrowth = growthRates.reduce((sum, rate) => sum + rate, 0) / growthRates.length
    const variance = growthRates.reduce((sum, rate) => sum + Math.pow(rate - avgGrowth, 2), 0) / growthRates.length
    const stdDev = Math.sqrt(variance)

    // Confianza inversamente proporcional a la desviación estándar
    return Math.max(0.3, Math.min(0.95, 0.85 - stdDev * 2))
  }

  private async saveMetricsToCache(type: string, metrics: any): Promise<void> {
    try {
      await supabase
        .from('analytics_metrics')
        .upsert({
          org_id: this.orgId,
          metric_type: type,
          metric_data: metrics
        })
    } catch (error) {
      console.warn('Failed to cache metrics:', error)
    }
  }

  private async savePredictiveInsights(insights: PredictiveInsights): Promise<void> {
    try {
      const insightTypes = [
        { type: 'revenue_forecast', data: insights.revenueForecast },
        { type: 'churn_risk', data: insights.churnRisk },
        { type: 'opportunities', data: insights.opportunityInsights },
        { type: 'resource_optimization', data: insights.resourceOptimization }
      ]

      for (const insight of insightTypes) {
        await supabase
          .from('predictive_insights')
          .upsert({
            org_id: this.orgId,
            insight_type: insight.type,
            insight_data: insight.data,
            confidence_score: insight.type === 'revenue_forecast' ? insights.revenueForecast.confidence : 0.8
          })
      }
    } catch (error) {
      console.warn('Failed to save predictive insights:', error)
    }
  }

  private mapDatabaseReportToCustomReport(data: any): CustomReport {
    return {
      id: data.id,
      name: data.name,
      description: data.description,
      metrics: data.metrics || [],
      filters: data.filters || {},
      schedule: data.schedule,
      recipients: data.recipients || [],
      isActive: data.is_active,
      lastGenerated: data.last_generated ? new Date(data.last_generated) : undefined,
      nextGeneration: data.next_generation ? new Date(data.next_generation) : undefined,
      createdBy: data.created_by,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    }
  }
}
