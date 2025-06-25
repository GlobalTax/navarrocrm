
import { useMemo } from 'react'
import { useOptimizedQuery, useOptimizedSearch } from '@/hooks/database'
import { QueryOptions } from '@/services/database/DatabaseOptimizer'

interface ContactsFilters {
  status?: string
  relationship_type?: string
  searchTerm?: string
}

export const useOptimizedContacts = (
  filters: ContactsFilters = {}
) => {
  // Construir filtros optimizados
  const queryFilters = useMemo(() => {
    const dbFilters: Record<string, any> = {}

    if (filters.status && filters.status !== 'all') {
      dbFilters.status = { operator: 'eq' as const, value: filters.status }
    }

    if (filters.relationship_type && filters.relationship_type !== 'all') {
      dbFilters.relationship_type = { operator: 'eq' as const, value: filters.relationship_type }
    }

    return dbFilters
  }, [filters.status, filters.relationship_type])

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
    filters.searchTerm || '',
    ['name', 'email', 'phone', 'dni_nif'],
    queryOptions
  )

  // Retornar resultado según si hay búsqueda o no
  return filters.searchTerm ? searchResult : queryResult
}
