
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/hooks/use-toast'

export interface Case {
  id: string
  title: string
  description: string | null
  status: string
  client_id: string
  org_id: string
  practice_area: string | null
  responsible_solicitor_id: string | null
  originating_solicitor_id: string | null
  matter_number: string | null
  billing_method: string
  estimated_budget: number | null
  date_opened: string | null
  date_closed: string | null
  template_id: string | null
  created_at: string
  updated_at: string | null
  client?: {
    name: string
    email: string | null
  }
  responsible_solicitor?: {
    email: string
  }
  originating_solicitor?: {
    email: string
  }
}

export interface CreateCaseData {
  title: string
  description?: string
  status: string
  client_id: string
  practice_area?: string
  responsible_solicitor_id?: string
  originating_solicitor_id?: string
  billing_method?: string
  estimated_budget?: number
  template_id?: string
}

export const useCases = () => {
  const { user } = useAuth()
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [practiceAreaFilter, setPracticeAreaFilter] = useState<string>('all')
  const [solicitorFilter, setSolicitorFilter] = useState<string>('all')

  const { data: cases = [], isLoading, error, refetch } = useQuery({
    queryKey: ['cases', user?.org_id],
    queryFn: async () => {
      if (!user?.org_id) {
        console.log('📁 No org_id disponible para obtener casos')
        return []
      }
      
      console.log('📁 Obteniendo casos para org:', user.org_id)
      
      const { data, error } = await supabase
        .from('cases')
        .select(`
          *,
          client:clients(name, email),
          responsible_solicitor:users!responsible_solicitor_id(email),
          originating_solicitor:users!originating_solicitor_id(email)
        `)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('❌ Error fetching cases:', error)
        throw error
      }
      
      console.log('✅ Casos obtenidos:', data?.length || 0)
      return data || []
    },
    enabled: !!user?.org_id,
  })

  const createCase = useMutation({
    mutationFn: async (caseData: CreateCaseData) => {
      // Generate matter number if not provided
      const matterNumber = await supabase
        .rpc('generate_matter_number', { org_uuid: user?.org_id! })

      const insertData = {
        ...caseData,
        matter_number: matterNumber.data,
        org_id: user?.org_id!,
        date_opened: new Date().toISOString().split('T')[0],
      }

      const { error } = await supabase
        .from('cases')
        .insert(insertData)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cases'] })
      toast({ title: 'Matter created successfully' })
    },
    onError: (error) => {
      toast({ 
        title: 'Error creating matter', 
        description: error.message, 
        variant: 'destructive' 
      })
    },
  })

  const filteredCases = cases.filter(case_ => {
    const matchesSearch = case_.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      case_.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      case_.client?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      case_.matter_number?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || case_.status === statusFilter
    const matchesPracticeArea = practiceAreaFilter === 'all' || case_.practice_area === practiceAreaFilter
    const matchesSolicitor = solicitorFilter === 'all' || 
      case_.responsible_solicitor_id === solicitorFilter ||
      case_.originating_solicitor_id === solicitorFilter

    return matchesSearch && matchesStatus && matchesPracticeArea && matchesSolicitor
  })

  return {
    cases,
    filteredCases,
    isLoading,
    error,
    refetch,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    practiceAreaFilter,
    setPracticeAreaFilter,
    solicitorFilter,
    setSolicitorFilter,
    createCase: createCase.mutate,
    isCreating: createCase.isPending,
  }
}
