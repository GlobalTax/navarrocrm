
import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useApp } from '@/contexts/AppContext'

export interface PredictiveInsight {
  id: string
  type: 'revenue_prediction' | 'client_churn' | 'workload_optimization' | 'opportunity_detection'
  title: string
  description: string
  confidence: number
  impact: 'high' | 'medium' | 'low'
  actionable: boolean
  suggestions: string[]
  data: any
}

export interface PerformanceMetric {
  metric: string
  current: number
  previous: number
  trend: 'up' | 'down' | 'stable'
  percentage_change: number
  target?: number
}

export const useIntelligentAnalytics = () => {
  const { user } = useApp()
  const [insights, setInsights] = useState<PredictiveInsight[]>([])
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // Generate predictive insights
  const generateInsights = async () => {
    if (!user?.org_id) return

    setIsLoading(true)
    try {
      const revenueInsight = await generateRevenueInsight()
      const churnInsight = await generateChurnInsight()
      const workloadInsight = await generateWorkloadInsight()
      const opportunityInsight = await generateOpportunityInsight()

      setInsights([
        revenueInsight,
        churnInsight,
        workloadInsight,
        opportunityInsight
      ].filter(Boolean) as PredictiveInsight[])
    } catch (error) {
      console.error('Error generating insights:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const generateRevenueInsight = async (): Promise<PredictiveInsight | null> => {
    const { data: proposals } = await supabase
      .from('proposals')
      .select('total_amount, status, created_at')
      .eq('org_id', user?.org_id)
      .gte('created_at', new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString())

    if (!proposals?.length) return null

    const totalRevenue = proposals
      .filter(p => p.status === 'won')
      .reduce((sum, p) => sum + (p.total_amount || 0), 0)

    const avgMonthlyRevenue = totalRevenue / 3
    const projectedRevenue = avgMonthlyRevenue * 12

    return {
      id: 'revenue_insight',
      type: 'revenue_prediction',
      title: 'Proyección de Ingresos Anuales',
      description: `Basado en los últimos 3 meses, proyectamos ingresos anuales de €${projectedRevenue.toLocaleString()}`,
      confidence: 0.75,
      impact: 'high',
      actionable: true,
      suggestions: [
        'Incrementar propuestas comerciales en un 20%',
        'Revisar precios de servicios principales',
        'Implementar seguimiento más frecuente de propuestas'
      ],
      data: { avgMonthlyRevenue, projectedRevenue, totalRevenue }
    }
  }

  const generateChurnInsight = async (): Promise<PredictiveInsight | null> => {
    const { data: clients } = await supabase
      .from('clients')
      .select(`
        *,
        cases:cases(created_at, status),
        proposals:proposals(created_at, status)
      `)
      .eq('org_id', user?.org_id)

    if (!clients?.length) return null

    const sixMonthsAgo = new Date(Date.now() - 180 * 24 * 60 * 60 * 1000)
    const inactiveClients = clients.filter(client => {
      const lastActivity = Math.max(
        ...client.cases.map(c => new Date(c.created_at).getTime()),
        ...client.proposals.map(p => new Date(p.created_at).getTime()),
        0
      )
      return lastActivity < sixMonthsAgo.getTime()
    })

    if (inactiveClients.length === 0) return null

    const churnRate = (inactiveClients.length / clients.length) * 100

    return {
      id: 'churn_insight',
      type: 'client_churn',
      title: `Riesgo de Pérdida de Clientes: ${churnRate.toFixed(1)}%`,
      description: `${inactiveClients.length} clientes no han tenido actividad en los últimos 6 meses`,
      confidence: 0.85,
      impact: churnRate > 20 ? 'high' : 'medium',
      actionable: true,
      suggestions: [
        'Contactar clientes inactivos con ofertas especiales',
        'Implementar programa de seguimiento automático',
        'Crear newsletter mensual con actualizaciones legales'
      ],
      data: { inactiveClients: inactiveClients.length, totalClients: clients.length, churnRate }
    }
  }

  const generateWorkloadInsight = async (): Promise<PredictiveInsight | null> => {
    const { data: tasks } = await supabase
      .from('tasks')
      .select(`
        *,
        task_assignments:task_assignments(user_id)
      `)
      .eq('org_id', user?.org_id)
      .in('status', ['pending', 'in_progress'])

    if (!tasks?.length) return null

    // Calculate workload distribution
    const userWorkload: Record<string, number> = {}
    tasks.forEach(task => {
      task.task_assignments.forEach(assignment => {
        userWorkload[assignment.user_id] = (userWorkload[assignment.user_id] || 0) + (task.estimated_hours || 1)
      })
    })

    const workloadValues = Object.values(userWorkload)
    const avgWorkload = workloadValues.reduce((a, b) => a + b, 0) / workloadValues.length
    const maxWorkload = Math.max(...workloadValues)
    const imbalance = maxWorkload - avgWorkload

    return {
      id: 'workload_insight',
      type: 'workload_optimization',
      title: 'Optimización de Carga de Trabajo',
      description: `Detectado desequilibrio en la distribución de trabajo (${imbalance.toFixed(1)}h de diferencia)`,
      confidence: 0.9,
      impact: imbalance > 20 ? 'high' : 'medium',
      actionable: true,
      suggestions: [
        'Redistribuir tareas entre miembros del equipo',
        'Considerar contratación de personal adicional',
        'Implementar sistema de asignación automática'
      ],
      data: { userWorkload, avgWorkload, maxWorkload, imbalance }
    }
  }

  const generateOpportunityInsight = async (): Promise<PredictiveInsight | null> => {
    const { data: clients } = await supabase
      .from('clients')
      .select(`
        *,
        proposals:proposals(total_amount, status, created_at)
      `)
      .eq('org_id', user?.org_id)

    if (!clients?.length) return null

    // Find clients with successful proposals but no recent activity
    const opportunityClients = clients.filter(client => {
      const hasWonProposals = client.proposals.some(p => p.status === 'won')
      const recentActivity = client.proposals.some(p => 
        new Date(p.created_at).getTime() > Date.now() - 180 * 24 * 60 * 60 * 1000
      )
      return hasWonProposals && !recentActivity
    })

    if (opportunityClients.length === 0) return null

    const potentialRevenue = opportunityClients.reduce((sum, client) => {
      const avgProposal = client.proposals
        .filter(p => p.status === 'won')
        .reduce((avg, p) => avg + (p.total_amount || 0), 0) / client.proposals.length
      return sum + avgProposal
    }, 0)

    return {
      id: 'opportunity_insight',
      type: 'opportunity_detection',
      title: `Oportunidades de Cross-selling: €${potentialRevenue.toLocaleString()}`,
      description: `${opportunityClients.length} clientes con historial positivo sin actividad reciente`,
      confidence: 0.7,
      impact: 'high',
      actionable: true,
      suggestions: [
        'Contactar clientes para servicios adicionales',
        'Ofrecer paquetes de servicios complementarios',
        'Programar revisiones anuales automáticas'
      ],
      data: { opportunityClients: opportunityClients.length, potentialRevenue }
    }
  }

  // Calculate performance metrics
  const calculateMetrics = async () => {
    if (!user?.org_id) return

    const currentMonth = new Date()
    const previousMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1)
    const currentMonthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1)

    const metrics: PerformanceMetric[] = []

    // Revenue metrics
    const { data: currentRevenue } = await supabase
      .from('proposals')
      .select('total_amount')
      .eq('org_id', user.org_id)
      .eq('status', 'won')
      .gte('accepted_at', currentMonthStart.toISOString())

    const { data: previousRevenue } = await supabase
      .from('proposals')
      .select('total_amount')
      .eq('org_id', user.org_id)
      .eq('status', 'won')
      .gte('accepted_at', previousMonth.toISOString())
      .lt('accepted_at', currentMonthStart.toISOString())

    const currentTotal = currentRevenue?.reduce((sum, p) => sum + (p.total_amount || 0), 0) || 0
    const previousTotal = previousRevenue?.reduce((sum, p) => sum + (p.total_amount || 0), 0) || 0

    if (previousTotal > 0) {
      metrics.push({
        metric: 'Ingresos Mensuales',
        current: currentTotal,
        previous: previousTotal,
        trend: currentTotal > previousTotal ? 'up' : currentTotal < previousTotal ? 'down' : 'stable',
        percentage_change: ((currentTotal - previousTotal) / previousTotal) * 100,
        target: previousTotal * 1.1 // 10% growth target
      })
    }

    setMetrics(metrics)
  }

  useEffect(() => {
    if (user?.org_id) {
      generateInsights()
      calculateMetrics()
    }
  }, [user?.org_id])

  return {
    insights,
    metrics,
    isLoading,
    refreshInsights: generateInsights,
    refreshMetrics: calculateMetrics
  }
}
