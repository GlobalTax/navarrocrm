import React from 'react'
import { 
  WelcomeStep, 
  ClientTypeStep, 
  BasicInfoStep, 
  BusinessInfoStep, 
  ServicesStep, 
  PreferencesStep, 
  SummaryStep 
} from '@/components/onboarding/steps'

// Tipos para el sistema de onboarding de clientes
export interface OnboardingStep {
  id: string
  title: string
  description: string
  component: React.ComponentType<any>
  isRequired: boolean
  completionCriteria: string[]
  validationRules?: Record<string, any>
}

export interface OnboardingFlow {
  id: string
  name: string
  description: string
  clientType: 'particular' | 'empresa' | 'both'
  steps: OnboardingStep[]
  estimatedDuration: number // en minutos
}

export interface OnboardingProgress {
  currentStepIndex: number
  completedSteps: string[]
  stepData: Record<string, any>
  startedAt: string
  lastActiveAt: string
  isCompleted: boolean
  clientType?: 'particular' | 'empresa'
}

export interface OnboardingState {
  // Estado actual
  isActive: boolean
  currentFlow: OnboardingFlow | null
  progress: OnboardingProgress | null
  
  // Configuración
  autoSave: boolean
  allowSkip: boolean
  showProgress: boolean
  
  // Datos del cliente en construcción
  clientData: Record<string, any>
  
  // Estado de UI
  isLoading: boolean
  error: string | null
}

export interface OnboardingActions {
  // Control del flujo
  startOnboarding: (flowId: string, clientType?: 'particular' | 'empresa') => void
  startOnboardingFromProposal: (proposal: any) => Promise<void>
  pauseOnboarding: () => void
  resumeOnboarding: () => void
  completeOnboarding: () => Promise<void>
  cancelOnboarding: () => void
  
  // Navegación
  goToStep: (stepIndex: number) => void
  nextStep: () => void
  previousStep: () => void
  skipStep: () => void
  
  // Datos
  updateStepData: (stepId: string, data: any) => void
  updateClientData: (data: any) => void
  validateStep: (stepId: string) => boolean
  saveProgress: () => Promise<void>
  
  // Estado
  setError: (error: string | null) => void
  clearError: () => void
}

// Pasos del onboarding
const COMMON_STEPS: OnboardingStep[] = [
  {
    id: 'welcome-step',
    title: 'Bienvenido',
    description: 'Inicio del proceso de incorporación',
    component: WelcomeStep,
    isRequired: false,
    completionCriteria: ['welcomeViewed']
  },
  {
    id: 'client-type-step',
    title: 'Tipo de Cliente',
    description: 'Seleccione si es particular o empresa',
    component: ClientTypeStep,
    isRequired: true,
    completionCriteria: ['clientType']
  },
  {
    id: 'basic-info-step',
    title: 'Información Básica',
    description: 'Datos de contacto principales',
    component: BasicInfoStep,
    isRequired: true,
    completionCriteria: ['name']
  },
  {
    id: 'business-info-step',
    title: 'Información Empresarial',
    description: 'Datos específicos de la empresa',
    component: BusinessInfoStep,
    isRequired: false,
    completionCriteria: ['business_name']
  },
  {
    id: 'services-step',
    title: 'Servicios de Interés',
    description: 'Áreas legales que le interesan',
    component: ServicesStep,
    isRequired: false,
    completionCriteria: []
  },
  {
    id: 'preferences-step',
    title: 'Preferencias',
    description: 'Configuración de comunicación',
    component: PreferencesStep,
    isRequired: false,
    completionCriteria: []
  },
  {
    id: 'summary-step',
    title: 'Resumen',
    description: 'Revisión final de la información',
    component: SummaryStep,
    isRequired: true,
    completionCriteria: []
  }
]

// Flujos predefinidos  
export const ONBOARDING_FLOWS: OnboardingFlow[] = [
  {
    id: 'general',
    name: 'Onboarding General',
    description: 'Proceso completo de incorporación de cliente',
    clientType: 'both',
    steps: COMMON_STEPS,
    estimatedDuration: 15
  },
  {
    id: 'particular',
    name: 'Cliente Particular',
    description: 'Onboarding específico para personas físicas',
    clientType: 'particular',
    steps: COMMON_STEPS.filter(step => step.id !== 'business-info-step'),
    estimatedDuration: 10
  },
  {
    id: 'empresa',
    name: 'Cliente Empresa',
    description: 'Onboarding específico para empresas',
    clientType: 'empresa',
    steps: COMMON_STEPS,
    estimatedDuration: 20
  }
]

// Eventos de analytics
export interface OnboardingEvent {
  type: 'step_started' | 'step_completed' | 'step_skipped' | 'onboarding_completed' | 'onboarding_abandoned'
  stepId?: string
  flowId: string
  timestamp: string
  data?: Record<string, any>
}