import { useState, useEffect } from 'react'

export interface JourneyType {
  id: string
  name: string
  duration: number
  description: string
  category: string
}

export interface JourneyStep {
  id: string
  title: string
  description: string
  type: string
  duration: number
  isAutomated: boolean
  deliverables?: string[]
  prerequisites?: string[]
  status: 'pending' | 'current' | 'completed'
}

export interface ActiveJourney {
  id: string
  prospectId: string
  journeyType: string
  currentStep: number
  startedAt: string
  estimatedCompletion: string
  progress: number
}

export const useLegalJourneyEngine = () => {
  const [journeyTypes] = useState<JourneyType[]>([
    {
      id: 'civil',
      name: 'Derecho Civil',
      duration: 45,
      description: 'Casos de derecho civil general',
      category: 'civil'
    },
    {
      id: 'mercantil',
      name: 'Derecho Mercantil',
      duration: 60,
      description: 'Casos empresariales y comerciales',
      category: 'empresarial'
    },
    {
      id: 'laboral',
      name: 'Derecho Laboral',
      duration: 30,
      description: 'Conflictos laborales y RRHH',
      category: 'laboral'
    },
    {
      id: 'penal',
      name: 'Derecho Penal',
      duration: 90,
      description: 'Casos penales y defensa criminal',
      category: 'penal'
    },
    {
      id: 'fiscal',
      name: 'Derecho Fiscal',
      duration: 40,
      description: 'Asesoramiento fiscal y tributario',
      category: 'fiscal'
    }
  ])

  const [activeJourneys, setActiveJourneys] = useState<ActiveJourney[]>([])

  const getJourneySteps = (journeyType: string): JourneyStep[] => {
    const stepTemplates: Record<string, JourneyStep[]> = {
      civil: [
        {
          id: 'civil_1',
          title: 'Análisis Inicial del Caso',
          description: 'Revisión completa de la documentación y evaluación preliminar',
          type: 'inicial',
          duration: 3,
          isAutomated: false,
          deliverables: ['Informe de viabilidad', 'Estrategia preliminar'],
          status: 'pending'
        },
        {
          id: 'civil_2',
          title: 'Recopilación Documental',
          description: 'Solicitud y organización de toda la documentación necesaria',
          type: 'documentacion',
          duration: 7,
          isAutomated: true,
          deliverables: ['Checklist documental', 'Repositorio organizado'],
          status: 'pending'
        },
        {
          id: 'civil_3',
          title: 'Análisis Jurídico Profundo',
          description: 'Investigación legal y precedentes aplicables',
          type: 'analisis',
          duration: 10,
          isAutomated: false,
          deliverables: ['Memo legal', 'Análisis de precedentes'],
          status: 'pending'
        },
        {
          id: 'civil_4',
          title: 'Elaboración de Propuesta',
          description: 'Desarrollo de estrategia y propuesta de honorarios',
          type: 'propuesta',
          duration: 5,
          isAutomated: true,
          deliverables: ['Propuesta económica', 'Plan de trabajo'],
          status: 'pending'
        },
        {
          id: 'civil_5',
          title: 'Formalización del Contrato',
          description: 'Firma del contrato de servicios y inicio formal',
          type: 'contrato',
          duration: 2,
          isAutomated: true,
          deliverables: ['Contrato firmado', 'Plan de comunicación'],
          status: 'pending'
        },
        {
          id: 'civil_6',
          title: 'Seguimiento y Ejecución',
          description: 'Desarrollo del caso y comunicación regular',
          type: 'seguimiento',
          duration: 18,
          isAutomated: false,
          deliverables: ['Informes periódicos', 'Actualizaciones de estado'],
          status: 'pending'
        }
      ],
      mercantil: [
        {
          id: 'mercantil_1',
          title: 'Due Diligence Empresarial',
          description: 'Análisis completo de la situación empresarial',
          type: 'inicial',
          duration: 5,
          isAutomated: false,
          deliverables: ['Informe due diligence', 'Análisis de riesgos'],
          status: 'pending'
        },
        {
          id: 'mercantil_2',
          title: 'Revisión Documental Corporativa',
          description: 'Validación de estatutos, actas y documentación societaria',
          type: 'documentacion',
          duration: 7,
          isAutomated: true,
          deliverables: ['Audit documental', 'Informe de compliance'],
          status: 'pending'
        },
        {
          id: 'mercantil_3',
          title: 'Análisis Legal y Regulatorio',
          description: 'Evaluación del marco normativo aplicable',
          type: 'analisis',
          duration: 10,
          isAutomated: false,
          deliverables: ['Informe regulatorio', 'Plan de cumplimiento'],
          status: 'pending'
        },
        {
          id: 'mercantil_4',
          title: 'Estructuración de la Propuesta',
          description: 'Diseño de estructura legal y propuesta comercial',
          type: 'propuesta',
          duration: 8,
          isAutomated: false,
          deliverables: ['Propuesta estructurada', 'Alternativas legales'],
          status: 'pending'
        },
        {
          id: 'mercantil_5',
          title: 'Acuerdo de Servicios',
          description: 'Negociación y formalización del acuerdo',
          type: 'contrato',
          duration: 5,
          isAutomated: false,
          deliverables: ['Contrato principal', 'Anexos específicos'],
          status: 'pending'
        },
        {
          id: 'mercantil_6',
          title: 'Implementación y Monitoreo',
          description: 'Ejecución del proyecto y seguimiento continuo',
          type: 'seguimiento',
          duration: 25,
          isAutomated: false,
          deliverables: ['Informes de progreso', 'Updates regulatorios'],
          status: 'pending'
        }
      ],
      laboral: [
        {
          id: 'laboral_1',
          title: 'Evaluación del Conflicto',
          description: 'Análisis inicial de la situación laboral',
          type: 'inicial',
          duration: 2,
          isAutomated: false,
          deliverables: ['Informe de situación', 'Evaluación de viabilidad'],
          status: 'pending'
        },
        {
          id: 'laboral_2',
          title: 'Recopilación de Evidencias',
          description: 'Documentación laboral y pruebas relevantes',
          type: 'documentacion',
          duration: 5,
          isAutomated: true,
          deliverables: ['Expediente laboral', 'Cronología de hechos'],
          status: 'pending'
        },
        {
          id: 'laboral_3',
          title: 'Análisis Legal Laboral',
          description: 'Revisión del marco normativo y convenios',
          type: 'analisis',
          duration: 5,
          isAutomated: false,
          deliverables: ['Informe jurídico', 'Estrategia procesal'],
          status: 'pending'
        },
        {
          id: 'laboral_4',
          title: 'Propuesta de Solución',
          description: 'Alternativas de resolución y honorarios',
          type: 'propuesta',
          duration: 3,
          isAutomated: true,
          deliverables: ['Propuesta de honorarios', 'Plan de acción'],
          status: 'pending'
        },
        {
          id: 'laboral_5',
          title: 'Representación Legal',
          description: 'Gestión procesal y representación',
          type: 'seguimiento',
          duration: 15,
          isAutomated: false,
          deliverables: ['Escritos procesales', 'Informes de seguimiento'],
          status: 'pending'
        }
      ]
    }

    return stepTemplates[journeyType] || []
  }

  const calculateProgress = (prospectId: string): number => {
    const journey = activeJourneys.find(j => j.prospectId === prospectId)
    if (!journey) return 0

    const steps = getJourneySteps(journey.journeyType)
    const completedSteps = steps.filter(s => s.status === 'completed').length
    
    return Math.round((completedSteps / steps.length) * 100)
  }

  const getEstimatedDuration = (journeyType: string): number => {
    const journeyTypeData = journeyTypes.find(jt => jt.id === journeyType)
    return journeyTypeData?.duration || 30
  }

  const startJourney = (prospectId: string, journeyType: string) => {
    const duration = getEstimatedDuration(journeyType)
    const estimatedCompletion = new Date()
    estimatedCompletion.setDate(estimatedCompletion.getDate() + duration)

    const newJourney: ActiveJourney = {
      id: `journey_${prospectId}_${Date.now()}`,
      prospectId,
      journeyType,
      currentStep: 0,
      startedAt: new Date().toISOString(),
      estimatedCompletion: estimatedCompletion.toISOString(),
      progress: 0
    }

    setActiveJourneys(prev => [...prev, newJourney])
    
    // Simular inicio del primer paso
    updateStepStatus(prospectId, 0, 'current')
  }

  const updateStep = (stepId: string, status: 'pending' | 'current' | 'completed') => {
    // En una implementación real, esto actualizaría el estado en la base de datos
    console.log(`Updating step ${stepId} to status ${status}`)
    
    // Lógica para actualizar el progreso general del journey
    // y potencialmente activar el siguiente paso
  }

  const updateStepStatus = (prospectId: string, stepIndex: number, status: 'pending' | 'current' | 'completed') => {
    setActiveJourneys(prev => 
      prev.map(journey => {
        if (journey.prospectId === prospectId) {
          const steps = getJourneySteps(journey.journeyType)
          const updatedProgress = status === 'completed' ? 
            Math.round(((stepIndex + 1) / steps.length) * 100) : 
            journey.progress

          return {
            ...journey,
            currentStep: status === 'completed' ? stepIndex + 1 : stepIndex,
            progress: updatedProgress
          }
        }
        return journey
      })
    )
  }

  const getJourneyAnalytics = () => {
    return {
      totalJourneys: activeJourneys.length,
      completedJourneys: activeJourneys.filter(j => j.progress === 100).length,
      averageProgress: activeJourneys.reduce((acc, j) => acc + j.progress, 0) / activeJourneys.length || 0,
      averageDuration: 35 // Calculado basándose en journeys completados
    }
  }

  return {
    journeyTypes,
    activeJourneys,
    getJourneySteps,
    calculateProgress,
    getEstimatedDuration,
    startJourney,
    updateStep,
    getJourneyAnalytics,
    // Funciones adicionales
    getJourneyByProspect: (prospectId: string) => 
      activeJourneys.find(j => j.prospectId === prospectId),
    getUpcomingDeadlines: () => 
      activeJourneys.filter(j => {
        const deadline = new Date(j.estimatedCompletion)
        const now = new Date()
        const daysUntilDeadline = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
        return daysUntilDeadline <= 7 && daysUntilDeadline > 0
      })
  }
}