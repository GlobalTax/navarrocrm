
import { useState, useCallback } from 'react'
import { createLogger } from '@/utils/logger'

/**
 * Interface para definir un paso del tour guiado
 * @interface TourStep
 */
export interface TourStep {
  /** Identificador único del paso */
  id: string
  /** Título del paso */
  title: string
  /** Descripción detallada del paso */
  description: string
  /** Beneficio principal del paso */
  benefit: string
  /** Categoría a la que pertenece */
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

/**
 * Hook para gestionar el estado del tour guiado de IA
 * Proporciona funcionalidad completa para navegar y gestionar el progreso del tour
 * 
 * @returns {Object} Estado y funciones del tour guiado
 * @returns {number} returns.currentStep - Paso actual del tour
 * @returns {string[]} returns.completedSteps - Pasos completados
 * @returns {boolean} returns.isCompleted - Si el tour está completado
 * @returns {Function} returns.handleNext - Función para avanzar al siguiente paso
 * 
 * @example
 * ```typescript
 * const { 
 *   currentStep, 
 *   progress, 
 *   handleNext, 
 *   handleClose 
 * } = useGuidedTourState()
 * 
 * // Avanzar en el tour
 * <Button onClick={handleNext}>Siguiente</Button>
 * 
 * // Mostrar progreso
 * <ProgressBar value={progress} />
 * ```
 * 
 * @since 1.0.0
 */
export const useGuidedTourState = () => {
  const logger = createLogger('useGuidedTourState')
  const [currentStep, setCurrentStep] = useState(0)
  const [completedSteps, setCompletedSteps] = useState<string[]>([])
  const [isCompleted, setIsCompleted] = useState(false)
  const [showTour, setShowTour] = useState(() => {
    const tourCompleted = !localStorage.getItem('ai-tour-completed')
    logger.debug('Inicializando tour guiado', { showTour: tourCompleted })
    return tourCompleted
  })

  /**
   * Avanza al siguiente paso del tour con validación y logging
   */
  const handleNext = useCallback(() => {
    try {
      const currentStepId = tourSteps[currentStep]?.id
      if (!currentStepId) {
        logger.error('Paso actual no válido', { currentStep, totalSteps: tourSteps.length })
        return
      }

      if (!completedSteps.includes(currentStepId)) {
        setCompletedSteps(prev => [...prev, currentStepId])
        logger.debug('Paso completado', { stepId: currentStepId, step: currentStep + 1 })
      }
      
      if (currentStep < tourSteps.length - 1) {
        setCurrentStep(currentStep + 1)
        logger.debug('Avanzando al siguiente paso', { nextStep: currentStep + 2 })
      } else {
        setIsCompleted(true)
        localStorage.setItem('ai-tour-completed', 'true')
        logger.info('Tour guiado completado exitosamente')
      }
    } catch (error) {
      logger.error('Error al avanzar en el tour', { error, currentStep })
    }
  }, [currentStep, completedSteps, logger])

  /**
   * Retrocede al paso anterior con validación
   */
  const handlePrevious = useCallback(() => {
    try {
      if (currentStep > 0) {
        setCurrentStep(currentStep - 1)
        logger.debug('Retrocediendo al paso anterior', { previousStep: currentStep })
      } else {
        logger.warn('Intento de retroceder desde el primer paso')
      }
    } catch (error) {
      logger.error('Error al retroceder en el tour', { error, currentStep })
    }
  }, [currentStep, logger])

  /**
   * Cierra el tour y marca como completado
   */
  const handleClose = useCallback(() => {
    try {
      setShowTour(false)
      localStorage.setItem('ai-tour-completed', 'true')
      logger.info('Tour cerrado por el usuario', { stepAtClose: currentStep + 1 })
    } catch (error) {
      logger.error('Error al cerrar el tour', { error })
    }
  }, [currentStep, logger])

  const progress = ((currentStep + 1) / tourSteps.length) * 100
  const currentStepData = tourSteps[currentStep]

  logger.debug('Estado del tour actualizado', {
    currentStep: currentStep + 1,
    totalSteps: tourSteps.length,
    progress: Math.round(progress),
    completedCount: completedSteps.length,
    showTour,
    isCompleted
  })

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
