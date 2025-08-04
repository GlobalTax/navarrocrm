import { useOptimizedDashboard } from '@/hooks/useOptimizedDashboard'

/**
 * Hook unificado que conecta con el hook optimizado existente
 * Proporciona interfaz consistente para el dashboard
 */
export const useDashboardMetrics = () => {
  const { data, isLoading, error, refetch } = useOptimizedDashboard()
  
  return {
    data,
    isLoading,
    error,
    refetch
  }
}