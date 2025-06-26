
import { useState, useCallback } from 'react'

export interface WorkflowRuleDB {
  id: string
  name: string  
  description?: string
  trigger_type: string
  conditions: any[]
  actions: any[]
  priority: number
  is_active: boolean
  created_at: string
  updated_at: string
  org_id: string
  created_by: string
}

// Hook simplificado que devuelve datos vacíos por ahora
export const useWorkflowRules = () => {
  const [rules] = useState<WorkflowRuleDB[]>([])
  const [isLoading] = useState(false)

  const createRule = useCallback(async (ruleData: any) => {
    console.log('Crear regla:', ruleData)
    // TODO: Implementar cuando sea necesario
  }, [])

  const updateRule = useCallback(async (id: string, updates: any) => {
    console.log('Actualizar regla:', id, updates)
    // TODO: Implementar cuando sea necesario
  }, [])

  const deleteRule = useCallback(async (id: string) => {
    console.log('Eliminar regla:', id)
    // TODO: Implementar cuando sea necesario
  }, [])

  const toggleRule = useCallback(async (id: string, isActive: boolean) => {
    console.log('Toggle regla:', id, isActive)
    // TODO: Implementar cuando sea necesario
  }, [])

  return {
    rules,
    isLoading,
    createRule,
    updateRule,
    deleteRule,
    toggleRule,
    // Filtros básicos
    searchTerm: '',
    categoryFilter: 'all',
    handleSearchChange: () => {},
    handleCategoryChange: () => {},
    clearFilters: () => {}
  }
}
