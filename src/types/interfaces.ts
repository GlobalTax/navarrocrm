
// Interfaces para AI Assistant
export interface AIAction {
  type: 'navigate' | 'create_client' | 'search_cases'
  payload?: string | object
}

export interface BusinessInsight {
  summary: string
  kpis: {
    totalRevenue: number
    totalClients: number
    totalCases: number
    activeProjects: number
  }
  revenueChart: Array<{
    month: string
    revenue: number
    trend: 'up' | 'down' | 'stable'
  }>
  clientChurnRisk: Array<{
    id: string
    name: string
    riskLevel: 'high' | 'medium' | 'low'
    reason: string
  }>
  casesProfitability: Array<{
    type: string
    profit: number
    cases: number
  }>
  growthOpportunities: Array<{
    title: string
    description: string
    effort: 'low' | 'medium' | 'high'
    impact: 'low' | 'medium' | 'high'
  }>
  risks: Array<{
    category: string
    description: string
    severity: 'low' | 'medium' | 'high'
    recommendation: string
  }>
}

export interface ComplianceResult {
  overallScore: number
  categories: Array<{
    name: string
    score: number
    status: 'compliant' | 'warning' | 'critical'
    issues: number
  }>
  criticalIssues: Array<{
    severity: 'high' | 'medium' | 'low'
    category: string
    description: string
    recommendation: string
    deadline?: string
  }>
  upcomingDeadlines: Array<{
    type: string
    description: string
    date: string
    daysLeft: number
    priority: 'urgent' | 'important' | 'normal'
  }>
  recommendations: string[]
}

export interface TimeOptimizationResult {
  currentEfficiency: number
  optimizedSchedule: Array<{
    task: string
    originalTime: number
    optimizedTime: number
    priority: 'high' | 'medium' | 'low'
  }>
  recommendations: Array<{
    type: string
    title: string
    description: string
    impact: 'high' | 'medium' | 'low'
    effort: 'low' | 'medium' | 'high'
  }>
  timeDistribution: Array<{
    category: string
    hours: number
    percentage: number
  }>
  potentialSavings: number
}

// Interfaces para Collaboration Hub
export interface ActiveCase {
  id: string
  title: string
  clientName: string
  clientType: 'empresa' | 'particular'
  status: 'activo' | 'pendiente' | 'cerrado'
  unreadCount: number
}

export interface TeamMember {
  id: string
  name: string
  role: string
  status: 'online' | 'offline' | 'busy'
  avatar: string
}

// Interfaces para Document Generator
export interface TemplateVariable {
  name: string
  type: 'text' | 'number' | 'date' | 'boolean'
  required?: boolean
  defaultValue?: unknown
}

// Interfaces para Proposals
export interface ProposalData {
  id: string
  title: string
  description: string
  status: 'draft' | 'sent' | 'accepted' | 'rejected'
  client_id: string
  created_at: string
  updated_at: string
}

// Interface para Network Status
export interface NetworkInfo {
  isOnline: boolean
  connectionType: 'wifi' | 'cellular' | 'ethernet' | 'unknown'
  effectiveType: 'slow-2g' | '2g' | '3g' | '4g' | 'unknown'
  downlink: number
  rtt: number
  saveData: boolean
  reconnectAttempts: number
  timeSinceLastOnline: number | null
}

// Interfaces para validación
export interface ValidationError {
  row: number
  field: string
  message: string
}
