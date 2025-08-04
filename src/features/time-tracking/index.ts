/**
 * Time Tracking Feature Module
 * Punto de entrada centralizado para toda la funcionalidad de seguimiento de tiempo
 */

// Re-exports de componentes principales
export { HeaderTimerDialog } from './components'
export { ClientTimer } from './components'
export { ActiveTimer } from './components'
export { TimeEntryForm } from './components'
export { TimeEntriesList } from './components'
export { TimeTrackingStats } from './components'

// Re-exports de hooks
export { useTimeEntries } from './hooks'
export { useTimeTracking } from './hooks'

// Re-exports de tipos
export type {
  TimeEntry,
  CreateTimeEntryData,
  TimeTrackingFilters,
  TimeTrackingStats as TimeStats
} from './types'