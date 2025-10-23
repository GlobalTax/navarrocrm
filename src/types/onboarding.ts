/**
 * Tipos para el sistema de onboarding de CLIENTES
 * Este archivo define las interfaces para el proceso de incorporación de nuevos clientes
 */

import { ReactElement } from 'react'

// Definición de un paso en el onboarding
export interface OnboardingStep {
  id: string
  title: string
  description: string
  component: ReactElement | (() => ReactElement)
  isRequired: boolean
  validationRules?: {
    requiredFields?: string[]
    customValidation?: (data: any) => boolean | string
  }
}

// Definición de un flujo de onboarding completo
export interface OnboardingFlow {
  id: string
  name: string
  description: string
  allowedClientTypes?: ('particular' | 'empresa')[]
  steps: OnboardingStep[]
}

// Progreso actual del onboarding
export interface OnboardingProgress {
  currentStepIndex: number
  completedSteps: string[]
  stepData: Record<string, any>
  startedAt: string
  lastActiveAt: string
  isCompleted: boolean
  clientType?: 'particular' | 'empresa'
}

// Estado completo del onboarding
export interface OnboardingState {
  isActive: boolean
  currentFlow: OnboardingFlow | null
  progress: OnboardingProgress | null
  autoSave: boolean
  allowSkip: boolean
  showProgress: boolean
  clientData: Record<string, any>
  isLoading: boolean
  error: string | null
}

// Acciones disponibles para el onboarding
export interface OnboardingActions {
  startOnboarding: (flowId: string, clientType?: 'particular' | 'empresa') => void
  startOnboardingFromProposal: (proposal: any) => Promise<void>
  pauseOnboarding: () => void
  resumeOnboarding: () => void
  completeOnboarding: () => Promise<void>
  cancelOnboarding: () => void
  goToStep: (stepIndex: number) => void
  nextStep: () => void
  previousStep: () => void
  skipStep: () => void
  updateStepData: (stepId: string, data: any) => void
  updateClientData: (data: any) => void
  validateStep: (stepId: string) => boolean
  saveProgress: () => Promise<void>
  setError: (error: string | null) => void
  clearError: () => void
}

// Flujos de onboarding predefinidos (solo para clientes)
export const ONBOARDING_FLOWS: OnboardingFlow[] = [
  {
    id: 'general',
    name: 'Onboarding General',
    description: 'Proceso de incorporación estándar para nuevos clientes',
    steps: []
  },
  {
    id: 'particular',
    name: 'Cliente Particular',
    description: 'Incorporación específica para clientes particulares',
    allowedClientTypes: ['particular'],
    steps: []
  },
  {
    id: 'empresa',
    name: 'Cliente Empresa',
    description: 'Incorporación específica para empresas',
    allowedClientTypes: ['empresa'],
    steps: []
  }
]

// Evento de onboarding para tracking
export interface OnboardingEvent {
  type: 'step_completed' | 'step_skipped' | 'flow_completed' | 'flow_cancelled'
  flowId: string
  stepId?: string
  timestamp: string
  metadata?: Record<string, any>
}
