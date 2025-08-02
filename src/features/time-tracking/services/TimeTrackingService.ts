/**
 * Servicio principal para Time Tracking
 */

import { supabase } from '@/integrations/supabase/client'
import { performanceLogger } from '@/utils/logging'
import type { 
  TimeEntry, 
  CreateTimeEntryData, 
  UpdateTimeEntryData, 
  TimeTrackingFilters,
  TimeTrackingStats,
  TimeTemplate
} from '../types'

export class TimeTrackingService {
  
  /**
   * Obtener entradas de tiempo con filtros
   */
  static async getTimeEntries(filters: TimeTrackingFilters = {}) {
    performanceLogger.info('Obteniendo entradas de tiempo', { filters })
    
    try {
      let query = supabase
        .from('time_entries')
        .select(`
          *,
          case:cases(id, title, status),
          contact:contacts(id, name),
          user:users!time_entries_user_id_fkey(id, email)
        `)
        .order('created_at', { ascending: false })

      // Aplicar filtros
      if (filters.dateRange) {
        query = query
          .gte('date', filters.dateRange.start)
          .lte('date', filters.dateRange.end)
      }

      if (filters.userId) {
        query = query.eq('user_id', filters.userId)
      }

      if (filters.caseId) {
        query = query.eq('case_id', filters.caseId)
      }

      if (typeof filters.isBillable === 'boolean') {
        query = query.eq('is_billable', filters.isBillable)
      }

      if (filters.entryType) {
        query = query.eq('entry_type', filters.entryType)
      }

      const { data, error } = await query

      if (error) {
        performanceLogger.error('Error obteniendo entradas de tiempo', { error })
        throw error
      }

      performanceLogger.info('Entradas de tiempo obtenidas exitosamente', { 
        count: data?.length || 0 
      })

      return data as TimeEntry[]
    } catch (error) {
      performanceLogger.error('Error en getTimeEntries', { error })
      throw error
    }
  }

  /**
   * Crear nueva entrada de tiempo
   */
  static async createTimeEntry(data: CreateTimeEntryData & { org_id: string; user_id: string }) {
    performanceLogger.info('Creando entrada de tiempo', { data })

    try {
      const { data: result, error } = await supabase
        .from('time_entries')
        .insert({
          org_id: data.org_id,
          user_id: data.user_id,
          case_id: data.case_id || null,
          description: data.description || null,
          duration_minutes: data.duration_minutes,
          is_billable: data.is_billable !== false,
          entry_type: data.entry_type || 'billable',
        })
        .select()
        .single()

      if (error) {
        performanceLogger.error('Error creando entrada de tiempo', { error })
        throw error
      }

      performanceLogger.info('Entrada de tiempo creada exitosamente', { 
        id: result.id 
      })

      return result as TimeEntry
    } catch (error) {
      performanceLogger.error('Error en createTimeEntry', { error })
      throw error
    }
  }

  /**
   * Actualizar entrada de tiempo
   */
  static async updateTimeEntry(data: UpdateTimeEntryData) {
    performanceLogger.info('Actualizando entrada de tiempo', { 
      id: data.id 
    })

    try {
      const { id, ...updateData } = data
      
      const { data: result, error } = await supabase
        .from('time_entries')
        .update({
          ...updateData,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single()

      if (error) {
        performanceLogger.error('Error actualizando entrada de tiempo', { error })
        throw error
      }

      performanceLogger.info('Entrada de tiempo actualizada exitosamente', { 
        id: result.id 
      })

      return result as TimeEntry
    } catch (error) {
      performanceLogger.error('Error en updateTimeEntry', { error })
      throw error
    }
  }

  /**
   * Eliminar entrada de tiempo
   */
  static async deleteTimeEntry(id: string) {
    performanceLogger.info('Eliminando entrada de tiempo', { id })

    try {
      const { error } = await supabase
        .from('time_entries')
        .delete()
        .eq('id', id)

      if (error) {
        performanceLogger.error('Error eliminando entrada de tiempo', { error })
        throw error
      }

      performanceLogger.info('Entrada de tiempo eliminada exitosamente', { id })
      return true
    } catch (error) {
      performanceLogger.error('Error en deleteTimeEntry', { error })
      throw error
    }
  }

  /**
   * Obtener estadísticas de tiempo
   */
  static async getTimeTrackingStats(
    userId?: string, 
    dateRange?: { start: string; end: string }
  ): Promise<TimeTrackingStats> {
    performanceLogger.info('Obteniendo estadísticas de tiempo', { 
      userId, 
      dateRange 
    })

    try {
      let query = supabase
        .from('time_entries')
        .select('duration_minutes, is_billable')

      if (userId) {
        query = query.eq('user_id', userId)
      }

      if (dateRange) {
        query = query
          .gte('created_at', dateRange.start)
          .lte('created_at', dateRange.end)
      }

      const { data, error } = await query

      if (error) {
        performanceLogger.error('Error obteniendo estadísticas', { error })
        throw error
      }

      // Calcular estadísticas
      const stats = data.reduce((acc, entry) => {
        const hours = entry.duration_minutes / 60
        acc.totalHours += hours
        acc.entriesCount += 1

        if (entry.is_billable) {
          acc.billableHours += hours
        } else {
          acc.nonBillableHours += hours
        }

        return acc
      }, {
        totalHours: 0,
        billableHours: 0,
        nonBillableHours: 0,
        totalEarnings: 0,
        averageHourlyRate: 0,
        entriesCount: 0
      })

      performanceLogger.info('Estadísticas calculadas exitosamente', { stats })
      return stats
    } catch (error) {
      performanceLogger.error('Error en getTimeTrackingStats', { error })
      throw error
    }
  }

  /**
   * Cambiar estado de múltiples entradas
   */
  static async bulkUpdateStatus(ids: string[], entryType: string) {
    performanceLogger.info('Actualizando entry_type en lote', { ids, entryType })

    try {
      const { data, error } = await supabase
        .from('time_entries')
        .update({ 
          entry_type: entryType,
          updated_at: new Date().toISOString() 
        })
        .in('id', ids)
        .select()

      if (error) {
        performanceLogger.error('Error en actualización en lote', { error })
        throw error
      }

      performanceLogger.info('Actualización en lote completada', { 
        count: data?.length || 0 
      })

      return data as TimeEntry[]
    } catch (error) {
      performanceLogger.error('Error en bulkUpdateStatus', { error })
      throw error
    }
  }
}