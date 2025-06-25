
import { useMemo } from 'react'
import { useOptimizedQuery, useOptimizedSearch } from '@/hooks/database'
import { QueryOptions } from '@/services/database/DatabaseOptimizer'

interface ContactsFilters {
  status?: string
  relationship_type?: string
  client_type?: string
  dateRange?: {
    from: Date
    to: Date
  }
}

export const useOptimizedContacts = (
  filters: ContactsFilters = {},
  searchTerm?: string
) => {
  // Construir filtros optimizados
  const queryFilters = useMemo(() => {
    const dbFilters: Record<string, any> = {}

    if (filters.status && filters.status !== 'all') {
      dbFilters.status = filters.status
    }

    if (filters.relationship_type && filters.relationship_type !== 'all') {
      dbFilters.relationship_type = filters.relationship_type
    }

    if (filters.client_type && filters.client_type !== 'all') {
      dbFilters.client_type = filters.client_type
    }

    if (filters.dateRange) {
      dbFilters.created_at = {
        operator: 'gte' as const,
        value: filters.dateRange.from.toISOString()
      }
    }

    return dbFilters
  }, [filters])

  const queryOptions: QueryOptions = {
    limit: 50,
    orderBy: 'created_at',
    orderDirection: 'desc',
    filters: queryFilters,
    cache: true,
    cacheTime: 3 * 60 * 1000 // 3 minutos para contactos
  }

  // Query principal o búsqueda
  const queryResult = useOptimizedQuery('contacts', queryOptions)
  
  const searchResult = useOptimizedSearch(
    'contacts',
    searchTerm || '',
    ['name', 'email', 'phone', 'dni_nif'],
    queryOptions
  )

  // Retornar resultado según si hay búsqueda o no
  return searchTerm ? searchResult : queryResult
}
