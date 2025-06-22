
import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useApp } from '@/contexts/AppContext'
import { useToast } from '@/hooks/use-toast'

export interface WorkflowRuleDB {
  id: string
  name: string
  description?: string
  trigger_type: 'case_created' | 'client_added' | 'task_overdue' | 'proposal_sent' | 'time_logged'
  conditions: any[]
  actions: any[]
  is_active: boolean
  priority: number
  org_id: string
  created_by: string
  created_at: string
  updated_at: string
}

export const useWorkflowRules = () => {
  const [rules, setRules] = useState<WorkflowRuleDB[]>([])
  const [templates, setTemplates] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const { user } = useApp()
  const { toast } = useToast()

  const fetchRules = async () => {
    if (!user?.org_id) return

    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from('workflow_rules')
        .select('*')
        .eq('org_id', user.org_id)
        .order('priority', { ascending: false })

      if (error) throw error
      setRules(data || [])
    } catch (error) {
      console.error('Error fetching workflow rules:', error)
      toast({
        title: 'Error',
        description: 'No se pudieron cargar las reglas de workflow',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const fetchTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('workflow_templates')
        .select('*')
        .order('category')

      if (error) throw error
      setTemplates(data || [])
    } catch (error) {
      console.error('Error fetching workflow templates:', error)
    }
  }

  const createRule = async (ruleData: Omit<WorkflowRuleDB, 'id' | 'org_id' | 'created_by' | 'created_at' | 'updated_at'>) => {
    if (!user?.org_id || !user?.id) return

    try {
      const { data, error } = await supabase
        .from('workflow_rules')
        .insert({
          ...ruleData,
          org_id: user.org_id,
          created_by: user.id
        })
        .select()
        .single()

      if (error) throw error

      setRules(prev => [...prev, data])
      toast({
        title: 'Éxito',
        description: 'Regla de workflow creada correctamente'
      })
      return data
    } catch (error) {
      console.error('Error creating workflow rule:', error)
      toast({
        title: 'Error',
        description: 'No se pudo crear la regla de workflow',
        variant: 'destructive'
      })
      throw error
    }
  }

  const updateRule = async (id: string, updates: Partial<WorkflowRuleDB>) => {
    try {
      const { data, error } = await supabase
        .from('workflow_rules')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      setRules(prev => prev.map(rule => rule.id === id ? data : rule))
      toast({
        title: 'Éxito',
        description: 'Regla de workflow actualizada correctamente'
      })
      return data
    } catch (error) {
      console.error('Error updating workflow rule:', error)
      toast({
        title: 'Error',
        description: 'No se pudo actualizar la regla de workflow',
        variant: 'destructive'
      })
      throw error
    }
  }

  const deleteRule = async (id: string) => {
    try {
      const { error } = await supabase
        .from('workflow_rules')
        .delete()
        .eq('id', id)

      if (error) throw error

      setRules(prev => prev.filter(rule => rule.id !== id))
      toast({
        title: 'Éxito',
        description: 'Regla de workflow eliminada correctamente'
      })
    } catch (error) {
      console.error('Error deleting workflow rule:', error)
      toast({
        title: 'Error',
        description: 'No se pudo eliminar la regla de workflow',
        variant: 'destructive'
      })
      throw error
    }
  }

  const toggleRule = async (id: string, isActive: boolean) => {
    await updateRule(id, { is_active: isActive })
  }

  useEffect(() => {
    fetchRules()
    fetchTemplates()
  }, [user?.org_id])

  return {
    rules,
    templates,
    isLoading,
    createRule,
    updateRule,
    deleteRule,
    toggleRule,
    refetch: fetchRules
  }
}
