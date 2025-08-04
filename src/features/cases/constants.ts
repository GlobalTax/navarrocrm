/**
 * Constants para el módulo de casos/expedientes
 */

import { CaseStatus, CasePriority, BillingMethod } from './types'

export const CASE_STATUS_OPTIONS = [
  { label: 'Abierto', value: 'open' as CaseStatus },
  { label: 'En espera', value: 'on_hold' as CaseStatus },
  { label: 'Cerrado', value: 'closed' as CaseStatus }
]

export const CASE_PRIORITY_OPTIONS = [
  { label: 'Baja', value: 'low' as CasePriority },
  { label: 'Media', value: 'medium' as CasePriority },
  { label: 'Alta', value: 'high' as CasePriority },
  { label: 'Urgente', value: 'urgent' as CasePriority }
]

export const BILLING_METHOD_OPTIONS = [
  { label: 'Por horas', value: 'hourly' as BillingMethod },
  { label: 'Tarifa fija', value: 'fixed' as BillingMethod },
  { label: 'Contingencia', value: 'contingency' as BillingMethod },
  { label: 'Retainer', value: 'retainer' as BillingMethod }
]

export const PRACTICE_AREAS = [
  'Civil',
  'Penal',
  'Mercantil',
  'Laboral',
  'Fiscal',
  'Administrativo',
  'Familia',
  'Inmobiliario',
  'Propiedad Intelectual',
  'Compliance'
]

export const DEFAULT_CASE_STATUS: CaseStatus = 'open'
export const DEFAULT_BILLING_METHOD: BillingMethod = 'hourly'

export const CASE_STATUS_COLORS = {
  open: 'bg-green-100 text-green-800 border-green-200',
  on_hold: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  closed: 'bg-gray-100 text-gray-800 border-gray-200'
}

export const CASE_PRIORITY_COLORS = {
  low: 'bg-blue-100 text-blue-800',
  medium: 'bg-yellow-100 text-yellow-800',
  high: 'bg-orange-100 text-orange-800',
  urgent: 'bg-red-100 text-red-800'
}

export const DEFAULT_COMMUNICATION_PREFERENCES = {
  auto_updates: true,
  milestone_notifications: true
}