
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { useApp } from '@/contexts/AppContext'

interface AnalyticsData {
  totalCases: number
  activeCases: number
  completedCases: number
  totalContacts: number
  activeProposals: number
  wonProposals: number
  totalRevenue: number
  avgDealSize: number
  conversionRate: number
  topPerformingAreas: Array<{
    name: string
    count: number
    revenue: number
  }>
  casesByStatus: Array<{
    status: string
    count: number
  }>
  monthlyTrends: Array<{
    month: string
    cases: number
    contacts: number
    proposals: number
    revenue: number
  }>
}

export const useIntelligentAnalytics = () => {
  const { user } = useApp()

  const { data: analytics, isLoading, error } = useQuery({
    queryKey: ['intelligent-analytics', user?.org_id],
    queryFn: async (): Promise<AnalyticsData> => {
      if (!user?.org_id) {
        return {
          totalCases: 0,
          activeCases: 0,
          completedCases: 0,
          totalContacts: 0,
          activeProposals: 0,
          wonProposals: 0,
          totalRevenue: 0,
          avgDealSize: 0,
          conversionRate: 0,
          topPerformingAreas: [],
          casesByStatus: [],
          monthlyTrends: []
        }
      }

      try {
        // Obtener datos básicos incluyendo suscripciones
        const [casesData, contactsData, proposalsData, subscriptionsData] = await Promise.all([
          supabase
            .from('cases')
            .select('id, status, practice_area, created_at, date_closed'),
          supabase
            .from('contacts')
            .select('id, created_at'),
          supabase
            .from('proposals')
            .select('id, status, total_amount, created_at, accepted_at'),
          supabase
            .from('outgoing_subscriptions')
            .select('id, amount, billing_cycle, category, status, created_at')
        ])

        if (casesData.error) throw casesData.error
        if (contactsData.error) throw contactsData.error  
        if (proposalsData.error) throw proposalsData.error

        const cases = casesData.data || []
        const contacts = contactsData.data || []
        const proposals = proposalsData.data || []

        // Calcular métricas básicas
        const totalCases = cases.length
        const activeCases = cases.filter(c => c.status === 'open').length
        const completedCases = cases.filter(c => c.status === 'closed').length
        const totalContacts = contacts.length
        const activeProposals = proposals.filter(p => ['sent', 'viewed'].includes(p.status)).length
        const wonProposals = proposals.filter(p => p.status === 'accepted').length

        // Calcular métricas de ingresos
        const totalRevenue = proposals
          .filter(p => p.status === 'accepted')
          .reduce((sum, p) => sum + (p.total_amount || 0), 0)
        
        const avgDealSize = wonProposals > 0 ? totalRevenue / wonProposals : 0
        const conversionRate = proposals.length > 0 ? (wonProposals / proposals.length) * 100 : 0

        // Áreas con mejor rendimiento
        const areaPerformance = cases.reduce((acc, case_item) => {
          const area = case_item.practice_area || 'General'
          if (!acc[area]) {
            acc[area] = { count: 0, revenue: 0 }
          }
          acc[area].count++
          return acc
        }, {} as Record<string, { count: number; revenue: number }>)

        const topPerformingAreas = Object.entries(areaPerformance)
          .map(([name, data]) => ({ name, ...data }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 5)

        // Cases por estado
        const statusCounts = cases.reduce((acc, case_item) => {
          const status = case_item.status || 'unknown'
          acc[status] = (acc[status] || 0) + 1
          return acc
        }, {} as Record<string, number>)

        const casesByStatus = Object.entries(statusCounts)
          .map(([status, count]) => ({ status, count }))

        // Tendencias mensuales (últimos 6 meses)
        const monthlyTrends = []
        for (let i = 5; i >= 0; i--) {
          const date = new Date()
          date.setMonth(date.getMonth() - i)
          const monthStart = new Date(date.getFullYear(), date.getMonth(), 1)
          const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0)

          const monthCases = cases.filter(c => {
            const created = new Date(c.created_at)
            return created >= monthStart && created <= monthEnd
          }).length

          const monthContacts = contacts.filter(c => {
            const created = new Date(c.created_at)
            return created >= monthStart && created <= monthEnd
          }).length

          const monthProposals = proposals.filter(p => {
            const created = new Date(p.created_at)
            return created >= monthStart && created <= monthEnd
          })

          const monthRevenue = monthProposals
            .filter(p => p.status === 'accepted')
            .reduce((sum, p) => sum + (p.total_amount || 0), 0)

          monthlyTrends.push({
            month: date.toLocaleDateString('es-ES', { month: 'short', year: 'numeric' }),
            cases: monthCases,
            contacts: monthContacts,
            proposals: monthProposals.length,
            revenue: monthRevenue
          })
        }

        return {
          totalCases,
          activeCases,
          completedCases,
          totalContacts,
          activeProposals,
          wonProposals,
          totalRevenue,
          avgDealSize,
          conversionRate,
          topPerformingAreas,
          casesByStatus,
          monthlyTrends
        }

      } catch (error) {
        console.error('Error fetching analytics:', error)
        throw error
      }
    },
    enabled: !!user?.org_id,
  })

  return {
    analytics: analytics || {
      totalCases: 0,
      activeCases: 0,
      completedCases: 0,
      totalContacts: 0,
      activeProposals: 0,
      wonProposals: 0,
      totalRevenue: 0,
      avgDealSize: 0,
      conversionRate: 0,
      topPerformingAreas: [],
      casesByStatus: [],
      monthlyTrends: []
    },
    isLoading,
    error
  }
}
