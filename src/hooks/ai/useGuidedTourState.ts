
import { useState } from 'react'

export interface TourStep {
  id: string
  title: string
  description: string
  benefit: string
  category: string
}

export const tourSteps: TourStep[] = [
  {
    id: 'voice',
    title: 'Asistente de Voz',
    description: 'Controla tu despacho con comandos de voz naturales',
    benefit: 'Ahorra 30 minutos diarios en tareas administrativas',
    category: 'Productividad'
  },
  {
    id: 'documents',
    title: 'Análisis de Documentos',
    description: 'Extrae información clave automáticamente de contratos y expedientes',
    benefit: 'Reduce 80% el tiempo de revisión de documentos',
    category: 'Automatización'
  },
  {
    id: 'time',
    title: 'Optimización de Tiempo',
    description: 'Analiza tus patrones de trabajo y sugiere mejoras',
    benefit: 'Incrementa 25% tu productividad diaria',
    category: 'Análisis'
  },
  {
    id: 'compliance',
    title: 'Monitor de Compliance',
    description: 'Detecta riesgos y vencimientos automáticamente',
    benefit: 'Evita multas y problemas regulatorios',
    category: 'Seguridad'
  },
  {
    id: 'business',
    title: 'Business Intelligence',
    description: 'Obtén insights predictivos sobre tu negocio',
    benefit: 'Identifica oportunidades de crecimiento',
    category: 'Estrategia'
  }
]

export const useGuidedTourState = () => {
  const [currentStep, setCurrentStep] = useState(0)
  const [completedSteps, setCompletedSteps] = useState<string[]>([])
  const [isCompleted, setIsCompleted] = useState(false)
  const [showTour, setShowTour] = useState(() => {
    return !localStorage.getItem('ai-tour-completed')
  })

  const handleNext = () => {
    const currentStepId = tourSteps[currentStep].id
    if (!completedSteps.includes(currentStepId)) {
      setCompletedSteps([...completedSteps, currentStepId])
    }
    
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      setIsCompleted(true)
      localStorage.setItem('ai-tour-completed', 'true')
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleClose = () => {
    setShowTour(false)
    localStorage.setItem('ai-tour-completed', 'true')
  }

  const progress = ((currentStep + 1) / tourSteps.length) * 100
  const currentStepData = tourSteps[currentStep]

  return {
    currentStep,
    completedSteps,
    isCompleted,
    showTour,
    progress,
    currentStepData,
    handleNext,
    handlePrevious,
    handleClose
  }
}
