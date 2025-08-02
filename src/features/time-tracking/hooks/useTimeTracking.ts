/**
 * Hook principal para Time Tracking
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { performanceLogger } from '@/utils/logging'
import { useApp } from '@/contexts/AppContext'
import { TimeTrackingService } from '../services/TimeTrackingService'
import type { 
  CreateTimeEntryData, 
  UpdateTimeEntryData, 
  TimeTrackingFilters 
} from '../types'

// Query keys
export const TIME_TRACKING_KEYS = {
  all: ['time-tracking'] as const,
  entries: (filters?: TimeTrackingFilters) => ['time-tracking', 'entries', filters] as const,
  stats: (userId?: string, dateRange?: { start: string; end: string }) => 
    ['time-tracking', 'stats', userId, dateRange] as const,
  templates: () => ['time-tracking', 'templates'] as const,
}

/**
 * Hook para obtener entradas de tiempo
 */
export const useTimeEntries = (filters?: TimeTrackingFilters) => {
  return useQuery({
    queryKey: TIME_TRACKING_KEYS.entries(filters),
    queryFn: () => TimeTrackingService.getTimeEntries(filters),
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
  })
}

/**
 * Hook para crear entrada de tiempo
 */
export const useCreateTimeEntry = () => {
  const queryClient = useQueryClient()
  const { user } = useApp()

  return useMutation({
    mutationFn: (data: CreateTimeEntryData) => {
      if (!user?.id || !user?.org_id) {
        throw new Error('Usuario no autenticado')
      }
      return TimeTrackingService.createTimeEntry({
        ...data,
        org_id: user.org_id,
        user_id: user.id
      })
    },
    onSuccess: (data) => {
      performanceLogger.info('Entrada de tiempo creada', { id: data.id })
      
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ 
        queryKey: TIME_TRACKING_KEYS.all 
      })
      
      toast.success('Tiempo registrado correctamente')
    },
    onError: (error: any) => {
      performanceLogger.error('Error creando entrada de tiempo', { error })
      toast.error(error.message || 'Error al registrar tiempo')
    }
  })
}

/**
 * Hook para actualizar entrada de tiempo
 */
export const useUpdateTimeEntry = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: UpdateTimeEntryData) => TimeTrackingService.updateTimeEntry(data),
    onSuccess: (data) => {
      performanceLogger.info('Entrada de tiempo actualizada', { id: data.id })
      
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ 
        queryKey: TIME_TRACKING_KEYS.all 
      })
      
      toast.success('Entrada actualizada correctamente')
    },
    onError: (error: any) => {
      performanceLogger.error('Error actualizando entrada de tiempo', { error })
      toast.error(error.message || 'Error al actualizar entrada')
    }
  })
}

/**
 * Hook para eliminar entrada de tiempo
 */
export const useDeleteTimeEntry = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => TimeTrackingService.deleteTimeEntry(id),
    onSuccess: () => {
      performanceLogger.info('Entrada de tiempo eliminada')
      
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ 
        queryKey: TIME_TRACKING_KEYS.all 
      })
      
      toast.success('Entrada eliminada correctamente')
    },
    onError: (error: any) => {
      performanceLogger.error('Error eliminando entrada de tiempo', { error })
      toast.error(error.message || 'Error al eliminar entrada')
    }
  })
}

/**
 * Hook para obtener estadísticas de tiempo
 */
export const useTimeTrackingStats = (
  userId?: string, 
  dateRange?: { start: string; end: string }
) => {
  return useQuery({
    queryKey: TIME_TRACKING_KEYS.stats(userId, dateRange),
    queryFn: () => TimeTrackingService.getTimeTrackingStats(userId, dateRange),
    staleTime: 2 * 60 * 1000, // 2 minutos
    enabled: !!(userId || dateRange), // Solo ejecutar si hay filtros
  })
}

/**
 * Hook para actualización en lote de estados
 */
export const useBulkUpdateTimeEntries = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ ids, entryType }: { ids: string[]; entryType: string }) => 
      TimeTrackingService.bulkUpdateStatus(ids, entryType),
    onSuccess: (data) => {
      performanceLogger.info('Actualización en lote completada', { 
        count: data.length 
      })
      
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ 
        queryKey: TIME_TRACKING_KEYS.all 
      })
      
      toast.success(`${data.length} entradas actualizadas`)
    },
    onError: (error: any) => {
      performanceLogger.error('Error en actualización en lote', { error })
      toast.error(error.message || 'Error al actualizar entradas')
    }
  })
}

// Eliminar hook de plantillas ya que no existe la tabla
// export const useTimeTemplates = () => {
//   return useQuery({
//     queryKey: TIME_TRACKING_KEYS.templates(),
//     queryFn: () => TimeTrackingService.getTimeTemplates(),
//     staleTime: 10 * 60 * 1000, // 10 minutos
//     gcTime: 30 * 60 * 1000, // 30 minutos
//   })
// }