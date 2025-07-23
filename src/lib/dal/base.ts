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

  async findById(id: string): Promise<DALResponse<T>> {
    const { data, error } = await supabase
      .from(this.tableName as any)
      .select('*')
      .eq('id', id)
      .single()
    
    return { data, error, success: !error }
  }

  async findMany(options: QueryOptions = {}): Promise<DALListResponse<T>> {
    const { data, error } = await supabase
      .from(this.tableName as any)
      .select('*')
    
    return { data: data || [], error, success: !error }
  }

  async create(data: any): Promise<DALResponse<T>> {
    const { data: result, error } = await supabase
      .from(this.tableName as any)
      .insert(data)
      .select()
      .single()
    
    return { data: result, error, success: !error }
  }

  async update(id: string, data: any): Promise<DALResponse<T>> {
    const { data: result, error } = await supabase
      .from(this.tableName as any)
      .update(data)
      .eq('id', id)
      .select()
      .single()
    
    return { data: result, error, success: !error }
  }

  async delete(id: string): Promise<DALResponse<void>> {
    const { error } = await supabase
      .from(this.tableName as any)
      .delete()
      .eq('id', id)
    
    return { data: null, error, success: !error }
  }
}