import { useState, useCallback } from 'react'
import { toast } from 'sonner'
import { AdvancedProposalPhase, PhaseStatus, PhaseTemplate, PhaseMetrics } from '@/types/phase.types'

export const useAdvancedPhases = () => {
  const [phases, setPhases] = useState<AdvancedProposalPhase[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const updatePhaseStatus = useCallback((phaseId: string, status: PhaseStatus) => {
    setPhases(prev => prev.map(phase => {
      if (phase.id === phaseId) {
        const updatedPhase = { ...phase, status }
        
        // Actualizar fechas automáticamente
        if (status === 'in_progress' && !phase.timeline.actualStartDate) {
          updatedPhase.timeline.actualStartDate = new Date().toISOString()
        }
        
        if (status === 'completed' && !phase.timeline.actualEndDate) {
          updatedPhase.timeline.actualEndDate = new Date().toISOString()
          updatedPhase.progress.completionPercentage = 100
        }
        
        return updatedPhase
      }
      return phase
    }))
    
    toast.success(`Estado de fase actualizado a ${status}`)
  }, [])

  const updatePhaseProgress = useCallback((phaseId: string, completionPercentage: number) => {
    setPhases(prev => prev.map(phase => 
      phase.id === phaseId 
        ? { 
            ...phase, 
            progress: { 
              ...phase.progress, 
              completionPercentage 
            } 
          }
        : phase
    ))
  }, [])

  const addPhaseFromTemplate = useCallback((template: PhaseTemplate) => {
    const newPhases: AdvancedProposalPhase[] = template.phases.map(templatePhase => ({
      ...templatePhase,
      id: crypto.randomUUID(),
      createdBy: 'current-user', // TODO: get from auth
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }))
    
    setPhases(prev => [...prev, ...newPhases])
    toast.success(`${newPhases.length} fases añadidas desde plantilla`)
  }, [])

  const validatePhaseDependencies = useCallback((phases: AdvancedProposalPhase[]) => {
    const issues: string[] = []
    
    phases.forEach(phase => {
      phase.dependencies.forEach(dep => {
        const dependencyPhase = phases.find(p => p.id === dep.dependsOnPhaseId)
        if (!dependencyPhase) {
          issues.push(`Fase "${phase.name}" tiene dependencia inválida`)
          return
        }
        
        if (dep.dependencyType === 'finish_to_start' && 
            phase.status === 'in_progress' && 
            dependencyPhase.status !== 'completed') {
          issues.push(`Fase "${phase.name}" no puede iniciarse hasta que "${dependencyPhase.name}" esté completada`)
        }
      })
    })
    
    return issues
  }, [])

  const calculatePhaseMetrics = useCallback((phases: AdvancedProposalPhase[]): PhaseMetrics => {
    const totalPhases = phases.length
    const completedPhases = phases.filter(p => p.status === 'completed').length
    const onTimePhases = phases.filter(p => {
      if (p.status !== 'completed' || !p.timeline.actualEndDate || !p.timeline.plannedEndDate) {
        return false
      }
      return new Date(p.timeline.actualEndDate) <= new Date(p.timeline.plannedEndDate)
    }).length
    
    const completedPhasesWithDuration = phases.filter(p => 
      p.status === 'completed' && 
      p.timeline.actualStartDate && 
      p.timeline.actualEndDate
    )
    
    const averageDuration = completedPhasesWithDuration.length > 0
      ? completedPhasesWithDuration.reduce((acc, phase) => {
          const start = new Date(phase.timeline.actualStartDate!)
          const end = new Date(phase.timeline.actualEndDate!)
          return acc + (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
        }, 0) / completedPhasesWithDuration.length
      : 0

    const budgetVariance = phases.reduce((acc, phase) => {
      if (phase.budget.actual && phase.budget.estimated) {
        return acc + ((phase.budget.actual - phase.budget.estimated) / phase.budget.estimated * 100)
      }
      return acc
    }, 0) / phases.length

    return {
      totalPhases,
      completedPhases,
      onTimeCompletion: totalPhases > 0 ? (onTimePhases / totalPhases) * 100 : 0,
      averageDuration,
      budgetVariance
    }
  }, [])

  const exportPhaseReport = useCallback((phases: AdvancedProposalPhase[]) => {
    const report = {
      generatedAt: new Date().toISOString(),
      metrics: calculatePhaseMetrics(phases),
      phases: phases.map(phase => ({
        id: phase.id,
        name: phase.name,
        status: phase.status,
        progress: phase.progress,
        timeline: phase.timeline,
        budget: phase.budget
      }))
    }
    
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `phase-report-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
    
    toast.success('Reporte de fases exportado')
  }, [calculatePhaseMetrics])

  return {
    phases,
    setPhases,
    isLoading,
    updatePhaseStatus,
    updatePhaseProgress,
    addPhaseFromTemplate,
    validatePhaseDependencies,
    calculatePhaseMetrics,
    exportPhaseReport
  }
}