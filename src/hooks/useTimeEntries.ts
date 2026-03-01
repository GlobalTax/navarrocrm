
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { useApp } from '@/contexts/AppContext'
import { toast } from 'sonner'

export interface TimeEntry {
  id: string
  org_id: string
  user_id: string
  case_id: string | null
  description: string | null
  duration_minutes: number
  is_billable: boolean
  billing_status: 'unbilled' | 'billed' | 'invoiced'
  entry_type: string | null
  created_at: string
  updated_at: string
  case?: {
    id: string
    title: string
    contact: {
      id: string
      name: string
    }
  }
}

export interface CreateTimeEntryData {
  case_id?: string
  description?: string
  duration_minutes: number
  is_billable?: boolean
  entry_type?: string
  service_contract_id?: string | null
  service_type?: 'accounting' | 'tax' | 'labor' | null
  recurring_fee_id?: string | null
}

export const useTimeEntries = () => {
  const { user } = useApp()
  const queryClient = useQueryClient()
  const [searchTerm, setSearchTerm] = useState('')
  const [caseFilter, setCaseFilter] = useState<string>('all')
  const [billableFilter, setBillableFilter] = useState<string>('all')
  const [billingStatusFilter, setBillingStatusFilter] = useState<string>('all')

  const { data: timeEntries = [], isLoading, error } = useQuery({
    queryKey: ['time-entries', user?.org_id],
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
            id,
            title,
            contact:contacts(id, name)
          )
        `)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('❌ Error fetching time entries:', error)
        throw error
      }
      
      console.log('✅ Registros de tiempo obtenidos:', data?.length || 0)
      return data as TimeEntry[]
    },
    enabled: !!user?.org_id,
  })

  const filteredTimeEntries = timeEntries.filter(entry => {
    const matchesSearch = !searchTerm || 
      entry.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.case?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.case?.contact?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesCase = caseFilter === 'all' || entry.case_id === caseFilter
    const matchesBillable = billableFilter === 'all' || 
      (billableFilter === 'billable' && entry.is_billable) ||
      (billableFilter === 'non-billable' && !entry.is_billable)
    const matchesBillingStatus = billingStatusFilter === 'all' || entry.billing_status === billingStatusFilter

    return matchesSearch && matchesCase && matchesBillable && matchesBillingStatus
  })

  const createTimeEntry = useMutation({
    mutationFn: async (data: CreateTimeEntryData) => {
      if (!user?.id || !user?.org_id) {
        throw new Error('Usuario no autenticado')
      }

      const { data: result, error } = await supabase
        .from('time_entries')
        .insert({
          org_id: user.org_id,
          user_id: user.id,
          case_id: data.case_id || null,
          description: data.description || null,
          duration_minutes: data.duration_minutes,
          is_billable: data.is_billable !== false,
          entry_type: data.entry_type || 'billable',
          service_contract_id: data.service_contract_id ?? null,
          service_type: data.service_type ?? null,
          recurring_fee_id: data.recurring_fee_id ?? null,
        })
        .select()
        .maybeSingle()

      if (error) throw error
      return result
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['time-entries'] })
      toast.success('Entrada de tiempo creada')
    },
    onError: (error) => {
      console.error('Error creating time entry:', error)
      toast.error('Error al crear la entrada de tiempo')
    },
  })

  const deleteTimeEntry = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('time_entries')
        .delete()
        .eq('id', id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['time-entries'] })
      toast.success('Entrada eliminada')
    },
    onError: (error) => {
      console.error('Error deleting time entry:', error)
      toast.error('Error al eliminar la entrada')
    },
  })

  // Mutation to update billing status
  const updateBillingStatus = useMutation({
    mutationFn: async ({ ids, status }: { ids: string[], status: 'unbilled' | 'billed' | 'invoiced' }) => {
      const { error } = await supabase
        .from('time_entries')
        .update({ billing_status: status })
        .in('id', ids)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['time-entries'] })
      queryClient.invalidateQueries({ queryKey: ['unbilled-time'] })
      toast.success('Estado de facturación actualizado')
    },
    onError: (error) => {
      console.error('Error updating billing status:', error)
      toast.error('Error al actualizar el estado de facturación')
    },
  })

  return {
    timeEntries,
    filteredTimeEntries,
    isLoading,
    error,
    searchTerm,
    setSearchTerm,
    caseFilter,
    setCaseFilter,
    billableFilter,
    setBillableFilter,
    billingStatusFilter,
    setBillingStatusFilter,
    createTimeEntry: createTimeEntry.mutate,
    deleteTimeEntry: deleteTimeEntry.mutate,
    updateBillingStatus: updateBillingStatus.mutate,
    isCreating: createTimeEntry.isPending,
    isDeleting: deleteTimeEntry.isPending,
    isUpdatingBilling: updateBillingStatus.isPending,
  }
}
