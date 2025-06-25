
import { useState, useCallback, useMemo, useRef, useEffect } from 'react'

interface SearchConfig<T> {
  searchFields: (keyof T)[]
  filters?: {
    [K in keyof T]?: {
      type: 'exact' | 'contains' | 'range' | 'select'
      options?: any[]
      transform?: (value: any) => any
    }
  }
  fuzzySearch?: boolean
  debounceMs?: number
  maxResults?: number
}

interface SearchResult<T> {
  item: T
  score: number
  highlights: { field: keyof T; value: string; matches: number[] }[]
}

export const useIntelligentSearch = <T extends Record<string, any>>(
  data: T[],
  config: SearchConfig<T>
) => {
  const {
    searchFields,
    filters = {},
    fuzzySearch = true,
    debounceMs = 300,
    maxResults = 100
  } = config

  const [searchTerm, setSearchTerm] = useState('')
  const [activeFilters, setActiveFilters] = useState<Partial<T>>({})
  const [searchResults, setSearchResults] = useState<SearchResult<T>[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const debounceRef = useRef<NodeJS.Timeout>()

  // Función de búsqueda fuzzy
  const fuzzyMatch = useCallback((text: string, query: string): { score: number; matches: number[] } => {
    if (!query.trim()) return { score: 1, matches: [] }
    
    const textLower = text.toLowerCase()
    const queryLower = query.toLowerCase()
    
    // Búsqueda exacta tiene prioridad
    if (textLower.includes(queryLower)) {
      const startIndex = textLower.indexOf(queryLower)
      const matches = Array.from({ length: queryLower.length }, (_, i) => startIndex + i)
      return { score: 1, matches }
    }
    
    // Búsqueda fuzzy
    let score = 0
    let queryIndex = 0
    const matches: number[] = []
    
    for (let i = 0; i < textLower.length && queryIndex < queryLower.length; i++) {
      if (textLower[i] === queryLower[queryIndex]) {
        matches.push(i)
        score += 1
        queryIndex++
      }
    }
    
    return {
      score: queryIndex > 0 ? score / queryLower.length : 0,
      matches
    }
  }, [])

  // Aplicar filtros
  const applyFilters = useCallback((items: T[], filters: Partial<T>): T[] => {
    return items.filter(item => {
      return Object.entries(filters).every(([key, filterValue]) => {
        if (!filterValue) return true
        
        const itemValue = item[key]
        const filterConfig = config.filters?.[key as keyof T]
        
        if (!filterConfig) return true
        
        switch (filterConfig.type) {
          case 'exact':
            return itemValue === filterValue
          case 'contains':
            return String(itemValue).toLowerCase().includes(String(filterValue).toLowerCase())
          case 'range':
            if (Array.isArray(filterValue) && filterValue.length === 2) {
              const [min, max] = filterValue
              return itemValue >= min && itemValue <= max
            }
            return true
          case 'select':
            if (Array.isArray(filterValue)) {
              return filterValue.includes(itemValue)
            }
            return itemValue === filterValue
          default:
            return true
        }
      })
    })
  }, [config.filters])

  // Realizar búsqueda
  const performSearch = useCallback((term: string, filters: Partial<T>): SearchResult<T>[] => {
    if (!term.trim() && Object.keys(filters).length === 0) {
      return data.map(item => ({ item, score: 1, highlights: [] }))
    }

    const filteredData = applyFilters(data, filters)
    
    if (!term.trim()) {
      return filteredData.map(item => ({ item, score: 1, highlights: [] }))
    }

    const results: SearchResult<T>[] = []

    for (const item of filteredData) {
      let totalScore = 0
      const highlights: { field: keyof T; value: string; matches: number[] }[] = []

      for (const field of searchFields) {
        const fieldValue = String(item[field] || '')
        const { score, matches } = fuzzyMatch(fieldValue, term)
        
        if (score > 0) {
          totalScore += score
          highlights.push({
            field,
            value: fieldValue,
            matches
          })
        }
      }

      if (totalScore > 0) {
        results.push({
          item,
          score: totalScore / searchFields.length,
          highlights
        })
      }
    }

    return results
      .sort((a, b) => b.score - a.score)
      .slice(0, maxResults)
  }, [data, searchFields, fuzzyMatch, applyFilters, maxResults])

  // Búsqueda con debounce
  const debouncedSearch = useCallback((term: string, filters: Partial<T>) => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }

    setIsSearching(true)
    debounceRef.current = setTimeout(() => {
      const results = performSearch(term, filters)
      setSearchResults(results)
      setIsSearching(false)
    }, debounceMs)
  }, [performSearch, debounceMs])

  // Actualizar búsqueda cuando cambien los parámetros
  useEffect(() => {
    debouncedSearch(searchTerm, activeFilters)
  }, [searchTerm, activeFilters, debouncedSearch])

  // Limpiar debounce al desmontar
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
    }
  }, [])

  // Funciones públicas
  const updateSearchTerm = useCallback((term: string) => {
    setSearchTerm(term)
  }, [])

  const updateFilter = useCallback((field: keyof T, value: any) => {
    setActiveFilters(prev => ({
      ...prev,
      [field]: value
    }))
  }, [])

  const clearFilter = useCallback((field: keyof T) => {
    setActiveFilters(prev => {
      const newFilters = { ...prev }
      delete newFilters[field]
      return newFilters
    })
  }, [])

  const clearAllFilters = useCallback(() => {
    setActiveFilters({})
  }, [])

  const clearSearch = useCallback(() => {
    setSearchTerm('')
    setActiveFilters({})
  }, [])

  // Estadísticas de búsqueda
  const searchStats = useMemo(() => {
    const totalItems = data.length
    const filteredItems = searchResults.length
    const hasActiveFilters = Object.keys(activeFilters).length > 0
    const hasSearchTerm = searchTerm.trim().length > 0

    return {
      totalItems,
      filteredItems,
      hasActiveFilters,
      hasSearchTerm,
      isFiltered: hasActiveFilters || hasSearchTerm
    }
  }, [data.length, searchResults.length, activeFilters, searchTerm])

  return {
    // Estado
    searchTerm,
    activeFilters,
    searchResults: searchResults.map(r => r.item),
    searchResultsWithScore: searchResults,
    isSearching,
    
    // Acciones
    updateSearchTerm,
    updateFilter,
    clearFilter,
    clearAllFilters,
    clearSearch,
    
    // Estadísticas
    searchStats,
    
    // Configuración
    availableFilters: Object.keys(config.filters || {})
  }
}
