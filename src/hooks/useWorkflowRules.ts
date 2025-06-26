
import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'
import type { Tables } from '@/integrations/supabase/types'
import { useApp } from '@/contexts/AppContext'
import { toast } from 'sonner'

export type WorkflowRuleDB = Tables<'workflow_rules'>

export const useWorkflowRules = () => {
  const [rules, setRules] = useState<WorkflowRuleDB[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const { user } = useApp()

  const fetchRules = async () => {
    if (!user?.org_id) return

    setIsLoading(true)
    try {
      // Deshabilitar temporalmente para evitar errores 400
      console.log('⚠️ Consulta workflow_rules deshabilitada temporalmente')
      setRules([])
    } catch (error) {
      console.error('❌ Error fetching workflow rules:', error)
      setRules([])
    } finally {
      setIsLoading(false)
    }
  }

  const createRule = async (ruleData: Omit<WorkflowRuleDB, 'id' | 'org_id' | 'created_at' | 'updated_at'>) => {
    console.log('⚠️ Creación de reglas de workflow deshabilitada temporalmente')
    toast.error('Función temporalmente deshabilitada')
    return null
  }

  const updateRule = async (id: string, updates: Partial<WorkflowRuleDB>) => {
    console.log('⚠️ Actualización de reglas de workflow deshabilitada temporalmente')
    toast.error('Función temporalmente deshabilitada')
    return null
  }

  const deleteRule = async (id: string) => {
    console.log('⚠️ Eliminación de reglas de workflow deshabilitada temporalmente')
    toast.error('Función temporalmente deshabilitada')
  }

  const toggleRule = async (id: string, isActive: boolean) => {
    console.log('⚠️ Toggle de reglas de workflow deshabilitada temporalmente')
    toast.error('Función temporalmente deshabilitada')
  }

  // No ejecutar fetchRules automáticamente para evitar rate limiting
  useEffect(() => {
    // Función deshabilitada para evitar errores
  }, [user?.org_id])

  return {
    rules,
    isLoading,
    createRule,
    updateRule,
    deleteRule,
    toggleRule,
    refetch: fetchRules
  }
}
