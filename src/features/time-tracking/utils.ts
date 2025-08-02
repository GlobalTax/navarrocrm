/**
 * Utilidades para Time Tracking
 */

import { TIMER_STORAGE_KEY, DEFAULT_TIMER_STATE } from './constants'
import type { TimerState, TimeEntry } from './types'

/**
 * Formatear duración en minutos a formato legible
 */
export const formatDuration = (minutes: number): string => {
  if (minutes < 60) {
    return `${minutes}m`
  }
  
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  
  if (remainingMinutes === 0) {
    return `${hours}h`
  }
  
  return `${hours}h ${remainingMinutes}m`
}

/**
 * Formatear tiempo del timer en formato HH:MM:SS
 */
export const formatTimerTime = (totalSeconds: number): string => {
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
}

/**
 * Convertir segundos a minutos (redondeado)
 */
export const secondsToMinutes = (seconds: number): number => {
  return Math.round(seconds / 60)
}

/**
 * Calcular el monto facturable - Simplificado sin hourly_rate
 */
export const calculateBillableAmount = (
  durationMinutes: number, 
  hourlyRate: number = 0
): number => {
  const hours = durationMinutes / 60
  return Number((hours * hourlyRate).toFixed(2))
}

/**
 * Guardar estado del timer en localStorage
 */
export const saveTimerState = (state: TimerState): void => {
  try {
    const serializedState = {
      ...state,
      startTime: state.startTime?.toISOString() || null
    }
    localStorage.setItem(TIMER_STORAGE_KEY, JSON.stringify(serializedState))
  } catch (error) {
    console.warn('Error guardando estado del timer:', error)
  }
}

/**
 * Obtener estado del timer desde localStorage
 */
export const loadTimerState = (): TimerState => {
  try {
    const savedState = localStorage.getItem(TIMER_STORAGE_KEY)
    if (!savedState) return DEFAULT_TIMER_STATE

    const parsed = JSON.parse(savedState)
    return {
      ...parsed,
      startTime: parsed.startTime ? new Date(parsed.startTime) : null
    }
  } catch (error) {
    console.warn('Error cargando estado del timer:', error)
    return DEFAULT_TIMER_STATE
  }
}

/**
 * Limpiar estado del timer
 */
export const clearTimerState = (): void => {
  try {
    localStorage.removeItem(TIMER_STORAGE_KEY)
  } catch (error) {
    console.warn('Error limpiando estado del timer:', error)
  }
}

/**
 * Validar entrada de tiempo - Simplificado
 */
export const validateTimeEntry = (entry: Partial<TimeEntry>): string[] => {
  const errors: string[] = []

  if (!entry.description?.trim()) {
    errors.push('La descripción es requerida')
  }

  if (!entry.duration_minutes || entry.duration_minutes <= 0) {
    errors.push('La duración debe ser mayor a 0')
  }

  if (entry.duration_minutes && entry.duration_minutes > 1440) {
    errors.push('La duración no puede ser mayor a 24 horas')
  }

  return errors
}

/**
 * Agrupar entradas por fecha - Usa created_at como fallback
 */
export const groupEntriesByDate = (entries: TimeEntry[]): Record<string, TimeEntry[]> => {
  return entries.reduce((groups, entry) => {
    const date = entry.created_at?.split('T')[0] || 'unknown'
    if (!groups[date]) {
      groups[date] = []
    }
    groups[date].push(entry)
    return groups
  }, {} as Record<string, TimeEntry[]>)
}

/**
 * Calcular total de minutos para un grupo de entradas
 */
export const calculateTotalMinutes = (entries: TimeEntry[]): number => {
  return entries.reduce((total, entry) => total + entry.duration_minutes, 0)
}

/**
 * Calcular total facturable - Simplificado sin hourly_rate
 */
export const calculateTotalBillable = (entries: TimeEntry[]): number => {
  return entries
    .filter(entry => entry.is_billable)
    .reduce((total, entry) => {
      // Sin hourly_rate, solo devolvemos el total de minutos facturables
      return total + entry.duration_minutes
    }, 0)
}

/**
 * Filtrar entradas por rango de fechas - Usa created_at
 */
export const filterEntriesByDateRange = (
  entries: TimeEntry[],
  startDate: string,
  endDate: string
): TimeEntry[] => {
  return entries.filter(entry => {
    const entryDate = entry.created_at?.split('T')[0]
    return entryDate && entryDate >= startDate && entryDate <= endDate
  })
}

/**
 * Obtener fechas de la semana actual
 */
export const getCurrentWeekRange = (): { start: string; end: string } => {
  const now = new Date()
  const dayOfWeek = now.getDay()
  const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1) // adjust when day is sunday

  const monday = new Date(now.setDate(diff))
  const sunday = new Date(now.setDate(diff + 6))

  return {
    start: monday.toISOString().split('T')[0],
    end: sunday.toISOString().split('T')[0]
  }
}

/**
 * Obtener fechas del mes actual
 */
export const getCurrentMonthRange = (): { start: string; end: string } => {
  const now = new Date()
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0)

  return {
    start: firstDay.toISOString().split('T')[0],
    end: lastDay.toISOString().split('T')[0]
  }
}