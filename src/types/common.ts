// Tipos comunes para reemplazar any en toda la aplicación

export interface ProposalFormData {
  clientId: string
  title: string
  description?: string
  total_amount: number
  is_recurring?: boolean
  recurring_frequency?: 'monthly' | 'quarterly' | 'yearly'
  contract_start_date?: string
  contract_end_date?: string
  billing_day?: number
  retainer_amount?: number
  included_hours?: number
  hourly_rate_extra?: number
  next_billing_date?: string
  line_items?: ProposalLineItem[]
  status?: 'draft' | 'sent' | 'won' | 'lost'
  proposal_type?: 'one_time' | 'retainer' | 'recurring'
}

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

// Tipos para configuraciones
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