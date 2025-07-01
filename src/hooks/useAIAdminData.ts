
import { useState } from 'react'
import { useEnhancedAIUsage } from '@/hooks/useEnhancedAIUsage'
import { useIsSuperAdmin } from '@/hooks/useAIUsage'
import { toast } from 'sonner'

export const useAIAdminData = () => {
  const { isSuperAdmin, isLoading: isLoadingRoles } = useIsSuperAdmin()
  const [selectedMonth, setSelectedMonth] = useState(new Date())
  
  const { 
    data: enhancedData, 
    isLoading: isLoadingUsage, 
    error 
  } = useEnhancedAIUsage(6) // Últimos 6 meses

  if (error) {
    toast.error('Error al cargar los datos de uso de IA')
  }

  return {
    isSuperAdmin,
    isLoadingRoles,
    selectedMonth,
    setSelectedMonth,
    enhancedData,
    isLoadingUsage,
    // Mantener compatibilidad con la interfaz anterior
    usageData: enhancedData ? {
      logs: [],
      stats: enhancedData
    } : undefined
  }
}
