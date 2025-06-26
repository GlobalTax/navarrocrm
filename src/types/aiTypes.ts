
export interface EnhancedAITool {
  id: string
  name: string
  description: string
  category: string
  difficulty: 'basic' | 'intermediate' | 'advanced'
  isEnabled: boolean
  usageCount: number
  lastUsed?: Date
  estimatedTime: number // en minutos
  successRate: number
  tags: string[]
  dependencies?: string[]
  icon?: any
  useCases?: string[]
  isPopular?: boolean
  timeToUse?: string
  usedBy?: number
  component?: any
}

export interface AIWorkflow {
  id: string
  name: string
  description: string
  steps: AIWorkflowStep[]
  estimatedTime: number
  category: string
  isTemplate: boolean
  createdBy: string
  createdAt: Date
  tags: string[]
  usageCount: number
  lastUsed?: Date
  successRate: number
}

export interface AIWorkflowStep {
  id: string
  toolId: string
  order: number
  parameters: Record<string, any>
  description: string
  estimatedTime: number
  dependencies?: string[]
}

export interface AIAnalytics {
  totalUsage: number
  mostUsedTools: EnhancedAITool[]
  averageTimePerTool: number
  successRate: number
  userEfficiency: number
  workflowsCreated: number
  timeScheduled: number
  productivityGains: number
  weeklyTrends: {
    week: string
    usage: number
    efficiency: number
  }[]
  categoryBreakdown: {
    category: string
    usage: number
    tools: number
  }[]
}

export interface AIRecommendation {
  id: string
  type: 'tool' | 'workflow' | 'optimization'
  title: string
  description: string
  confidence: number
  estimatedBenefit: string
  actionRequired: string
  toolId?: string
  workflowId?: string
}

export interface AIUsageSession {
  id: string
  userId: string
  startTime: Date
  endTime?: Date
  toolsUsed: string[]
  workflowsExecuted: string[]
  totalTime: number
  successfulOperations: number
  failedOperations: number
}

export interface WorkflowTemplate {
  id: string
  name: string
  description: string
  category: string
  difficulty: 'basic' | 'intermediate' | 'advanced'
  estimatedTime: number
  steps: Omit<AIWorkflowStep, 'id'>[]
  tags: string[]
  popularity: number
  createdBy: 'system' | 'user'
}
