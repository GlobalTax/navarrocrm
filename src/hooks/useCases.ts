import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { useApp } from '@/contexts/AppContext'
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
  const { user } = useApp()
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('active') // Changed default to 'active'
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

  const createCaseMutation = useMutation({
    mutationFn: async (caseData: CreateCaseData) => {
      console.log('📁 Creando expediente:', caseData)
      
      // Generate matter number if not provided
      const matterNumberResult = await supabase
        .rpc('generate_matter_number', { org_uuid: user?.org_id! })

      if (matterNumberResult.error) {
        console.error('❌ Error generando número de expediente:', matterNumberResult.error)
        throw matterNumberResult.error
      }

      const insertData = {
        ...caseData,
        matter_number: matterNumberResult.data,
        org_id: user?.org_id!,
        date_opened: new Date().toISOString().split('T')[0],
      }

      console.log('📁 Datos a insertar:', insertData)

      const { data, error } = await supabase
        .from('cases')
        .insert(insertData)
        .select()
        .single()

      if (error) {
        console.error('❌ Error insertando expediente:', error)
        throw error
      }

      console.log('✅ Expediente creado exitosamente:', data)
      return data
    },
    onSuccess: (data) => {
      console.log('🎉 Expediente creado con éxito:', data)
      queryClient.invalidateQueries({ queryKey: ['cases'] })
      toast({ 
        title: 'Expediente creado', 
        description: `El expediente "${data.title}" ha sido creado correctamente.` 
      })
    },
    onError: (error: any) => {
      console.error('❌ Error al crear expediente:', error)
      toast({ 
        title: 'Error al crear expediente', 
        description: error.message || 'Ha ocurrido un error inesperado', 
        variant: 'destructive' 
      })
    },
  })

  const deleteCaseMutation = useMutation({
    mutationFn: async (caseId: string) => {
      console.log('🗑️ Eliminando expediente:', caseId)
      
      const { error } = await supabase
        .from('cases')
        .delete()
        .eq('id', caseId)

      if (error) {
        console.error('❌ Error eliminando expediente:', error)
        throw error
      }

      console.log('✅ Expediente eliminado exitosamente')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cases'] })
      toast({ 
        title: 'Expediente eliminado', 
        description: 'El expediente ha sido eliminado permanentemente.' 
      })
    },
    onError: (error: any) => {
      console.error('❌ Error al eliminar expediente:', error)
      toast({ 
        title: 'Error al eliminar expediente', 
        description: error.message || 'Ha ocurrido un error inesperado', 
        variant: 'destructive' 
      })
    },
  })

  const archiveCaseMutation = useMutation({
    mutationFn: async (caseId: string) => {
      console.log('📦 Cambiando estado de archivo del expediente:', caseId)
      
      // First get the current status
      const { data: currentCase, error: fetchError } = await supabase
        .from('cases')
        .select('status')
        .eq('id', caseId)
        .single()

      if (fetchError) {
        console.error('❌ Error obteniendo expediente:', fetchError)
        throw fetchError
      }

      const newStatus = currentCase.status === 'archived' ? 'open' : 'archived'
      
      const { error } = await supabase
        .from('cases')
        .update({ status: newStatus })
        .eq('id', caseId)

      if (error) {
        console.error('❌ Error cambiando estado de archivo:', error)
        throw error
      }

      console.log('✅ Estado de archivo cambiado exitosamente')
      return { oldStatus: currentCase.status, newStatus }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['cases'] })
      const action = data.newStatus === 'archived' ? 'archivado' : 'desarchivado'
      toast({ 
        title: `Expediente ${action}`, 
        description: `El expediente ha sido ${action} correctamente.` 
      })
    },
    onError: (error: any) => {
      console.error('❌ Error al cambiar estado de archivo:', error)
      toast({ 
        title: 'Error al cambiar estado', 
        description: error.message || 'Ha ocurrido un error inesperado', 
        variant: 'destructive' 
      })
    },
  })

  const filteredCases = cases.filter(case_ => {
    const matchesSearch = case_.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      case_.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      case_.client?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      case_.matter_number?.toLowerCase().includes(searchTerm.toLowerCase())
    
    // Updated status filter logic
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'active' && case_.status !== 'archived') ||
      (statusFilter === 'archived' && case_.status === 'archived') ||
      case_.status === statusFilter
      
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
    createCase: createCaseMutation.mutate,
    isCreating: createCaseMutation.isPending,
    isCreateSuccess: createCaseMutation.isSuccess,
    createCaseReset: createCaseMutation.reset,
    deleteCase: deleteCaseMutation.mutate,
    isDeleting: deleteCaseMutation.isPending,
    archiveCase: archiveCaseMutation.mutate,
    isArchiving: archiveCaseMutation.isPending,
  }
}
