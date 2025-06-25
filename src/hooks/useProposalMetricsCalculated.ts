
import { useMemo } from 'react'
import type { Proposal } from '@/types/proposals'

export const useProposalMetricsCalculated = (proposals: Proposal[]) => {
  const metrics = useMemo(() => {
    if (!proposals || proposals.length === 0) {
      return {
        totalRevenue: 0,
        totalProposalsSent: 0,
        totalProposalsWon: 0,
        totalProposalsLost: 0,
        averageConversionRate: 0,
        averageDealSize: 0,
        recurringRevenue: 0,
        oneTimeRevenue: 0,
        activeRecurringProposals: 0,
        pendingProposals: 0
      }
    }

    const sentProposals = proposals.filter(p => p.status !== 'draft')
    const wonProposals = proposals.filter(p => p.status === 'won')
    const lostProposals = proposals.filter(p => p.status === 'lost')
    const recurringProposals = proposals.filter(p => p.is_recurring)
    const oneTimeProposals = proposals.filter(p => !p.is_recurring)
    const pendingProposals = proposals.filter(p => ['sent', 'negotiating'].includes(p.status))

    const totalRevenue = wonProposals.reduce((sum, p) => sum + (p.total_amount || 0), 0)
    const recurringRevenue = wonProposals
      .filter(p => p.is_recurring)
      .reduce((sum, p) => sum + (p.total_amount || 0), 0)
    const oneTimeRevenue = wonProposals
      .filter(p => !p.is_recurring)
      .reduce((sum, p) => sum + (p.total_amount || 0), 0)

    const conversionRate = sentProposals.length > 0 
      ? (wonProposals.length / sentProposals.length) * 100 
      : 0

    const averageDealSize = wonProposals.length > 0 
      ? totalRevenue / wonProposals.length 
      : 0

    return {
      totalRevenue,
      totalProposalsSent: sentProposals.length,
      totalProposalsWon: wonProposals.length,
      totalProposalsLost: lostProposals.length,
      averageConversionRate: conversionRate,
      averageDealSize,
      recurringRevenue,
      oneTimeRevenue,
      activeRecurringProposals: recurringProposals.filter(p => p.status === 'won').length,
      pendingProposals: pendingProposals.length
    }
  }, [proposals])

  return metrics
}
