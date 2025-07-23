
import { PostgrestError } from '@supabase/supabase-js'

export interface DALResponse<T> {
  data: T | null
  error: PostgrestError | Error | null
  success: boolean
}

export interface DALListResponse<T> extends Omit<DALResponse<T[]>, 'data'> {
  data: T[]
  count?: number
}

export interface PaginationOptions {
  page?: number
  limit?: number
  offset?: number
}

export interface FilterOptions {
  [key: string]: any
}

export interface SortOptions {
  column: string
  ascending?: boolean
}

export interface QueryOptions {
  select?: string
  filters?: FilterOptions
  sort?: SortOptions[]
  pagination?: PaginationOptions
}
