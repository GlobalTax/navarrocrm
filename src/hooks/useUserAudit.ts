
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { useApp } from '@/contexts/AppContext'

export interface UserAuditEntry {
  id: string
  org_id: string
  target_user_id: string
  action_by: string
  action_type: string
  old_value?: any
  new_value?: any
  details?: string
  created_at: string
}

export const useUserAudit = () => {
  const { user } = useApp()

  const { data: auditLog = [], isLoading } = useQuery({
    queryKey: ['user-audit', user?.org_id],
    queryFn: async () => {
      if (!user?.org_id) return []
      
      const { data, error } = await supabase
        .from('user_audit_log')
        .select('*')
        .eq('org_id', user.org_id)
        .order('created_at', { ascending: false })
        .limit(100)

      if (error) throw error
      return data || []
    },
    enabled: !!user?.org_id,
  })

  const getActionTypeLabel = (actionType: string) => {
    const labels = {
      role_change: 'Cambio de rol',
      permission_grant: 'Permiso otorgado',
      permission_revoke: 'Permiso revocado',
      invitation_sent: 'Invitación enviada',
      user_deleted: 'Usuario eliminado',
      user_activated: 'Usuario activado'
    }
    return labels[actionType as keyof typeof labels] || actionType
  }

  return {
    auditLog,
    isLoading,
    getActionTypeLabel
  }
}
