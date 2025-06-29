
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { useApp } from '@/contexts/AppContext'

export interface ProposalAuditEntry {
  id: string
  proposal_id: string
  org_id: string
  user_id: string | null
  action_type: string
  old_value: any
  new_value: any
  details: string | null
  created_at: string
}

export const useProposalHistory = (proposalId?: string) => {
  const { user } = useApp()

  const { data: historyEntries = [], isLoading, error } = useQuery({
    queryKey: ['proposal-history', user?.org_id, proposalId],
    queryFn: async () => {
      if (!user?.org_id) return []

      let query = supabase
        .from('proposal_audit_log')
        .select(`
          *,
          proposals!inner(title, proposal_number)
        `)
        .eq('org_id', user.org_id)
        .order('created_at', { ascending: false })

      if (proposalId) {
        query = query.eq('proposal_id', proposalId)
      }

      const { data, error } = await query

      if (error) throw error
      return data || []
    },
    enabled: !!user?.org_id
  })

  const getActionLabel = (actionType: string) => {
    const labels: Record<string, string> = {
      'created': 'Creada',
      'status_changed': 'Estado cambiado',
      'amount_changed': 'Importe modificado',
      'sent': 'Enviada',
      'accepted': 'Aceptada',
      'updated': 'Actualizada',
      'deleted': 'Eliminada',
      'duplicated': 'Duplicada',
      'viewed': 'Visualizada'
    }
    return labels[actionType] || actionType
  }

  const getActionIcon = (actionType: string) => {
    const icons: Record<string, string> = {
      'created': '✨',
      'status_changed': '🔄',
      'amount_changed': '💰',
      'sent': '📤',
      'accepted': '✅',
      'updated': '📝',
      'deleted': '🗑️',
      'duplicated': '📄',
      'viewed': '👁️'
    }
    return icons[actionType] || '📋'
  }

  const getStatusChange = (entry: ProposalAuditEntry) => {
    if (entry.action_type === 'status_changed' && entry.old_value && entry.new_value) {
      const oldStatus = entry.old_value.status
      const newStatus = entry.new_value.status
      return { from: oldStatus, to: newStatus }
    }
    return null
  }

  const getAmountChange = (entry: ProposalAuditEntry) => {
    if (entry.action_type === 'amount_changed' && entry.old_value && entry.new_value) {
      const oldAmount = entry.old_value.total_amount
      const newAmount = entry.new_value.total_amount
      return { from: oldAmount, to: newAmount }
    }
    return null
  }

  return {
    historyEntries,
    isLoading,
    error,
    getActionLabel,
    getActionIcon,
    getStatusChange,
    getAmountChange
  }
}
