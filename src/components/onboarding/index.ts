// Exportaciones del módulo de onboarding
export { OnboardingDialog } from './OnboardingDialog'
export { OnboardingProgress } from './OnboardingProgress'
export { OnboardingNavigation } from './OnboardingNavigation'
export { OnboardingStepContent } from './OnboardingStepContent'
export { OnboardingProvider, useOnboarding } from '@/contexts/OnboardingContext'

// Re-exportar tipos
export type {
  OnboardingStep,
  OnboardingFlow,
  OnboardingProgress as OnboardingProgressType,
  OnboardingState,
  OnboardingActions
} from '@/types/onboarding'