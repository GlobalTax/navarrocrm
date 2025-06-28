
export interface TimeMetrics {
  totalHours: number
  billableHours: number
  utilizationRate: number
  totalEntries: number
  avgEntryDuration: number
}

export interface TeamMemberMetrics {
  userId: string
  userName: string
  hours: number
  billableHours: number
  utilization: number
}

export interface TeamMetrics {
  id: string
  name: string
  color: string
  hours: number
  utilization: number
  members: number
  memberMetrics: TeamMemberMetrics[]
}

export type MetricsPeriod = 'today' | 'week' | 'month'
