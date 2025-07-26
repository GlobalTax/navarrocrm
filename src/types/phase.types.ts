export type PhaseStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled' | 'on_hold'

export type PhaseApprovalStatus = 'pending' | 'approved' | 'rejected' | 'revision_required'

export interface PhaseTimeline {
  plannedStartDate?: string
  plannedEndDate?: string
  actualStartDate?: string
  actualEndDate?: string
}

export interface PhaseDependency {
  dependsOnPhaseId: string
  dependencyType: 'finish_to_start' | 'start_to_start' | 'finish_to_finish'
}

export interface PhaseProgress {
  completionPercentage: number
  completedTasks: number
  totalTasks: number
  milestonesAchieved: number
  totalMilestones: number
}

export interface PhaseApproval {
  status: PhaseApprovalStatus
  approvedBy?: string
  approvedAt?: string
  comments?: string
  requiredApprovers: string[]
}

export interface PhaseNotification {
  type: 'deadline_approaching' | 'phase_completed' | 'approval_required' | 'milestone_reached'
  recipients: string[]
  message: string
  scheduledFor?: string
}

export interface AdvancedProposalPhase {
  id: string
  name: string
  description: string
  status: PhaseStatus
  timeline: PhaseTimeline
  dependencies: PhaseDependency[]
  progress: PhaseProgress
  approval: PhaseApproval
  services: ProposalService[]
  deliverables: string[]
  paymentPercentage: number
  estimatedHours?: number
  actualHours?: number
  budget: {
    estimated: number
    actual?: number
    variance?: number
  }
  // Enlaces a otros módulos
  caseId?: string
  documentIds: string[]
  teamMembers: string[]
  // Configuración de notificaciones
  notifications: PhaseNotification[]
  // Metadata
  createdBy: string
  createdAt: string
  updatedAt: string
  tags: string[]
  customFields: Record<string, any>
}

export interface ProposalService {
  id: string
  name: string
  description: string
  quantity: number
  unitPrice: number
  total: number
  estimatedHours?: number
  actualHours?: number
  assignedTo?: string[]
}

export interface PhaseTemplate {
  id: string
  name: string
  description: string
  practiceArea: string
  phases: Omit<AdvancedProposalPhase, 'id' | 'createdBy' | 'createdAt' | 'updatedAt'>[]
  isDefault: boolean
  orgId: string
  createdBy: string
  createdAt: string
}

export interface PhaseMetrics {
  totalPhases: number
  completedPhases: number
  onTimeCompletion: number
  averageDuration: number
  budgetVariance: number
  clientSatisfaction?: number
}

export interface PhaseReport {
  phaseId: string
  phaseName: string
  status: PhaseStatus
  progress: PhaseProgress
  timeline: PhaseTimeline
  budget: {
    estimated: number
    actual: number
    variance: number
    variancePercentage: number
  }
  team: {
    memberId: string
    memberName: string
    hoursWorked: number
    tasksCompleted: number
  }[]
  risks: {
    type: 'budget' | 'timeline' | 'quality' | 'resource'
    severity: 'low' | 'medium' | 'high'
    description: string
    mitigation?: string
  }[]
  nextSteps: string[]
}