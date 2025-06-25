
export interface DashboardStats {
  totalCases: number
  activeCases: number
  totalContacts: number
  totalTimeEntries: number
  totalBillableHours: number
  totalNonBillableHours: number
  thisMonthCases: number
  thisMonthContacts: number
  thisMonthHours: number
}

export interface QuickStats {
  todayHours: number
  weekHours: number
  monthHours: number
  activeClients: number
}

export interface PerformanceData {
  month: string
  horas: number
  facturado: number
  objetivo: number
}

export interface RecentActivity {
  id: string
  type: 'case' | 'task' | 'time_entry' | 'client' | 'proposal'
  title: string
  description: string
  timestamp: Date
  user: string
}

export interface DashboardData {
  quickStats: QuickStats
  recentActivity: RecentActivity[]
  performanceData: PerformanceData[]
  upcomingTasks: Array<{
    id: string
    title: string
    dueDate: Date
    priority: 'low' | 'medium' | 'high' | 'urgent'
    case?: string
  }>
}
