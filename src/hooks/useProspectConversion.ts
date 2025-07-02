import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { useApp } from '@/contexts/AppContext'
import { toast } from 'sonner'

export const useProspectConversion = () => {
  const { user } = useApp()
  const queryClient = useQueryClient()
  const [selectedProspect, setSelectedProspect] = useState<any>(null)

  const convertProspectToClient = useMutation({
    mutationFn: async (updatedData: any) => {
      if (!user?.org_id) throw new Error('Usuario no autenticado')
      if (!selectedProspect) throw new Error('No hay prospecto seleccionado')

      // Actualizar el prospecto existente para convertirlo en cliente
      const clientData = {
        ...updatedData,
        relationship_type: 'cliente',
        status: 'activo',
        last_contact_date: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      const { data, error } = await supabase
        .from('contacts')
        .update(clientData)
        .eq('id', selectedProspect.id)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: (client) => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] })
      queryClient.invalidateQueries({ queryKey: ['clients'] })
      
      toast.success(
        `¡Prospecto "${client.name}" convertido a cliente exitosamente!`,
        {
          description: 'El cliente ya está disponible en tu cartera'
        }
      )
      
      // Limpiar selección
      setSelectedProspect(null)
    },
    onError: (error) => {
      console.error('Error converting prospect to client:', error)
      toast.error('Error al convertir el prospecto a cliente')
    }
  })

  const selectProspect = (prospect: any) => {
    setSelectedProspect(prospect)
  }

  const clearSelection = () => {
    setSelectedProspect(null)
  }

  const getConversionStats = (contacts: any[]) => {
    const prospects = contacts.filter(c => c.relationship_type === 'prospecto')
    const clients = contacts.filter(c => c.relationship_type === 'cliente')
    const recentConversions = clients.filter(c => {
      const updatedAt = new Date(c.updated_at)
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)
      return updatedAt > weekAgo
    })

    return {
      totalProspects: prospects.length,
      totalClients: clients.length,
      recentConversions: recentConversions.length,
      conversionRate: prospects.length > 0 
        ? Math.round((clients.length / (prospects.length + clients.length)) * 100)
        : 0
    }
  }

  return {
    selectedProspect,
    selectProspect,
    clearSelection,
    convertProspectToClient,
    isConverting: convertProspectToClient.isPending,
    getConversionStats
  }
}