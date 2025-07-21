
import { useMemo } from 'react'
import { useLogger } from '@/hooks/useLogger'

interface GridVirtualizationConfig {
  containerWidth: number
  minItemWidth: number
  maxItemWidth: number
  gap: number
  itemHeight: number
  overscan?: number
}

interface GridVirtualizationResult {
  columnCount: number
  rowCount: number
  itemWidth: number
  totalHeight: number
  getItemPosition: (index: number) => { x: number; y: number; width: number; height: number }
}

export const useGridVirtualization = (
  itemCount: number,
  config: GridVirtualizationConfig
): GridVirtualizationResult => {
  const logger = useLogger('GridVirtualization')
  const { containerWidth, minItemWidth, maxItemWidth, gap, itemHeight, overscan = 2 } = config

  return useMemo(() => {
    // Calcular número óptimo de columnas
    const possibleColumns = Math.floor((containerWidth + gap) / (minItemWidth + gap))
    const columnCount = Math.max(1, Math.min(possibleColumns, 6)) // Máximo 6 columnas
    
    // Calcular ancho real de cada item
    const availableWidth = containerWidth - (gap * (columnCount - 1))
    const itemWidth = Math.min(maxItemWidth, availableWidth / columnCount)
    
    // Calcular número de filas
    const rowCount = Math.ceil(itemCount / columnCount)
    const totalHeight = rowCount * (itemHeight + gap) - gap

    const getItemPosition = (index: number) => {
      const row = Math.floor(index / columnCount)
      const col = index % columnCount
      
      return {
        x: col * (itemWidth + gap),
        y: row * (itemHeight + gap),
        width: itemWidth,
        height: itemHeight
      }
    }

    logger.debug('📐 Grid calculado', {
      itemCount,
      columnCount,
      rowCount,
      itemWidth: itemWidth.toFixed(0),
      containerWidth
    })

    return {
      columnCount,
      rowCount,
      itemWidth,
      totalHeight,
      getItemPosition
    }
  }, [itemCount, containerWidth, minItemWidth, maxItemWidth, gap, itemHeight, logger])
}
