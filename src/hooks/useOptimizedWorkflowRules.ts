
import { useState, useCallback, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { useApp } from '@/contexts/AppContext'

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

export interface WorkflowTemplate {
  id: string
  name: string
  description: string
  category: string
  template_data: any
  is_system_template: boolean
}

export const useOptimizedWorkflowRules = () => {
  const { user } = useApp()
  const queryClient = useQueryClient()
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')

  // Optimized data fetching with useMemo
  const {
    data: rulesData = [],
    isLoading: rulesLoading,
    error: rulesError
  } = useQuery({
    queryKey: ['workflow-rules', user?.org_id],
    queryFn: async () => {
      if (!user?.org_id) return []
      
      const { data, error } = await supabase
        .from('workflow_rules')
        .select('*')
        .eq('org_id', user.org_id)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data as WorkflowRuleDB[]
    },
    enabled: !!user?.org_id
  })

  const {
    data: templatesData = [],
    isLoading: templatesLoading
  } = useQuery({
    queryKey: ['workflow-templates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('workflow_templates')
        .select('*')
        .order('name')

      if (error) throw error
      return data as WorkflowTemplate[]
    }
  })

  // Memoized filtered rules
  const filteredRules = useMemo(() => {
    return rulesData.filter(rule => {
      const matchesSearch = !searchTerm || 
        rule.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rule.description?.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesCategory = categoryFilter === 'all' || 
        rule.trigger_type === categoryFilter

      return matchesSearch && matchesCategory
    })
  }, [rulesData, searchTerm, categoryFilter])

  // Memoized statistics
  const stats = useMemo(() => ({
    total: rulesData.length,
    active: rulesData.filter(rule => rule.is_active).length,
    inactive: rulesData.filter(rule => !rule.is_active).length,
    filtered: filteredRules.length
  }), [rulesData, filteredRules])

  // Optimized mutations with useCallback
  const createRuleMutation = useMutation({
    mutationFn: useCallback(async (ruleData: Omit<WorkflowRuleDB, 'id' | 'created_at' | 'updated_at' | 'org_id' | 'created_by'>) => {
      if (!user?.org_id || !user?.id) throw new Error('No organization or user ID')
      
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
      return data
    }, [user?.org_id, user?.id]),
    onSuccess: useCallback(() => {
      queryClient.invalidateQueries({ queryKey: ['workflow-rules'] })
    }, [queryClient])
  })

  const updateRuleMutation = useMutation({
    mutationFn: useCallback(async ({ id, updates }: { 
      id: string
      updates: Partial<Omit<WorkflowRuleDB, 'id' | 'created_at' | 'org_id' | 'created_by'>>
    }) => {
      const { data, error } = await supabase
        .from('workflow_rules')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    }, []),
    onSuccess: useCallback(() => {
      queryClient.invalidateQueries({ queryKey: ['workflow-rules'] })
    }, [queryClient])
  })

  const deleteRuleMutation = useMutation({
    mutationFn: useCallback(async (id: string) => {
      const { error } = await supabase
        .from('workflow_rules')
        .delete()
        .eq('id', id)

      if (error) throw error
    }, []),
    onSuccess: useCallback(() => {
      queryClient.invalidateQueries({ queryKey: ['workflow-rules'] })
    }, [queryClient])
  })

  // Optimized action functions with useCallback
  const createRule = useCallback(async (ruleData: any) => {
    return createRuleMutation.mutateAsync(ruleData)
  }, [createRuleMutation])

  const updateRule = useCallback(async (id: string, updates: any) => {
    return updateRuleMutation.mutateAsync({ id, updates })
  }, [updateRuleMutation])

  const deleteRule = useCallback(async (id: string) => {
    return deleteRuleMutation.mutateAsync(id)
  }, [deleteRuleMutation])

  const toggleRule = useCallback(async (id: string, isActive: boolean) => {
    return updateRuleMutation.mutateAsync({ 
      id, 
      updates: { is_active: isActive } 
    })
  }, [updateRuleMutation])

  // Optimized search handlers
  const handleSearchChange = useCallback((term: string) => {
    setSearchTerm(term)
  }, [])

  const handleCategoryChange = useCallback((category: string) => {
    setCategoryFilter(category)
  }, [])

  const clearFilters = useCallback(() => {
    setSearchTerm('')
    setCategoryFilter('all')
  }, [])

  return {
    // Data
    rules: filteredRules,
    allRules: rulesData,
    templates: templatesData,
    stats,
    
    // Loading states
    isLoading: rulesLoading || templatesLoading,
    isCreating: createRuleMutation.isPending,
    isUpdating: updateRuleMutation.isPending,
    isDeleting: deleteRuleMutation.isPending,
    
    // Error states
    error: rulesError,
    
    // Actions
    createRule,
    updateRule,
    deleteRule,
    toggleRule,
    
    // Filters
    searchTerm,
    categoryFilter,
    handleSearchChange,
    handleCategoryChange,
    clearFilters
  }
}
