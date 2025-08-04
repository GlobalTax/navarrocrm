/**
 * Tipos para el módulo de dashboard
 */

export interface DashboardMetrics {
  totalCases: number
  activeCases: number
  totalTimeEntries: number
  totalHours: number
  revenue: number
  recentActivity: ActivityItem[]
}

export interface ActivityItem {
  id: string
  type: 'case_created' | 'time_logged' | 'document_uploaded' | 'task_completed'
  title: string
  description: string
  timestamp: string
  user_name?: string
  case_title?: string
}