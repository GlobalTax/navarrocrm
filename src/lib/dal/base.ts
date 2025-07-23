
import { supabase } from '@/integrations/supabase/client'
import { DALResponse, DALListResponse, QueryOptions } from './types'

export abstract class BaseDAL<T> {
  protected tableName: string

  constructor(tableName: string) {
    this.tableName = tableName
  }

  protected async handleResponse<R>(
    queryPromise: Promise<{ data: R | null; error: any }>
  ): Promise<DALResponse<R>> {
    try {
      const { data, error } = await queryPromise
      return {
        data,
        error,
        success: !error
      }
    } catch (error) {
      return {
        data: null,
        error: error as Error,
        success: false
      }
    }
  }

  protected buildQuery(options: QueryOptions = {}) {
    let query = supabase.from(this.tableName)

    // Select específico o todos los campos
    if (options.select) {
      query = query.select(options.select)
    } else {
      query = query.select('*')
    }

    // Aplicar filtros
    if (options.filters) {
      Object.entries(options.filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          query = query.eq(key, value)
        }
      })
    }

    // Aplicar ordenamiento
    if (options.sort) {
      options.sort.forEach(({ column, ascending = true }) => {
        query = query.order(column, { ascending })
      })
    }

    // Aplicar paginación
    if (options.pagination) {
      const { offset, limit } = options.pagination
      if (offset !== undefined) {
        query = query.range(offset, offset + (limit || 10) - 1)
      }
    }

    return query
  }

  async findById(id: string, select?: string): Promise<DALResponse<T>> {
    const query = select 
      ? supabase.from(this.tableName).select(select).eq('id', id).single()
      : supabase.from(this.tableName).select('*').eq('id', id).single()
    
    return this.handleResponse(query)
  }

  async findMany(options: QueryOptions = {}): Promise<DALListResponse<T>> {
    const query = this.buildQuery(options)
    return this.handleResponse(query)
  }

  async create(data: Partial<T>): Promise<DALResponse<T>> {
    const query = supabase
      .from(this.tableName)
      .insert(data)
      .select()
      .single()
    
    return this.handleResponse(query)
  }

  async update(id: string, data: Partial<T>): Promise<DALResponse<T>> {
    const query = supabase
      .from(this.tableName)
      .update(data)
      .eq('id', id)
      .select()
      .single()
    
    return this.handleResponse(query)
  }

  async delete(id: string): Promise<DALResponse<void>> {
    const query = supabase
      .from(this.tableName)
      .delete()
      .eq('id', id)
    
    return this.handleResponse(query)
  }

  async count(filters?: Record<string, any>): Promise<DALResponse<number>> {
    let query = supabase
      .from(this.tableName)
      .select('*', { count: 'exact', head: true })

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          query = query.eq(key, value)
        }
      })
    }

    const response = await query
    return {
      data: response.count || 0,
      error: response.error,
      success: !response.error
    }
  }
}
