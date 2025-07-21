
import { useMemo } from 'react'
import { useLogger } from '@/hooks/useLogger'

interface VirtualizationConfig {
  height: number
  itemHeight: number
  threshold: number
  overscan?: number
}

const VIRTUALIZATION_CONFIG: Record<string, VirtualizationConfig> = {
  contacts: { height: 600, itemHeight: 80, threshold: 100, overscan: 5 },
  cases: { height: 500, itemHeight: 90, threshold: 50, overscan: 3 },
  tasks: { height: 700, itemHeight: 70, threshold: 100, overscan: 5 },
  users: { height: 400, itemHeight: 85, threshold: 50, overscan: 3 }
}

interface VirtualizedDataResult<T> {
  useVirtualization: boolean
  items: T[]
  config: VirtualizationConfig
  shouldVirtualize: boolean
}

export function useVirtualizedData<T>(
  items: T[],
  componentType: keyof typeof VIRTUALIZATION_CONFIG
): VirtualizedDataResult<T> {
  const logger = useLogger('VirtualizedData')
  
  return useMemo(() => {
    const config = VIRTUALIZATION_CONFIG[componentType]
    const shouldVirtualize = items.length > config.threshold
    
    if (shouldVirtualize) {
      logger.info(`🚀 Activando virtualización para ${componentType}`, {
        itemCount: items.length,
        threshold: config.threshold
      })
    }
    
    return {
      useVirtualization: shouldVirtualize,
      items,
      config,
      shouldVirtualize
    }
  }, [items.length, componentType, logger])
}

export { VIRTUALIZATION_CONFIG }
