import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useApp } from '@/contexts/AppContext'
import { toast } from 'sonner'
import type { OnboardingState, OnboardingActions, OnboardingFlow, OnboardingProgress } from '@/types/onboarding'
import { ONBOARDING_FLOWS } from '@/types/onboarding'

interface OnboardingContextValue extends OnboardingState, OnboardingActions {}

const OnboardingContext = createContext<OnboardingContextValue | undefined>(undefined)

// Estado inicial
const initialState: OnboardingState = {
  isActive: false,
  currentFlow: null,
  progress: null,
  autoSave: true,
  allowSkip: false,
  showProgress: true,
  clientData: {},
  isLoading: false,
  error: null
}

// Reducer para gestionar el estado
type OnboardingAction = 
  | { type: 'START_ONBOARDING'; payload: { flow: OnboardingFlow; clientType?: 'particular' | 'empresa' } }
  | { type: 'PAUSE_ONBOARDING' }
  | { type: 'RESUME_ONBOARDING' }
  | { type: 'COMPLETE_ONBOARDING' }
  | { type: 'CANCEL_ONBOARDING' }
  | { type: 'SET_CURRENT_STEP'; payload: number }
  | { type: 'MARK_STEP_COMPLETED'; payload: string }
  | { type: 'UPDATE_STEP_DATA'; payload: { stepId: string; data: any } }
  | { type: 'UPDATE_CLIENT_DATA'; payload: any }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'LOAD_PROGRESS'; payload: OnboardingProgress }

function onboardingReducer(state: OnboardingState, action: OnboardingAction): OnboardingState {
  switch (action.type) {
    case 'START_ONBOARDING':
      return {
        ...state,
        isActive: true,
        currentFlow: action.payload.flow,
        progress: {
          currentStepIndex: 0,
          completedSteps: [],
          stepData: {},
          startedAt: new Date().toISOString(),
          lastActiveAt: new Date().toISOString(),
          isCompleted: false,
          clientType: action.payload.clientType
        },
        clientData: {},
        error: null
      }

    case 'PAUSE_ONBOARDING':
      return {
        ...state,
        isActive: false
      }

    case 'RESUME_ONBOARDING':
      return {
        ...state,
        isActive: true,
        progress: state.progress ? {
          ...state.progress,
          lastActiveAt: new Date().toISOString()
        } : null
      }

    case 'COMPLETE_ONBOARDING':
      return {
        ...state,
        isActive: false,
        progress: state.progress ? {
          ...state.progress,
          isCompleted: true,
          lastActiveAt: new Date().toISOString()
        } : null
      }

    case 'CANCEL_ONBOARDING':
      return {
        ...initialState
      }

    case 'SET_CURRENT_STEP':
      return {
        ...state,
        progress: state.progress ? {
          ...state.progress,
          currentStepIndex: action.payload,
          lastActiveAt: new Date().toISOString()
        } : null
      }

    case 'MARK_STEP_COMPLETED':
      return {
        ...state,
        progress: state.progress ? {
          ...state.progress,
          completedSteps: [...new Set([...state.progress.completedSteps, action.payload])],
          lastActiveAt: new Date().toISOString()
        } : null
      }

    case 'UPDATE_STEP_DATA':
      return {
        ...state,
        progress: state.progress ? {
          ...state.progress,
          stepData: {
            ...state.progress.stepData,
            [action.payload.stepId]: action.payload.data
          },
          lastActiveAt: new Date().toISOString()
        } : null
      }

    case 'UPDATE_CLIENT_DATA':
      return {
        ...state,
        clientData: {
          ...state.clientData,
          ...action.payload
        }
      }

    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload
      }

    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload
      }

    case 'LOAD_PROGRESS':
      return {
        ...state,
        progress: action.payload,
        isActive: !action.payload.isCompleted
      }

    default:
      return state
  }
}

// Provider Component
interface OnboardingProviderProps {
  children: React.ReactNode
}

export function OnboardingProvider({ children }: OnboardingProviderProps) {
  const [state, dispatch] = useReducer(onboardingReducer, initialState)
  const { user } = useApp()

  // Cargar progreso guardado al montar
  useEffect(() => {
    if (user?.id) {
      loadSavedProgress()
    }
  }, [user?.id])

  // Auto-guardado cuando hay cambios
  useEffect(() => {
    if (state.autoSave && state.isActive && state.progress) {
      const timeoutId = setTimeout(() => {
        saveProgress()
      }, 2000) // Guardar después de 2 segundos de inactividad

      return () => clearTimeout(timeoutId)
    }
  }, [state.progress, state.clientData])

  const loadSavedProgress = async () => {
    try {
      // Cargar desde Supabase
      const { data, error } = await supabase
        .from('onboarding_progress')
        .select('*')
        .eq('user_id', user?.id)
        .eq('is_completed', false)
        .order('last_active_at', { ascending: false })
        .limit(1)
        .single()

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading onboarding progress:', error)
        return
      }

      if (data) {
        const progress: OnboardingProgress = {
          currentStepIndex: data.current_step_index,
          completedSteps: data.completed_steps,
          stepData: (data.step_data as Record<string, any>) || {},
          startedAt: data.started_at,
          lastActiveAt: data.last_active_at,
          isCompleted: data.is_completed,
          clientType: data.client_type as 'particular' | 'empresa' | undefined
        }
        dispatch({ type: 'LOAD_PROGRESS', payload: progress })
      }
    } catch (error) {
      console.error('Error loading onboarding progress:', error)
    }
  }

  const startOnboarding = useCallback((flowId: string, clientType?: 'particular' | 'empresa') => {
    const flow = ONBOARDING_FLOWS.find(f => f.id === flowId)
    if (!flow) {
      dispatch({ type: 'SET_ERROR', payload: `Flujo de onboarding "${flowId}" no encontrado` })
      return
    }

    dispatch({ type: 'START_ONBOARDING', payload: { flow, clientType } })
    toast.success('¡Bienvenido! Comenzemos con tu incorporación')
  }, [])

  const startOnboardingFromProposal = useCallback(async (proposal: any) => {
    if (!proposal.contact_id) {
      toast.error('No se puede iniciar onboarding: falta información del contacto')
      return
    }

    try {
      // Obtener datos del contacto
      const { data: contact, error } = await supabase
        .from('contacts')
        .select('*')
        .eq('id', proposal.contact_id)
        .single()

      if (error) throw error

      // Determinar el tipo de cliente y flujo
      const clientType = contact.client_type || 'particular'
      const flowId = clientType === 'empresa' ? 'empresa' : 'particular'
      
      const flow = ONBOARDING_FLOWS.find(f => f.id === flowId)
      if (!flow) {
        dispatch({ type: 'SET_ERROR', payload: `Flujo de onboarding "${flowId}" no encontrado` })
        return
      }

      // Pre-llenar datos del contacto
      const prefilledData = {
        name: contact.name,
        email: contact.email,
        phone: contact.phone,
        dni_nif: contact.dni_nif,
        address_street: contact.address_street,
        address_city: contact.address_city,
        address_postal_code: contact.address_postal_code,
        address_country: contact.address_country,
        client_type: clientType,
        business_sector: contact.business_sector,
        proposal_id: proposal.id,
        proposal_title: proposal.title
      }

      dispatch({ type: 'START_ONBOARDING', payload: { flow, clientType: clientType as 'particular' | 'empresa' } })
      dispatch({ type: 'UPDATE_CLIENT_DATA', payload: prefilledData })
      
      toast.success('¡Propuesta aceptada! Completemos tu información de cliente')
    } catch (error) {
      console.error('Error starting onboarding from proposal:', error)
      toast.error('Error al iniciar el proceso de onboarding')
    }
  }, [])

  const saveProgress = useCallback(async () => {
    if (!state.progress || !user?.id || !user?.org_id || !state.currentFlow) return

    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      
      const progressData = {
        org_id: user.org_id,
        user_id: user.id,
        flow_id: state.currentFlow.id,
        current_step_index: state.progress.currentStepIndex,
        completed_steps: state.progress.completedSteps,
        step_data: state.progress.stepData,
        client_data: state.clientData,
        client_type: state.progress.clientType,
        last_active_at: new Date().toISOString(),
        is_completed: state.progress.isCompleted
      }

      const { error } = await supabase
        .from('onboarding_progress')
        .upsert(progressData, { 
          onConflict: 'user_id,flow_id',
          ignoreDuplicates: false 
        })

      if (error) throw error
      
    } catch (error) {
      console.error('Error saving onboarding progress:', error)
      toast.error('Error al guardar el progreso')
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }, [state.progress, state.clientData, state.currentFlow, user?.id, user?.org_id])

  const completeOnboarding = useCallback(async () => {
    if (!state.progress || !user?.org_id) return

    try {
      dispatch({ type: 'SET_LOADING', payload: true })

      // Crear cliente con todos los datos recopilados
      const clientData = {
        name: state.clientData.name || 'Cliente sin nombre',
        ...state.clientData,
        org_id: user.org_id,
        relationship_type: 'cliente',
        status: 'activo'
      }
      
      const { error } = await supabase
        .from('contacts')
        .insert(clientData)

      if (error) throw error

      dispatch({ type: 'COMPLETE_ONBOARDING' })
      toast.success('¡Onboarding completado exitosamente!')
      
      // Limpiar progreso guardado
      await supabase
        .from('onboarding_progress')
        .delete()
        .eq('user_id', user.id)
        .eq('flow_id', state.currentFlow?.id)

    } catch (error) {
      console.error('Error completing onboarding:', error)
      toast.error('Error al completar el onboarding')
      dispatch({ type: 'SET_ERROR', payload: 'Error al crear el cliente' })
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }, [state.clientData, state.progress, user])

  const nextStep = useCallback(() => {
    if (!state.currentFlow || !state.progress) return
    
    const nextIndex = state.progress.currentStepIndex + 1
    if (nextIndex < state.currentFlow.steps.length) {
      dispatch({ type: 'SET_CURRENT_STEP', payload: nextIndex })
    }
  }, [state.currentFlow, state.progress])

  const previousStep = useCallback(() => {
    if (!state.progress) return
    
    const prevIndex = state.progress.currentStepIndex - 1
    if (prevIndex >= 0) {
      dispatch({ type: 'SET_CURRENT_STEP', payload: prevIndex })
    }
  }, [state.progress])

  const validateStep = useCallback((stepId: string): boolean => {
    // TODO: Implementar validación específica por paso
    return true
  }, [])

  const value: OnboardingContextValue = {
    // Estado
    ...state,
    
    // Acciones
    startOnboarding,
    startOnboardingFromProposal,
    pauseOnboarding: () => dispatch({ type: 'PAUSE_ONBOARDING' }),
    resumeOnboarding: () => dispatch({ type: 'RESUME_ONBOARDING' }),
    completeOnboarding,
    cancelOnboarding: () => dispatch({ type: 'CANCEL_ONBOARDING' }),
    
    goToStep: (stepIndex: number) => dispatch({ type: 'SET_CURRENT_STEP', payload: stepIndex }),
    nextStep,
    previousStep,
    skipStep: nextStep, // Por ahora, skip = next
    
    updateStepData: (stepId: string, data: any) => 
      dispatch({ type: 'UPDATE_STEP_DATA', payload: { stepId, data } }),
    updateClientData: (data: any) => 
      dispatch({ type: 'UPDATE_CLIENT_DATA', payload: data }),
    validateStep,
    saveProgress,
    
    setError: (error: string | null) => dispatch({ type: 'SET_ERROR', payload: error }),
    clearError: () => dispatch({ type: 'SET_ERROR', payload: null })
  }

  return (
    <OnboardingContext.Provider value={value}>
      {children}
    </OnboardingContext.Provider>
  )
}

// Hook para usar el contexto
export function useOnboarding() {
  const context = useContext(OnboardingContext)
  if (context === undefined) {
    throw new Error('useOnboarding must be used within an OnboardingProvider')
  }
  return context
}