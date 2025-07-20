
// Interfaces para estados complejos de componentes

// Estados de IA y análisis
export interface AIAnalysisState {
  isAnalyzing: boolean
  progress: number
  currentStep: string
  results: any[] | null
  error: string | null
}

export interface BusinessInsightState {
  insights: any[]
  isLoading: boolean
  lastUpdated: Date | null
  error: string | null
}

export interface DocumentAnalysisState {
  analysisResults: any[]
  isProcessing: boolean
  currentDocument: string | null
  progress: number
  error: string | null
}

// Estados de formularios
export interface NotificationSettings {
  email: boolean
  push: boolean
  sms: boolean
  frequency: 'instant' | 'daily' | 'weekly'
  types: string[]
}

export interface ReportFormData {
  name: string
  description: string
  metrics: string[]
  filters: Record<string, any>
  schedule: 'manual' | 'daily' | 'weekly' | 'monthly'
  recipients: string[]
  format: 'pdf' | 'excel' | 'csv'
}

export interface ContactFormState {
  isSubmitting: boolean
  hasErrors: boolean
  isDirty: boolean
  validationErrors: Record<string, string>
  lastSaved: Date | null
}

// Estados de configuración
export interface PerformanceThresholds {
  loadTimeWarning: number
  loadTimeError: number
  memoryUsageWarning: number
  memoryUsageError: number
  networkLatencyWarning: number
  networkLatencyError: number
}

export interface NavigationConfig {
  sidebarCollapsed: boolean
  activeSection: string
  breadcrumbs: Array<{
    label: string
    path: string
    isActive: boolean
  }>
  quickActions: Array<{
    label: string
    action: string
    icon: string
    enabled: boolean
  }>
}

// Estados de filtros y búsqueda
export interface FilterState {
  searchTerm: string
  activeFilters: Record<string, any>
  sortField: string
  sortDirection: 'asc' | 'desc'
  pageSize: number
  currentPage: number
}

export interface BulkUploadState {
  files: File[]
  isUploading: boolean
  progress: number
  results: Array<{
    filename: string
    status: 'pending' | 'success' | 'error'
    message?: string
  }>
  errors: string[]
}

// Estados de sincronización
export interface SyncState {
  isOnline: boolean
  lastSync: Date | null
  pendingChanges: number
  syncInProgress: boolean
  syncError: string | null
}

export interface QuantumSyncState {
  isConnected: boolean
  lastSyncTime: Date | null
  pendingRecords: number
  syncStatus: 'idle' | 'syncing' | 'error' | 'success'
  errorMessage: string | null
}
