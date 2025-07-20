
// Interfaces para configuraciones y constantes tipadas

export interface AppConfig {
  apiUrl: string
  version: string
  environment: 'development' | 'staging' | 'production'
  features: {
    ai: boolean
    quantumSync: boolean
    bulkUpload: boolean
    analytics: boolean
  }
  limits: {
    maxFileSize: number
    maxBulkRecords: number
    maxSearchResults: number
  }
}

export interface UITheme {
  primary: string
  secondary: string
  accent: string
  background: string
  surface: string
  text: string
  error: string
  warning: string
  success: string
}

export interface NavigationItem {
  id: string
  label: string
  path: string
  icon: string
  badge?: number
  children?: NavigationItem[]
  roles?: string[]
  isActive?: boolean
}

export interface QuickAction {
  id: string
  label: string
  action: () => void
  icon: string
  shortcut?: string
  enabled: boolean
  roles?: string[]
}

export interface TableColumn<T = any> {
  key: keyof T
  label: string
  sortable: boolean
  filterable: boolean
  width?: string
  align?: 'left' | 'center' | 'right'
  render?: (value: any, row: T) => React.ReactNode
}

export interface PaginationConfig {
  page: number
  pageSize: number
  total: number
  showSizeChanger: boolean
  pageSizeOptions: number[]
}

export interface SearchConfig {
  placeholder: string
  fields: string[]
  minLength: number
  debounceMs: number
  caseSensitive: boolean
}
