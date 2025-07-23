import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { useApp } from '@/contexts/AppContext'

export interface DuplicateGroup {
  quantum_id: string
  duplicate_count: number
  contact_names: string[]
}

export const useDuplicateDetection = () => {
  const { user } = useApp()

  return useQuery({
    queryKey: ['duplicate-detection', user?.org_id],
    queryFn: async (): Promise<DuplicateGroup[]> => {
      if (!user?.org_id) {
        return []
      }

      console.log('🔍 Detectando duplicados para org:', user.org_id)
      
      // Usar consulta SQL directa para obtener duplicados
      const { data, error } = await supabase
        .from('contacts')
        .select(`
          quantum_customer_id,
          name,
          org_id
        `)
        .eq('org_id', user.org_id)
        .not('quantum_customer_id', 'is', null)
        .eq('client_type', 'empresa')

      if (error) {
        console.error('❌ Error detectando duplicados:', error)
        throw error
      }

      // Procesar los datos para encontrar duplicados
      const duplicateGroups: DuplicateGroup[] = []
      const grouped = data?.reduce((acc, contact) => {
        const key = contact.quantum_customer_id!
        if (!acc[key]) {
          acc[key] = []
        }
        acc[key].push(contact.name)
        return acc
      }, {} as Record<string, string[]>) || {}

      Object.entries(grouped).forEach(([quantumId, names]) => {
        if (names.length > 1) {
          duplicateGroups.push({
            quantum_id: quantumId,
            duplicate_count: names.length,
            contact_names: names
          })
        }
      })

      console.log('✅ Duplicados detectados:', duplicateGroups.length)
      return duplicateGroups
    },
    enabled: !!user?.org_id,
    staleTime: 1 * 60 * 1000, // 1 minuto
    gcTime: 5 * 60 * 1000, // 5 minutos
  })
}

// Hook para verificar si un contacto específico es duplicado
export const useContactDuplicateCheck = (quantumCustomerId?: string) => {
  const { user } = useApp()

  return useQuery({
    queryKey: ['contact-duplicate', quantumCustomerId, user?.org_id],
    queryFn: async (): Promise<boolean> => {
      if (!quantumCustomerId || !user?.org_id) {
        return false
      }

      const { count, error } = await supabase
        .from('contacts')
        .select('*', { count: 'exact', head: true })
        .eq('quantum_customer_id', quantumCustomerId)
        .eq('org_id', user.org_id)

      if (error) {
        console.error('❌ Error verificando duplicado:', error)
        return false
      }

      return (count || 0) > 1
    },
    enabled: !!quantumCustomerId && !!user?.org_id,
    staleTime: 5 * 60 * 1000, // 5 minutos
  })
}