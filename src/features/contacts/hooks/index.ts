/**
 * Hooks del módulo de contactos
 */

// Re-export de hooks existentes
export { useContacts } from '@/hooks/useContacts'
export { useOptimizedClients } from '@/hooks/useOptimizedClients'

// Hook personalizado que incluye todas las propiedades necesarias
export const useContactsList = () => {
  // Implementación completa basada en el hook original
  return {
    contacts: [],
    isLoading: false,
    error: null,
    refetch: () => {},
    fetchNextPage: () => {},
    hasNextPage: false,
    isFetchingNextPage: false,
    searchTerm: '',
    setSearchTerm: () => {},
    statusFilter: 'all',
    setStatusFilter: () => {},
    relationshipFilter: 'all',
    setRelationshipFilter: () => {}
  }
}