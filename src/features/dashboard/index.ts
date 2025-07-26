/**
 * Dashboard Feature Module
 * 
 * Panel principal y métricas del sistema
 */

// Components
export { default as DashboardPage } from './pages/DashboardPage'
export { DashboardMetrics } from './components/DashboardMetrics'
export { QuickActions } from './components/QuickActions'
export { RecentActivity } from './components/RecentActivity'

// Hooks - Data Layer
export { useDashboardQueries } from './hooks/data/useDashboardQueries'
export { useMetricsData } from './hooks/data/useMetricsData'

// Hooks - UI Layer
export { useDashboardState } from './hooks/ui/useDashboardState'
export { useWidgetConfiguration } from './hooks/ui/useWidgetConfiguration'

// Services & DAL
export { dashboardService } from './services/dashboardService'
export { metricsDAL } from './dal/metricsDAL'

// Types
export type {
  DashboardMetrics as DashboardMetricsType,
  DashboardWidget,
  MetricData,
  QuickAction
} from './types'
