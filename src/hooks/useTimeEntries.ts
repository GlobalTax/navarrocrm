import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { useApp } from '@/contexts/AppContext'

export interface TimeEntry {
  id: string
  user_id: string
  case_id: string | null
  description: string | null
  duration_minutes: number
  is_billable: boolean
  org_id: string
  created_at: string
  updated_at: string | null
  case?: {
    title: string
    client?: {
      name: string
    }
  }
}

export interface CreateTimeEntryData {
  case_id?: string | null
  description?: string
  duration_minutes: number
  is_billable: boolean
}

export const useTimeEntries = () => {
  const { user } = useApp()
  const queryClient = useQueryClient()
  const [searchTerm, setSearchTerm] = useState('')
  const [caseFilter, setCaseFilter] = useState<string>('all')
  const [billableFilter, setBillableFilter] = useState<string>('all')

  const { data: timeEntries = [], isLoading, error, refetch } = useQuery({
    queryKey: ['timeEntries', user?.org_id],
    queryFn: async () => {
      if (!user?.org_id) {
        console.log('⏱️ No org_id disponible para obtener entradas de tiempo')
        return []
      }
      
      console.log('⏱️ Obteniendo entradas de tiempo para org:', user.org_id)
      
      const { data, error } = await supabase
        .from('time_entries')
        .select(`
          *,
          case:cases(
            title,
            client:clients(name)
          )
        `)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('❌ Error fetching time entries:', error)
        throw error
      }
      
      console.log('✅ Entradas de tiempo obtenidas:', data?.length || 0)
      return data || []
    },
    enabled: !!user?.org_id,
  })

  const createTimeEntryMutation = useMutation({
    mutationFn: async (data: CreateTimeEntryData) => {
      if (!user?.org_id || !user?.id) {
        throw new Error('Usuario no autenticado')
      }

      const insertData = {
        user_id: user.id,
        org_id: user.org_id,
        case_id: data.case_id || null,
        description: data.description || null,
        duration_minutes: data.duration_minutes,
        is_billable: data.is_billable
      }

      console.log('⏱️ Creando entrada de tiempo:', insertData)

      const { error } = await supabase
        .from('time_entries')
        .insert(insertData)

      if (error) {
        console.error('❌ Error creating time entry:', error)
        throw error
      }

      console.log('✅ Entrada de tiempo creada exitosamente')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timeEntries'] })
    },
  })

  const updateTimeEntryMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<CreateTimeEntryData> }) => {
      console.log('⏱️ Actualizando entrada de tiempo:', id, data)

      const { error } = await supabase
        .from('time_entries')
        .update(data)
        .eq('id', id)

      if (error) {
        console.error('❌ Error updating time entry:', error)
        throw error
      }

      console.log('✅ Entrada de tiempo actualizada exitosamente')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timeEntries'] })
    },
  })

  const deleteTimeEntryMutation = useMutation({
    mutationFn: async (id: string) => {
      console.log('⏱️ Eliminando entrada de tiempo:', id)

      const { error } = await supabase
        .from('time_entries')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('❌ Error deleting time entry:', error)
        throw error
      }

      console.log('✅ Entrada de tiempo eliminada exitosamente')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timeEntries'] })
    },
  })

  const filteredTimeEntries = timeEntries.filter(entry => {
    const matchesSearch = entry.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.case?.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.case?.client?.name.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesCase = caseFilter === 'all' || 
      (caseFilter === 'none' && !entry.case_id) ||
      entry.case_id === caseFilter
    
    const matchesBillable = billableFilter === 'all' || 
      (billableFilter === 'billable' && entry.is_billable) ||
      (billableFilter === 'non-billable' && !entry.is_billable)

    return matchesSearch && matchesCase && matchesBillable
  })

  return {
    timeEntries,
    filteredTimeEntries,
    isLoading,
    error,
    refetch,
    searchTerm,
    setSearchTerm,
    caseFilter,
    setCaseFilter,
    billableFilter,
    setBillableFilter,
    createTimeEntry: createTimeEntryMutation.mutateAsync,
    updateTimeEntry: updateTimeEntryMutation.mutateAsync,
    deleteTimeEntry: deleteTimeEntryMutation.mutateAsync,
    isCreating: createTimeEntryMutation.isPending,
    isUpdating: updateTimeEntryMutation.isPending,
    isDeleting: deleteTimeEntryMutation.isPending
  }
}
