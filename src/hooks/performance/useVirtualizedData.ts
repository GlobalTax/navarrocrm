
import { useMemo } from 'react'
import { useLogger } from '@/hooks/useLogger'
import { createLogger } from '@/utils/logger'

/**
 * Configuración de virtualización para un tipo de componente
 * @interface VirtualizationConfig
 */
interface VirtualizationConfig {
  /** Altura total del contenedor en píxeles */
  height: number
  /** Altura de cada elemento en píxeles */
  itemHeight: number
  /** Número mínimo de elementos para activar virtualización */
  threshold: number
  /** Número de elementos adicionales a renderizar fuera del viewport */
  overscan?: number
}

/**
 * Configuraciones predefinidas para diferentes tipos de componentes
 * Optimizadas para rendimiento según el tipo de contenido
 */
const VIRTUALIZATION_CONFIG: Record<string, VirtualizationConfig> = {
  contacts: { height: 600, itemHeight: 80, threshold: 50, overscan: 5 },
  cases: { height: 500, itemHeight: 90, threshold: 50, overscan: 3 },
  tasks: { height: 700, itemHeight: 70, threshold: 100, overscan: 5 },
  users: { height: 400, itemHeight: 85, threshold: 50, overscan: 3 },
  // Configuraciones especializadas para componentes de alto rendimiento
  'ai-usage': { height: 600, itemHeight: 80, threshold: 200, overscan: 5 },
  'contact-cards': { height: 600, itemHeight: 240, threshold: 50, overscan: 2 }
}

/**
 * Resultado del hook useVirtualizedData
 * @interface VirtualizedDataResult
 */
interface VirtualizedDataResult<T> {
  /** Si se debe usar virtualización */
  useVirtualization: boolean
  /** Array de elementos */
  items: T[]
  /** Configuración de virtualización aplicada */
  config: VirtualizationConfig
  /** Si se debe virtualizar (alias de useVirtualization) */
  shouldVirtualize: boolean
}

/**
 * Parámetros de configuración personalizada para virtualización
 * @interface CustomVirtualizationOptions
 */
interface CustomVirtualizationOptions {
  /** Altura personalizada del contenedor */
  height?: number
  /** Altura personalizada de cada elemento */
  itemHeight?: number
  /** Threshold personalizado */
  threshold?: number
  /** Overscan personalizado */
  overscan?: number
}

/**
 * Hook para determinar cuándo y cómo usar virtualización de listas
 * Optimiza el rendimiento de listas grandes mediante renderizado virtual
 * 
 * @template T Tipo de los elementos en la lista
 * @param {T[]} items - Array de elementos a virtualizar
 * @param {keyof typeof VIRTUALIZATION_CONFIG} componentType - Tipo de componente predefinido
 * @param {CustomVirtualizationOptions} customOptions - Opciones de configuración personalizada
 * @returns {VirtualizedDataResult<T>} Resultado con configuración de virtualización
 * 
 * @example
 * ```tsx
 * const { useVirtualization, config, items } = useVirtualizedData(
 *   contacts,
 *   'contacts'
 * )
 * 
 * if (useVirtualization) {
 *   return (
 *     <FixedSizeList
 *       height={config.height}
 *       itemCount={items.length}
 *       itemSize={config.itemHeight}
 *       overscanCount={config.overscan}
 *     >
 *       {ContactRow}
 *     </FixedSizeList>
 *   )
 * }
 * 
 * return (
 *   <div>
 *     {items.map(contact => <ContactCard key={contact.id} contact={contact} />)}
 *   </div>
 * )
 * ```
 * 
 * @example
 * Con configuración personalizada:
 * ```tsx
 * const { useVirtualization, config } = useVirtualizedData(
 *   largeDataset,
 *   'contacts',
 *   { threshold: 100, itemHeight: 120 }
 * )
 * ```
 * 
 * @throws {Error} Cuando componentType no existe en VIRTUALIZATION_CONFIG
 * @throws {Error} Cuando items no es un array válido
 */
export function useVirtualizedData<T>(
  items: T[],
  componentType: keyof typeof VIRTUALIZATION_CONFIG,
  customOptions: CustomVirtualizationOptions = {}
): VirtualizedDataResult<T> {
  const logger = useLogger('VirtualizedData')
  const staticLogger = createLogger('useVirtualizedData')
  
  // Validación de parámetros
  if (!Array.isArray(items)) {
    staticLogger.error('items debe ser un array', { items: typeof items })
    throw new Error('El parámetro items debe ser un array válido')
  }

  if (!VIRTUALIZATION_CONFIG[componentType]) {
    staticLogger.error('Tipo de componente no encontrado', { componentType, available: Object.keys(VIRTUALIZATION_CONFIG) })
    throw new Error(`Tipo de componente '${componentType}' no está configurado para virtualización`)
  }

  // Validación de opciones personalizadas
  if (customOptions.height && (customOptions.height < 100 || customOptions.height > 2000)) {
    staticLogger.warn('Altura fuera del rango recomendado (100-2000px)', { height: customOptions.height })
  }

  if (customOptions.itemHeight && (customOptions.itemHeight < 20 || customOptions.itemHeight > 500)) {
    staticLogger.warn('Altura de elemento fuera del rango recomendado (20-500px)', { itemHeight: customOptions.itemHeight })
  }

  if (customOptions.threshold && (customOptions.threshold < 10 || customOptions.threshold > 1000)) {
    staticLogger.warn('Threshold fuera del rango recomendado (10-1000)', { threshold: customOptions.threshold })
  }

  if (customOptions.overscan && (customOptions.overscan < 1 || customOptions.overscan > 20)) {
    staticLogger.warn('Overscan fuera del rango recomendado (1-20)', { overscan: customOptions.overscan })
  }
  
  return useMemo(() => {
    try {
      const baseConfig = VIRTUALIZATION_CONFIG[componentType]
      
      // Combinar configuración base con opciones personalizadas
      const config: VirtualizationConfig = {
        height: customOptions.height ?? baseConfig.height,
        itemHeight: customOptions.itemHeight ?? baseConfig.itemHeight,
        threshold: customOptions.threshold ?? baseConfig.threshold,
        overscan: customOptions.overscan ?? baseConfig.overscan
      }
      
      const shouldVirtualize = items.length > config.threshold
      
      if (shouldVirtualize) {
        logger.info(`🚀 Activando virtualización para ${componentType}`, {
          itemCount: items.length,
          threshold: config.threshold,
          itemHeight: config.itemHeight
        })
      } else {
        logger.debug(`📋 Renderizado normal para ${componentType}`, {
          itemCount: items.length,
          threshold: config.threshold,
          reason: 'items insuficientes para virtualización'
        })
      }
      
      return {
        useVirtualization: shouldVirtualize,
        items,
        config,
        shouldVirtualize
      }
    } catch (error) {
      staticLogger.error('Error al configurar virtualización', error)
      
      // Fallback seguro
      return {
        useVirtualization: false,
        items,
        config: VIRTUALIZATION_CONFIG[componentType],
        shouldVirtualize: false
      }
    }
  }, [items.length, componentType, customOptions, logger, staticLogger])
}

export { VIRTUALIZATION_CONFIG }
