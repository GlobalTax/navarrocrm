
export interface AnalyticsMetrics {
  revenue: {
    current: number
    previous: number
    growth: number
    mrr: number
    arr: number
  }
  cases: {
    total: number
    active: number
    closed: number
    conversionRate: number
  }
  clients: {
    total: number
    new: number
    churnRate: number
    lifetimeValue: number
  }
  productivity: {
    hoursTracked: number
    billableHours: number
    utilizationRate: number
    averageCaseTime: number
  }
  performance: {
    taskCompletionRate: number
    averageResponseTime: number
    clientSatisfaction: number
    teamEfficiency: number
  }
}

export interface PredictiveInsights {
  revenueForecast: {
    nextMonth: number
    nextQuarter: number
    nextYear: number
    confidence: number
  }
  churnRisk: {
    highRiskClients: Array<{
      id: string
      name: string
      riskScore: number
      riskFactors: string[]
      lastActivityDays: number
    }>
    riskFactors: string[]
    mitigationStrategies: string[]
  }
  opportunityInsights: {
    crossSellOpportunities: string[]
    upSellPotential: number
    marketTrends: string[]
  }
  resourceOptimization: {
    recommendedStaffing: number
    workloadDistribution: string[]
    efficiencyGaps: string[]
  }
}

export interface CustomReport {
  id: string
  name: string
  description?: string
  metrics: string[]
  filters: Record<string, any>
  schedule?: 'daily' | 'weekly' | 'monthly'
  recipients: string[]
  isActive: boolean
  lastGenerated?: Date
  nextGeneration?: Date
  createdBy: string
  createdAt: Date
  updatedAt: Date
}

export interface HistoricalMetric {
  id: string
  metricName: string
  metricValue: number
  metricDate: Date
  additionalData?: Record<string, any>
}

export interface AnalyticsFilter {
  dateRange: {
    start: Date
    end: Date
  }
  practiceAreas?: string[]
  clientTypes?: string[]
  status?: string[]
  customFilters?: Record<string, any>
}

export interface ExportFormat {
  type: 'csv' | 'json' | 'excel' | 'pdf'
  includeCharts?: boolean
  customTemplate?: string
}
