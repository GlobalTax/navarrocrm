
import { useContacts, type Contact } from './useContacts'
import { createLogger } from '@/utils/logger'
import { useMemo } from 'react'

const logger = createLogger('useClients')

/**
 * Interfaz para cliente que extiende Contact
 * Los clientes son contactos con relationship_type específico 'cliente'
 * Email es opcional para máxima flexibilidad
 */
export interface Client extends Contact {
  relationship_type: 'cliente'
  // Email ya es opcional en Contact, así que no necesitamos override
}

/**
 * Hook especializado para gestión de clientes
 * Proporciona una vista filtrada y optimizada de contactos con relationship_type 'cliente'
 * Incluye todas las funcionalidades de contactos pero con semántica específica para clientes
 * 
 * @returns {Object} Funciones y estado específicos para gestión de clientes
 * 
 * @example
 * ```typescript
 * const {
 *   clients,
 *   filteredClients,
 *   isLoading,
 *   error,
 *   refetch,
 *   searchTerm,
 *   setSearchTerm,
 *   statusFilter,
 *   setStatusFilter,
 *   typeFilter,
 *   setTypeFilter
 * } = useClients()
 * 
 * // Buscar clientes específicos
 * setSearchTerm('empresa abc')
 * 
 * // Filtrar por estado
 * setStatusFilter('activo')
 * 
 * // Filtrar por tipo
 * setTypeFilter('cliente')
 * 
 * // Acceder a cliente específico
 * const activeClients = filteredClients.filter(c => c.status === 'activo')
 * ```
 * 
 * @since 1.0.0
 */
export const useClients = () => {
  const startTime = performance.now()
  
  try {
    logger.debug('Inicializando hook de clientes')

    // Obtener todos los contactos usando el hook base
    const { 
      contacts, 
      filteredContacts,
      isLoading, 
      error, 
      refetch,
      searchTerm,
      setSearchTerm,
      statusFilter,
      setStatusFilter,
      relationshipFilter,
      setRelationshipFilter
    } = useContacts()
    
    // Optimización: Usar useMemo para filtrar clientes y evitar re-renders innecesarios
    const clients = useMemo(() => {
      const filterStartTime = performance.now()
      
      const filteredClients = contacts
        .filter(contact => contact.relationship_type === 'cliente')
        .map(contact => contact as Client)
      
      const filterDuration = performance.now() - filterStartTime
      
      logger.debug('Filtrado de clientes completado', {
        totalContacts: contacts.length,
        clientsFound: filteredClients.length,
        filterDuration
      })

      // Log de métricas de rendimiento si el filtrado toma demasiado tiempo
      if (filterDuration > 10) {
        logger.warn('Filtrado de clientes tomó tiempo considerable', {
          filterDuration,
          totalContacts: contacts.length,
          clientsFound: filteredClients.length
        })
      }

      return filteredClients
    }, [contacts])

    // Optimización: Filtrar clientes ya filtrados por otros criterios
    const filteredClients = useMemo(() => {
      const filterStartTime = performance.now()
      
      const result = filteredContacts
        .filter(contact => contact.relationship_type === 'cliente')
        .map(contact => contact as Client)
      
      const filterDuration = performance.now() - filterStartTime
      
      logger.debug('Filtrado avanzado de clientes completado', {
        filteredContactsCount: filteredContacts.length,
        filteredClientsCount: result.length,
        filterDuration,
        hasSearchTerm: !!searchTerm,
        hasStatusFilter: statusFilter !== 'all',
        hasRelationshipFilter: relationshipFilter !== 'all'
      })

      return result
    }, [filteredContacts])

    // Estadísticas detalladas para debugging y monitoreo
    const contactsByRelationshipType = useMemo(() => {
      return contacts.reduce((acc, contact) => {
        const type = contact.relationship_type || 'unknown'
        acc[type] = (acc[type] || 0) + 1
        return acc
      }, {} as Record<string, number>)
    }, [contacts])

    const initializationTime = performance.now() - startTime

    logger.debug('Hook de clientes inicializado exitosamente', {
      totalContacts: contacts.length,
      clientsCount: clients.length,
      filteredClientsCount: filteredClients.length,
      contactsByRelationshipType,
      initializationTime,
      isLoading,
      hasError: !!error
    })

    // Métricas de rendimiento
    if (initializationTime > 50) {
      logger.warn('Inicialización de hook de clientes tomó tiempo considerable', {
        initializationTime,
        totalContacts: contacts.length,
        clientsCount: clients.length
      })
    }

    // Log de distribución de tipos de contacto para análisis
    if (Object.keys(contactsByRelationshipType).length > 1) {
      logger.debug('Distribución de tipos de contacto', {
        distribution: contactsByRelationshipType,
        totalContacts: contacts.length
      })
    }

    return {
      // Datos principales específicos para clientes
      clients,
      filteredClients,
      
      // Estado y operaciones heredadas de contactos
      isLoading,
      error,
      refetch,
      
      // Funciones de filtrado
      searchTerm,
      setSearchTerm,
      statusFilter,
      setStatusFilter,
      
      // Mapeo de nombres para compatibilidad con componentes existentes
      typeFilter: relationshipFilter,
      setTypeFilter: setRelationshipFilter,
      
      // Métricas adicionales para debugging
      _metadata: {
        totalContacts: contacts.length,
        clientsCount: clients.length,
        filteredClientsCount: filteredClients.length,
        contactsByRelationshipType,
        initializationTime
      }
    }
  } catch (error) {
    const initializationTime = performance.now() - startTime
    
    logger.error('Error al inicializar hook de clientes', {
      error: error instanceof Error ? error.message : 'Error desconocido',
      initializationTime
    })
    
    // Re-lanzar el error para que sea manejado por el componente
    throw error
  }
}

// Export Contact type for general use
export type { Contact }
