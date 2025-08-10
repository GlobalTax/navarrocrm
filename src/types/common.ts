// Tipos comunes para reemplazar any en toda la aplicación

// ============ TIPOS DE ENTIDADES DE NEGOCIO ============

export type { ProposalFormData } from '@/types/proposals/forms'


/**
 * @deprecated Usa ProposalLineItem de '@/types/proposals'.
 * Este tipo era preliminar y puede no coincidir con el modelo final.
 */
export interface ProposalLineItem {
  id?: string
  proposal_id?: string
  description: string
  quantity: number
  unit_price: number
  total_price: number
}


export interface FormEvent extends Event {
  preventDefault: () => void
  target: EventTarget & {
    [key: string]: { value: string }
  }
}

export interface SelectOption {
  value: string
  label: string
}

export interface TableColumn<T = any> {
  key: keyof T
  label: string
  sortable?: boolean
  render?: (value: any, row: T) => React.ReactNode
}

export interface FilterOption {
  value: string
  label: string
  count?: number
}

export interface PaginationData {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface ApiResponse<T = any> {
  data?: T
  error?: string
  message?: string
  success: boolean
}

export interface FileUpload {
  file: File
  name: string
  size: number
  type: string
  lastModified: number
}

export interface ContactFormData {
  name: string
  email?: string
  phone?: string
  dni_nif?: string
  client_type: 'particular' | 'empresa'
  address_street?: string
  address_city?: string
  address_postal_code?: string
  address_country?: string
  business_sector?: string
  tags?: string[]
  relationship_type: string
  status: string
  company_id?: string
}

export interface TaskFormData {
  title: string
  description?: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled'
  due_date?: string
  start_date?: string
  estimated_hours?: number
  case_id?: string
  contact_id?: string
  assigned_users: string[]
}

export interface CaseFormData {
  title: string
  description?: string
  contact_id: string
  status: 'open' | 'closed' | 'archived'
  practice_area?: string
  billing_method: 'hourly' | 'fixed' | 'retainer'
  estimated_budget?: number
  responsible_solicitor_id?: string
  originating_solicitor_id?: string
  template_id?: string
}

// Tipos para eventos de componentes
export interface ComponentEvent<T = any> {
  target: T
  preventDefault?: () => void
  stopPropagation?: () => void
}

export interface InputChangeEvent extends ComponentEvent {
  target: {
    name: string
    value: string
    checked?: boolean
  }
}

export interface ButtonClickEvent extends ComponentEvent {
  target: HTMLButtonElement
}

// Tipos para props de componentes comunes
export interface BaseComponentProps {
  className?: string
  children?: React.ReactNode
  id?: string
}

export interface LoadingStateProps extends BaseComponentProps {
  isLoading: boolean
  error?: string | null
  loadingText?: string
  errorText?: string
}

export interface DialogProps extends BaseComponentProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  description?: string
}

export interface FormProps extends BaseComponentProps {
  onSubmit: (data: any) => void | Promise<void>
  initialData?: any
  isLoading?: boolean
  submitText?: string
  cancelText?: string
  onCancel?: () => void
}

// Tipos para datos de dashboard y métricas
export interface DashboardStats {
  totalCases: number
  activeCases: number
  totalContacts: number
  totalTimeEntries: number
  totalBillableHours: number
  totalNonBillableHours: number
  thisMonthCases: number
  thisMonthContacts: number
  thisMonthHours: number
}

export interface QuickStats {
  todayHours: number
  weekHours: number
  monthHours: number
  pendingTasks: number
  overdueTasks: number
  totalProposals: number
  wonProposals: number
  revenue: number
}

// ============ TIPOS DE EVENTOS Y FORMULARIOS ============

export interface TimeEntryFormData {
  case_id?: string
  description?: string
  duration_minutes: number
  is_billable?: boolean
  entry_type?: 'billable' | 'office_admin' | 'business_development' | 'internal'
}

export interface CalendarEventFormData {
  title: string
  description?: string
  start_datetime: string
  end_datetime: string
  is_all_day?: boolean
  location?: string
  contact_id?: string
  case_id?: string
  event_type?: 'meeting' | 'call' | 'court' | 'deadline' | 'other'
  attendees_emails?: string[]
  reminder_minutes?: number
}

export interface RecurringFeeFormData {
  name: string
  description?: string
  contact_id: string
  amount: number
  frequency: 'monthly' | 'quarterly' | 'yearly'
  start_date: string
  end_date?: string
  billing_day?: number
  included_hours?: number
  hourly_rate_extra?: number
  auto_invoice?: boolean
  payment_terms?: number
  priority?: 'low' | 'medium' | 'high'
  status?: 'active' | 'inactive' | 'pending'
}

// ============ TIPOS DE HOOKS Y MUTACIONES ============

export interface MutationState {
  isPending: boolean
  isSuccess: boolean
  isError: boolean
  error: Error | null
}

export interface QueryState<T = any> {
  data: T
  isLoading: boolean
  isError: boolean
  error: Error | null
  refetch: () => void
}

export interface PaginatedResponse<T = any> {
  data: T[]
  count: number
  hasMore: boolean
  nextCursor?: string
}

// ============ TIPOS DE COMPONENTES ESPECÍFICOS ============

export interface TableActionProps {
  onEdit?: () => void
  onDelete?: () => void
  onView?: () => void
  isLoading?: boolean
  disabled?: boolean
}

export interface FormDialogProps {
  open: boolean
  onClose: () => void
  title?: string
  initialData?: any
  onSubmit: (data: any) => Promise<void> | void
  isLoading?: boolean
}

export interface EmptyStateProps {
  title?: string
  description?: string
  actionText?: string
  onAction?: () => void
  icon?: React.ComponentType<any>
}

// ============ TIPOS DE CONFIGURACIONES ============

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system'
  language: 'es' | 'en'
  notifications: {
    email: boolean
    push: boolean
    inApp: boolean
  }
  timezone: string
}

export interface OrganizationSettings {
  name: string
  address: string
  phone: string
  email: string
  website?: string
  logo?: string
  currency: string
  dateFormat: string
  timeFormat: '12h' | '24h'
}