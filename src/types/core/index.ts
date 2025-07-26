/**
 * Tipos fundamentales del sistema
 * Estos tipos son la base de toda la aplicación
 */

export interface BaseEntity {
  id: string
  created_at: string
  updated_at: string
  org_id: string
}

export interface User extends BaseEntity {
  email: string
  role: UserRole
  first_name?: string
  last_name?: string
  avatar_url?: string
  is_active: boolean
}

export type UserRole = 'partner' | 'area_manager' | 'senior' | 'junior' | 'finance' | 'client'

export interface Organization {
  id: string
  name: string
  subscription_status: 'active' | 'inactive' | 'trial'
  created_at: string
  updated_at: string
}

export interface APIResponse<T = unknown> {
  data: T | null
  error: string | null
  success: boolean
}

export interface APIListResponse<T> extends Omit<APIResponse<T[]>, 'data'> {
  data: T[]
  count?: number
  total_pages?: number
  current_page?: number
}

export interface PaginationParams {
  page: number
  limit: number
  offset?: number
}

export interface SortParams {
  column: string
  direction: 'asc' | 'desc'
}

export interface FilterParams {
  [key: string]: string | number | boolean | null | undefined
}

export interface QueryParams {
  pagination?: PaginationParams
  sort?: SortParams[]
  filters?: FilterParams
  search?: string
}