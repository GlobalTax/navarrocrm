
import { supabase } from '@/integrations/supabase/client'
import { DALResponse, DALListResponse, QueryOptions } from './types'

export abstract class BaseDAL<T> {
  protected tableName: string

  constructor(tableName: string) {
    this.tableName = tableName
  }

  protected async handleResponse<R>(
    queryPromise: any
  ): Promise<DALResponse<R>> {
    try {
      const { data, error } = await queryPromise
      return {
        data: data as R,
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

  protected async handleListResponse<R>(
    queryPromise: any
  ): Promise<DALListResponse<R>> {
    try {
      const { data, error, count } = await queryPromise
      return {
        data: (data as R[]) || [],
        error,
        success: !error,
        count: count || 0
      }
    } catch (error) {
      return {
        data: [],
        error: error as Error,
        success: false,
        count: 0
      }
    }
  }

  async findById(id: string): Promise<DALResponse<T>> {
    const query = supabase
      .from(this.tableName as any)
      .select('*')
      .eq('id', id)
      .single()
    
    return this.handleResponse<T>(query)
  }

  async findMany(options: QueryOptions = {}): Promise<DALListResponse<T>> {
    let query = supabase
      .from(this.tableName as any)
      .select(options.select || '*', { count: 'exact' })

    // Aplicar filtros
    if (options.filters) {
      Object.entries(options.filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          query = query.eq(key, value)
        }
      })
    }

    // Aplicar ordenamiento
    if (options.sort && options.sort.length > 0) {
      options.sort.forEach(sortOption => {
        query = query.order(sortOption.column, { 
          ascending: sortOption.ascending !== false 
        })
      })
    }

    // Aplicar paginación
    if (options.pagination) {
      const { page, limit, offset } = options.pagination
      if (offset !== undefined) {
        query = query.range(offset, offset + (limit || 10) - 1)
      } else if (page !== undefined && limit !== undefined) {
        const start = (page - 1) * limit
        query = query.range(start, start + limit - 1)
      }
    }

    return this.handleListResponse<T>(query)
  }

  async create(data: any): Promise<DALResponse<T>> {
    const query = supabase
      .from(this.tableName as any)
      .insert(data)
      .select()
      .single()
    
    return this.handleResponse<T>(query)
  }

  async update(id: string, data: any): Promise<DALResponse<T>> {
    const query = supabase
      .from(this.tableName as any)
      .update(data)
      .eq('id', id)
      .select()
      .single()
    
    return this.handleResponse<T>(query)
  }

  async delete(id: string): Promise<DALResponse<void>> {
    const query = supabase
      .from(this.tableName as any)
      .delete()
      .eq('id', id)
    
    return this.handleResponse<void>(query)
  }
}
