
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
      const { data, error } = await supabase
        .from('workflow_rules')
        .select('*')
        .eq('org_id', user.org_id)
        .order('created_at', { ascending: false })

      if (error) {
        // Si hay error 400, puede ser que la tabla no esté accesible aún
        if (error.code === '400' || error.code === 'PGRST116') {
          console.log('⚠️ Tabla workflow_rules no accesible, devolviendo datos vacíos')
          setRules([])
          return
        }
        throw error
      }
      
      console.log('✅ Reglas de workflow obtenidas:', data?.length || 0)
      setRules(data || [])
    } catch (error) {
      console.error('❌ Error fetching workflow rules:', error)
      setRules([])
    } finally {
      setIsLoading(false)
    }
  }

  const createRule = async (ruleData: Omit<WorkflowRuleDB, 'id' | 'org_id' | 'created_at' | 'updated_at'>) => {
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

      setRules(prev => [data, ...prev])
      toast.success('Regla de workflow creada correctamente')
      return data
    } catch (error) {
      console.error('❌ Error creating workflow rule:', error)
      toast.error('No se pudo crear la regla de workflow')
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
      toast.success('Regla de workflow actualizada correctamente')
      return data
    } catch (error) {
      console.error('❌ Error updating workflow rule:', error)
      toast.error('No se pudo actualizar la regla de workflow')
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
      toast.success('Regla de workflow eliminada correctamente')
    } catch (error) {
      console.error('❌ Error deleting workflow rule:', error)
      toast.error('No se pudo eliminar la regla de workflow')
      throw error
    }
  }

  const toggleRule = async (id: string, isActive: boolean) => {
    await updateRule(id, { is_active: isActive })
  }

  useEffect(() => {
    fetchRules()
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
