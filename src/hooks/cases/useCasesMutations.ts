
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { useApp } from '@/contexts/AppContext'
import { useToast } from '@/hooks/use-toast'
import type { CreateCaseData } from './types'

export const useCasesMutations = () => {
  const { user } = useApp()
  const { toast } = useToast()
  const queryClient = useQueryClient()

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

  return {
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
