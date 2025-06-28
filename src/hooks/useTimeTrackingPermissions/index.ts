
import { useMemo } from 'react'
import { useApp } from '@/contexts/AppContext'
import { useTeams } from '@/hooks/useTeams'
import { useUsers } from '@/hooks/useUsers'
import {
  calculatePartnerPermissions,
  calculateAreaManagerPermissions,
  calculateSeniorPermissions,
  calculatePersonalPermissions,
  getDefaultPermissions
} from './utils'
import type { TimeTrackingAccess, PermissionsContext } from './types'

// Re-export types for backward compatibility
export type { TimeTrackingAccess }

export const useTimeTrackingPermissions = (): TimeTrackingAccess => {
  const { user } = useApp()
  const { teams, memberships } = useTeams()
  const { users } = useUsers()

  return useMemo(() => {
    if (!user) {
      return getDefaultPermissions()
    }

    const context: PermissionsContext = {
      user,
      teams,
      memberships,
      users
    }

    // Partner - ve todo (equivalente a super admin)
    if (user.role === 'partner') {
      return calculatePartnerPermissions(context)
    }

    // Area Manager - ve su departamento
    if (user.role === 'area_manager') {
      return calculateAreaManagerPermissions(context)
    }

    // Senior - puede liderar equipos
    if (user.role === 'senior') {
      return calculateSeniorPermissions(context)
    }

    // Usuario regular - solo ve sus propias horas
    return calculatePersonalPermissions(context)
  }, [user, teams, memberships, users])
}
