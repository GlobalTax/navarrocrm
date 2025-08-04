/**
 * Time Tracking Components Module
 */

import React from 'react'

// Re-export de componentes existentes
export { HeaderTimerDialog } from '@/components/layout/HeaderTimerDialog'
export { ClientTimer } from '@/components/clients/ClientTimer'

// Re-export de componentes del dashboard con alias
export { EnhancedActiveTimer as ActiveTimer } from '@/components/dashboard/EnhancedActiveTimer'

// Placeholder para componentes que crearemos
export const TimeEntryForm = () => {
  return React.createElement('div', null, 'TimeEntryForm - To be implemented')
}

export const TimeEntriesList = () => {
  return React.createElement('div', null, 'TimeEntriesList - To be implemented')
}

export const TimeTrackingStats = () => {
  return React.createElement('div', null, 'TimeTrackingStats - To be implemented')
}