
import { UserRole } from '@/contexts/types'

export interface DashboardPermissions {
  canViewFinancialMetrics: boolean
  canViewTeamMetrics: boolean
  canViewAllClients: boolean
  canViewRevenue: boolean
  canViewBillingData: boolean
}

export const getDashboardPermissions = (userRole?: UserRole): DashboardPermissions => {
  switch (userRole) {
    case 'partner':
    case 'area_manager':
      return {
        canViewFinancialMetrics: true,
        canViewTeamMetrics: true,
        canViewAllClients: true,
        canViewRevenue: true,
        canViewBillingData: true
      }
    
    case 'finance':
      return {
        canViewFinancialMetrics: true,
        canViewTeamMetrics: false,
        canViewAllClients: true,
        canViewRevenue: true,
        canViewBillingData: true
      }
    
    case 'senior':
      return {
        canViewFinancialMetrics: false,
        canViewTeamMetrics: true,
        canViewAllClients: true,
        canViewRevenue: false,
        canViewBillingData: false
      }
    
    case 'junior':
    default:
      return {
        canViewFinancialMetrics: false,
        canViewTeamMetrics: false,
        canViewAllClients: false,
        canViewRevenue: false,
        canViewBillingData: false
      }
  }
}

export const getRoleDisplayName = (role?: UserRole): string => {
  switch (role) {
    case 'partner': return 'Partner'
    case 'area_manager': return 'Area Manager'
    case 'senior': return 'Senior'
    case 'junior': return 'Junior'
    case 'finance': return 'Finance'
    default: return 'Usuario'
  }
}
