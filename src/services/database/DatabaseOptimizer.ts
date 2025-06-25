
import { supabase } from '@/integrations/supabase/client'

export interface QueryOptions {
  page?: number
  limit?: number
  orderBy?: string
  orderDirection?: 'asc' | 'desc'
  filters?: Record<string, any>
  select?: string[]
  cache?: boolean
  cacheTime?: number
}

export interface QueryResult<T> {
  data: T[]
  count: number
  page: number
  totalPages: number
  hasMore: boolean
  isLoading: boolean
  error: Error | null
}

export interface DatabaseStats {
  totalQueries: number
  cacheHits: number
  cacheMisses: number
  averageQueryTime: number
  slowQueries: number
  tableStats: Record<string, { queries: number; avgTime: number }>
}

interface FilterOperator {
  operator: 'eq' | 'neq' | 'gt' | 'lt' | 'gte' | 'lte' | 'like' | 'ilike' | 'in' | 'is'
  value: any
}

export class DatabaseOptimizer {
  private static instance: DatabaseOptimizer
  private stats: DatabaseStats = {
    totalQueries: 0,
    cacheHits: 0,
    cacheMisses: 0,
    averageQueryTime: 0,
    slowQueries: 0,
    tableStats: {}
  }
  private slowQueryThreshold = 1000 // 1 segundo

  static getInstance(): DatabaseOptimizer {
    if (!DatabaseOptimizer.instance) {
      DatabaseOptimizer.instance = new DatabaseOptimizer()
    }
    return DatabaseOptimizer.instance
  }

  // Generar clave de cache para query
  private generateCacheKey(table: string, options: QueryOptions): string {
    const key = `db-query-${table}-${JSON.stringify(options)}`
    return key
  }

  // Ejecutar query optimizada
  async executeQuery<T = any>(
    table: string,
    options: QueryOptions = {}
  ): Promise<QueryResult<T>> {
    const startTime = Date.now()
    this.stats.totalQueries++

    // Inicializar stats para tabla si no existe
    if (!this.stats.tableStats[table]) {
      this.stats.tableStats[table] = { queries: 0, avgTime: 0 }
    }

    const {
      page = 1,
      limit = 20,
      orderBy,
      orderDirection = 'desc',
      filters = {},
      select = ['*']
    } = options

    try {
      // Crear query base usando any para evitar problemas de tipado
      let query = (supabase as any)
        .from(table)
        .select(select.join(', '), { count: 'exact' })

      // Aplicar filtros con operadores avanzados
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          if (typeof value === 'object' && 'operator' in value) {
            const filterOp = value as FilterOperator
            this.applyFilterOperator(query, key, filterOp)
          } else {
            query = query.eq(key, value)
          }
        }
      })

      // Aplicar ordenamiento
      if (orderBy) {
        query = query.order(orderBy, { ascending: orderDirection === 'asc' })
      }

      // Aplicar paginación
      const from = (page - 1) * limit
      const to = from + limit - 1
      query = query.range(from, to)

      const { data, error, count } = await query

      if (error) {
        throw error
      }

      const queryTime = Date.now() - startTime
      this.updateStats(table, queryTime)

      const result: QueryResult<T> = {
        data: (data as T[]) || [],
        count: count || 0,
        page,
        totalPages: Math.ceil((count || 0) / limit),
        hasMore: page < Math.ceil((count || 0) / limit),
        isLoading: false,
        error: null
      }

      console.log(`🔍 [DatabaseOptimizer] Query executed: ${table} in ${queryTime}ms`)
      return result
    } catch (error) {
      const queryTime = Date.now() - startTime
      this.updateStats(table, queryTime)

      console.error(`❌ [DatabaseOptimizer] Query failed: ${table}`, error)
      return {
        data: [],
        count: 0,
        page,
        totalPages: 0,
        hasMore: false,
        isLoading: false,
        error: error as Error
      }
    }
  }

  // Aplicar operadores de filtro
  private applyFilterOperator(query: any, key: string, filter: FilterOperator): void {
    switch (filter.operator) {
      case 'eq':
        query = query.eq(key, filter.value)
        break
      case 'neq':
        query = query.neq(key, filter.value)
        break
      case 'gt':
        query = query.gt(key, filter.value)
        break
      case 'lt':
        query = query.lt(key, filter.value)
        break
      case 'gte':
        query = query.gte(key, filter.value)
        break
      case 'lte':
        query = query.lte(key, filter.value)
        break
      case 'like':
        query = query.like(key, filter.value)
        break
      case 'ilike':
        query = query.ilike(key, filter.value)
        break
      case 'in':
        query = query.in(key, filter.value)
        break
      case 'is':
        query = query.is(key, filter.value)
        break
    }
  }

  // Query con búsqueda full-text
  async searchQuery<T = any>(
    table: string,
    searchTerm: string,
    searchColumns: string[],
    options: QueryOptions = {}
  ): Promise<QueryResult<T>> {
    const startTime = Date.now()
    this.stats.totalQueries++

    if (!this.stats.tableStats[table]) {
      this.stats.tableStats[table] = { queries: 0, avgTime: 0 }
    }

    try {
      let query = (supabase as any)
        .from(table)
        .select(options.select?.join(', ') || '*', { count: 'exact' })

      // Construir búsqueda full-text optimizada
      const searchConditions = searchColumns.map(column => 
        `${column}.ilike.%${searchTerm}%`
      ).join(',')

      query = query.or(searchConditions)

      // Aplicar filtros adicionales
      if (options.filters) {
        Object.entries(options.filters).forEach(([key, value]) => {
          if (value !== null && value !== undefined) {
            if (typeof value === 'object' && 'operator' in value) {
              this.applyFilterOperator(query, key, value as FilterOperator)
            } else {
              query = query.eq(key, value)
            }
          }
        })
      }

      // Aplicar ordenamiento
      if (options.orderBy) {
        query = query.order(options.orderBy, { 
          ascending: options.orderDirection === 'asc' 
        })
      }

      // Aplicar paginación
      const page = options.page || 1
      const limit = options.limit || 20
      const from = (page - 1) * limit
      const to = from + limit - 1
      query = query.range(from, to)

      const { data, error, count } = await query

      if (error) {
        throw error
      }

      const queryTime = Date.now() - startTime
      this.updateStats(table, queryTime)

      console.log(`🔍 [DatabaseOptimizer] Search executed: ${table} for "${searchTerm}" in ${queryTime}ms`)

      return {
        data: (data as T[]) || [],
        count: count || 0,
        page,
        totalPages: Math.ceil((count || 0) / limit),
        hasMore: page < Math.ceil((count || 0) / limit),
        isLoading: false,
        error: null
      }
    } catch (error) {
      const queryTime = Date.now() - startTime
      this.updateStats(table, queryTime)

      console.error(`❌ [DatabaseOptimizer] Search failed: ${table}`, error)
      return {
        data: [],
        count: 0,
        page: options.page || 1,
        totalPages: 0,
        hasMore: false,
        isLoading: false,
        error: error as Error
      }
    }
  }

  // Query con relaciones
  async queryWithRelations<T = any>(
    table: string,
    relations: string[],
    options: QueryOptions = {}
  ): Promise<QueryResult<T>> {
    const startTime = Date.now()
    this.stats.totalQueries++

    if (!this.stats.tableStats[table]) {
      this.stats.tableStats[table] = { queries: 0, avgTime: 0 }
    }

    try {
      let query = (supabase as any)
        .from(table)
        .select(`
          *,
          ${relations.map(relation => `${relation}(*)`).join(', ')}
        `, { count: 'exact' })

      // Aplicar filtros
      if (options.filters) {
        Object.entries(options.filters).forEach(([key, value]) => {
          if (value !== null && value !== undefined) {
            if (typeof value === 'object' && 'operator' in value) {
              this.applyFilterOperator(query, key, value as FilterOperator)
            } else {
              query = query.eq(key, value)
            }
          }
        })
      }

      // Aplicar ordenamiento
      if (options.orderBy) {
        query = query.order(options.orderBy, { 
          ascending: options.orderDirection === 'asc' 
        })
      }

      // Aplicar paginación
      const page = options.page || 1
      const limit = options.limit || 20
      const from = (page - 1) * limit
      const to = from + limit - 1
      query = query.range(from, to)

      const { data, error, count } = await query

      if (error) {
        throw error
      }

      const queryTime = Date.now() - startTime
      this.updateStats(table, queryTime)

      console.log(`🔍 [DatabaseOptimizer] Relations query executed: ${table} in ${queryTime}ms`)

      return {
        data: (data as T[]) || [],
        count: count || 0,
        page,
        totalPages: Math.ceil((count || 0) / limit),
        hasMore: page < Math.ceil((count || 0) / limit),
        isLoading: false,
        error: null
      }
    } catch (error) {
      const queryTime = Date.now() - startTime
      this.updateStats(table, queryTime)

      console.error(`❌ [DatabaseOptimizer] Relations query failed: ${table}`, error)
      return {
        data: [],
        count: 0,
        page: options.page || 1,
        totalPages: 0,
        hasMore: false,
        isLoading: false,
        error: error as Error
      }
    }
  }

  // Actualizar estadísticas
  private updateStats(table: string, queryTime: number): void {
    // Stats globales
    this.stats.averageQueryTime = 
      (this.stats.averageQueryTime * (this.stats.totalQueries - 1) + queryTime) / this.stats.totalQueries

    if (queryTime > this.slowQueryThreshold) {
      this.stats.slowQueries++
    }

    // Stats por tabla
    const tableStats = this.stats.tableStats[table]
    tableStats.queries++
    tableStats.avgTime = 
      (tableStats.avgTime * (tableStats.queries - 1) + queryTime) / tableStats.queries
  }

  // Obtener estadísticas
  getStats(): DatabaseStats {
    return { ...this.stats }
  }

  // Reset estadísticas
  resetStats(): void {
    this.stats = {
      totalQueries: 0,
      cacheHits: 0,
      cacheMisses: 0,
      averageQueryTime: 0,
      slowQueries: 0,
      tableStats: {}
    }
  }
}
