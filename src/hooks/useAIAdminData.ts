
import { useState } from 'react'
import { useAIUsage, useIsSuperAdmin } from '@/hooks/useAIUsage'
import { toast } from 'sonner'

export const useAIAdminData = () => {
  const { isSuperAdmin, isLoading: isLoadingRoles } = useIsSuperAdmin()
  const [selectedMonth, setSelectedMonth] = useState(new Date())
  
  const { 
    data: usageData, 
    isLoading: isLoadingUsage, 
    error 
  } = useAIUsage(selectedMonth)

  if (error) {
    toast.error('Error al cargar los datos de uso de IA')
  }

  return {
    isSuperAdmin,
    isLoadingRoles,
    selectedMonth,
    setSelectedMonth,
    usageData,
    isLoadingUsage
  }
}
