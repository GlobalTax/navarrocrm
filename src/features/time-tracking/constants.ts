/**
 * Constants para el feature de Time Tracking
 */

export const TIME_ENTRY_STATUS = {
  DRAFT: 'draft',
  SUBMITTED: 'submitted',
  APPROVED: 'approved',
  INVOICED: 'invoiced'
} as const

export const TIME_ENTRY_STATUS_LABELS = {
  [TIME_ENTRY_STATUS.DRAFT]: 'Borrador',
  [TIME_ENTRY_STATUS.SUBMITTED]: 'Enviado',
  [TIME_ENTRY_STATUS.APPROVED]: 'Aprobado',
  [TIME_ENTRY_STATUS.INVOICED]: 'Facturado'
} as const

export const DEFAULT_TIMER_STATE = {
  isRunning: false,
  isPaused: false,
  seconds: 0,
  startTime: null,
  description: '',
  caseId: undefined,
  contactId: undefined,
  isBillable: true
}

export const TIMER_STORAGE_KEY = 'crm_timer_state'
export const TIMER_AUTO_SAVE_INTERVAL = 30000 // 30 segundos

export const TIME_INTERVALS = [
  { value: 15, label: '15 min' },
  { value: 30, label: '30 min' },
  { value: 60, label: '1 hora' },
  { value: 120, label: '2 horas' },
  { value: 240, label: '4 horas' },
  { value: 480, label: '8 horas' }
]

export const COMMON_TIME_DESCRIPTIONS = [
  'Revisión de documentos',
  'Reunión con cliente',
  'Investigación legal',
  'Redacción de escritos',
  'Llamada telefónica',
  'Análisis de caso',
  'Preparación de documentos',
  'Consulta interna'
]

export const BILLING_RATES = {
  PARTNER: 150,
  SENIOR: 120,
  JUNIOR: 80,
  PARALEGAL: 60
} as const

export const TIME_TRACKING_PERMISSIONS = {
  VIEW_ALL: 'time_tracking:view_all',
  VIEW_OWN: 'time_tracking:view_own',
  CREATE: 'time_tracking:create',
  EDIT_OWN: 'time_tracking:edit_own',
  EDIT_ALL: 'time_tracking:edit_all',
  APPROVE: 'time_tracking:approve',
  DELETE: 'time_tracking:delete'
} as const