/**
 * Hook central para gestión de time tracking
 */

import { useState } from 'react'
import { useTimeEntries } from '@/hooks/useTimeEntries'
import { TimeTrackingFilters, TimerState } from '../types'

export const useTimeTracking = () => {
  // Estado de filtros
  const [filters, setFilters] = useState<TimeTrackingFilters>({
    search: '',
    case_id: 'all',
    is_billable: 'all',
    entry_type: 'all',
    date_range: null
  })

  // Estado del timer
  const [timerState, setTimerState] = useState<TimerState>({
    isRunning: false,
    isPaused: false,
    seconds: 0,
    startTime: null,
    case_id: null,
    description: ''
  })

  // Hook de time entries existente
  const timeEntriesHook = useTimeEntries()

  // Funciones del timer
  const startTimer = (case_id?: string) => {
    setTimerState(prev => ({
      ...prev,
      isRunning: true,
      isPaused: false,
      startTime: new Date(),
      case_id: case_id || null
    }))
  }

  const pauseTimer = () => {
    setTimerState(prev => ({
      ...prev,
      isPaused: true
    }))
  }

  const resumeTimer = () => {
    setTimerState(prev => ({
      ...prev,
      isPaused: false
    }))
  }

  const stopTimer = () => {
    setTimerState(prev => ({
      ...prev,
      isRunning: false,
      isPaused: false
    }))
  }

  const resetTimer = () => {
    setTimerState({
      isRunning: false,
      isPaused: false,
      seconds: 0,
      startTime: null,
      case_id: null,
      description: ''
    })
  }

  // Filtrar entradas de tiempo
  const filteredEntries = timeEntriesHook.timeEntries.filter(entry => {
    const matchesSearch = !filters.search || 
      entry.description?.toLowerCase().includes(filters.search.toLowerCase()) ||
      entry.case?.title?.toLowerCase().includes(filters.search.toLowerCase())
    
    const matchesCase = filters.case_id === 'all' || entry.case_id === filters.case_id
    
    const matchesBillable = filters.is_billable === 'all' || 
      (filters.is_billable === 'billable' && entry.is_billable) ||
      (filters.is_billable === 'non-billable' && !entry.is_billable)
    
    const matchesType = filters.entry_type === 'all' || entry.entry_type === filters.entry_type

    return matchesSearch && matchesCase && matchesBillable && matchesType
  })

  // Calcular estadísticas
  const stats = {
    total_hours: filteredEntries.reduce((sum, entry) => sum + (entry.duration_minutes / 60), 0),
    billable_hours: filteredEntries
      .filter(entry => entry.is_billable)
      .reduce((sum, entry) => sum + (entry.duration_minutes / 60), 0),
    non_billable_hours: filteredEntries
      .filter(entry => !entry.is_billable)
      .reduce((sum, entry) => sum + (entry.duration_minutes / 60), 0),
    total_entries: filteredEntries.length,
    utilization_rate: 0, // Se calculará después
    avg_entry_duration: filteredEntries.length > 0 
      ? filteredEntries.reduce((sum, entry) => sum + entry.duration_minutes, 0) / filteredEntries.length / 60
      : 0,
    entries_by_type: filteredEntries.reduce((acc, entry) => {
      acc[entry.entry_type] = (acc[entry.entry_type] || 0) + 1
      return acc
    }, {} as Record<string, number>)
  }

  stats.utilization_rate = stats.total_hours > 0 
    ? (stats.billable_hours / stats.total_hours) * 100 
    : 0

  return {
    // Time entries
    timeEntries: filteredEntries,
    isLoading: timeEntriesHook.isLoading,
    error: timeEntriesHook.error,
    
    // Filters
    filters,
    setFilters,
    
    // Timer state
    timerState,
    setTimerState,
    
    // Timer actions
    startTimer,
    pauseTimer,
    resumeTimer,
    stopTimer,
    resetTimer,
    
    // Statistics
    stats,
    
    // Mutations
    createTimeEntry: timeEntriesHook.createTimeEntry,
    deleteTimeEntry: timeEntriesHook.deleteTimeEntry,
    isCreating: timeEntriesHook.isCreating,
    isDeleting: timeEntriesHook.isDeleting
  }
}