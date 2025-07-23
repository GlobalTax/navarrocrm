
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
      console.error(`Error in ${this.tableName} operation:`, error)
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
      console.error(`Error in ${this.tableName} list operation:`, error)
      return {
        data: [],
        error: error as Error,
        success: false,
        count: 0
      }
    }
  }

  async findById(id: string): Promise<DALResponse<T>> {
    if (!id) {
      return {
        data: null,
        error: new Error('ID is required'),
        success: false
      }
    }

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

    // Aplicar filtros con validación
    if (options.filters && typeof options.filters === 'object') {
      Object.entries(options.filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && key) {
          query = query.eq(key, value)
        }
      })
    }

    // Aplicar ordenamiento con validación
    if (options.sort && Array.isArray(options.sort) && options.sort.length > 0) {
      options.sort.forEach(sortOption => {
        if (sortOption.column) {
          query = query.order(sortOption.column, { 
            ascending: sortOption.ascending !== false 
          })
        }
      })
    }

    // Aplicar paginación con mejor null safety
    if (options.pagination) {
      const { page, limit, offset } = options.pagination
      
      if (typeof offset === 'number' && offset >= 0) {
        const safeLimit = typeof limit === 'number' && limit > 0 ? limit : 10
        query = query.range(offset, offset + safeLimit - 1)
      } else if (typeof page === 'number' && page > 0 && typeof limit === 'number' && limit > 0) {
        const start = (page - 1) * limit
        query = query.range(start, start + limit - 1)
      }
    }

    return this.handleListResponse<T>(query)
  }

  async create(data: Partial<T>): Promise<DALResponse<T>> {
    if (!data || typeof data !== 'object') {
      return {
        data: null,
        error: new Error('Data is required for creation'),
        success: false
      }
    }

    const query = supabase
      .from(this.tableName as any)
      .insert(data)
      .select()
      .single()
    
    return this.handleResponse<T>(query)
  }

  async update(id: string, data: Partial<T>): Promise<DALResponse<T>> {
    if (!id) {
      return {
        data: null,
        error: new Error('ID is required for update'),
        success: false
      }
    }

    if (!data || typeof data !== 'object') {
      return {
        data: null,
        error: new Error('Data is required for update'),
        success: false
      }
    }

    const query = supabase
      .from(this.tableName as any)
      .update(data)
      .eq('id', id)
      .select()
      .single()
    
    return this.handleResponse<T>(query)
  }

  async delete(id: string): Promise<DALResponse<void>> {
    if (!id) {
      return {
        data: null,
        error: new Error('ID is required for deletion'),
        success: false
      }
    }

    const query = supabase
      .from(this.tableName as any)
      .delete()
      .eq('id', id)
    
    return this.handleResponse<void>(query)
  }
}
