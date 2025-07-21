
import React, { useState, useMemo, useCallback, useEffect } from 'react'
import { FixedSizeList as List } from 'react-window'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Search, Download, AlertCircle, CheckCircle2 } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { AIUsageLog } from '@/hooks/useAIUsage'
import { useLogStreamProcessor } from '@/hooks/performance/useLogStreamProcessor'
import { useVirtualizationCleanup } from '@/hooks/performance/useVirtualizationCleanup'
import { useLogger } from '@/hooks/useLogger'

interface VirtualizedAIUsageTableProps {
  logs: AIUsageLog[]
  isLoading?: boolean
  height?: number
}

interface LogRowProps {
  index: number
  style: React.CSSProperties
  data: AIUsageLog[]
}

const LogRow: React.FC<LogRowProps> = ({ index, style, data }) => {
  const log = data[index]
  
  if (!log) {
    return (
      <div style={style} className="flex items-center justify-center p-4 border-b">
        <div className="animate-pulse bg-gray-200 h-16 w-full rounded" />
      </div>
    )
  }

  return (
    <div style={style} className="flex items-center gap-4 p-4 border-b hover:bg-gray-50/50 transition-colors">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-medium text-sm truncate">{log.function_name}</span>
          <Badge variant="outline" className="text-xs">
            {log.model_used || 'N/A'}
          </Badge>
        </div>
        <div className="text-xs text-gray-500">
          {format(new Date(log.created_at), 'dd/MM/yyyy HH:mm', { locale: es })}
        </div>
      </div>
      
      <div className="text-right flex-shrink-0">
        <div className="text-sm font-mono">
          {log.total_tokens?.toLocaleString() || '0'} tokens
        </div>
        <div className="text-xs text-gray-500">
          ${(log.estimated_cost || 0).toFixed(6)}
        </div>
      </div>
      
      <div className="flex items-center flex-shrink-0">
        {log.success ? (
          <CheckCircle2 className="h-4 w-4 text-green-600" />
        ) : (
          <AlertCircle className="h-4 w-4 text-red-600" />
        )}
      </div>
    </div>
  )
}

export const VirtualizedAIUsageTable: React.FC<VirtualizedAIUsageTableProps> = ({
  logs,
  isLoading = false,
  height = 600
}) => {
  const logger = useLogger('VirtualizedAIUsageTable')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [orgFilter, setOrgFilter] = useState<string>('all')
  const [processedLogs, setProcessedLogs] = useState<AIUsageLog[]>([])

  const { createOptimizedFilter, processLogsInChunks } = useLogStreamProcessor({
    chunkSize: 200,
    batchDelay: 30
  })

  const { forceCleanup } = useVirtualizationCleanup({
    itemCount: logs.length,
    componentName: 'VirtualizedAIUsageTable',
    cleanupThreshold: 500
  })

  // Filtrar logs de manera optimizada
  const filteredLogs = useMemo(() => {
    if (!logs.length) return []
    
    const filter = createOptimizedFilter(searchTerm, statusFilter, orgFilter)
    const filtered = logs.filter(filter)
    
    logger.debug('🔍 Logs filtrados', {
      total: logs.length,
      filtered: filtered.length,
      searchTerm,
      statusFilter,
      orgFilter
    })
    
    return filtered
  }, [logs, searchTerm, statusFilter, orgFilter, createOptimizedFilter, logger])

  // Procesar logs en chunks para mejor performance
  useEffect(() => {
    if (filteredLogs.length === 0) {
      setProcessedLogs([])
      return
    }

    const onChunkProcessed = (chunk: any) => {
      setProcessedLogs(prev => [...prev, ...chunk.logs])
    }

    const onComplete = () => {
      logger.info('✅ Todos los logs procesados')
    }

    const onError = (error: Error) => {
      logger.error('❌ Error procesando logs', error)
      setProcessedLogs(filteredLogs) // Fallback
    }

    setProcessedLogs([]) // Reset
    processLogsInChunks(filteredLogs, onChunkProcessed, onComplete, onError)
  }, [filteredLogs, processLogsInChunks, logger])

  // Organizaciones únicas (memoizado)
  const uniqueOrgs = useMemo(() => 
    Array.from(new Set(logs.map(log => log.org_id))),
    [logs]
  )

  // Export optimizado
  const exportToCSV = useCallback(() => {
    const headers = [
      'Fecha', 'Organización', 'Usuario', 'Función', 'Modelo',
      'Tokens', 'Costo', 'Duración (ms)', 'Estado', 'Error'
    ]

    const csvRows = [
      headers.join(','),
      ...processedLogs.map(log => [
        format(new Date(log.created_at), 'yyyy-MM-dd HH:mm:ss'),
        log.org_id,
        log.user_id,
        log.function_name,
        log.model_used || 'N/A',
        log.total_tokens || 0,
        log.estimated_cost || 0,
        log.duration_ms || 0,
        log.success ? 'Éxito' : 'Error',
        log.error_message || ''
      ].map(cell => `"${cell}"`).join(','))
    ]

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `ai-usage-${format(new Date(), 'yyyy-MM-dd')}.csv`
    link.click()

    logger.info('📊 CSV exportado', { recordCount: processedLogs.length })
  }, [processedLogs, logger])

  // Cleanup forzado cuando hay muchos logs
  useEffect(() => {
    if (logs.length > 1000) {
      const cleanup = setTimeout(() => forceCleanup(), 10000) // 10 segundos
      return () => clearTimeout(cleanup)
    }
  }, [logs.length, forceCleanup])

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Logs de Uso de IA (Virtualizado)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Logs de Uso de IA (Virtualizado)</span>
          <div className="flex gap-2">
            <Badge variant="outline" className="text-xs">
              {processedLogs.length.toLocaleString()} registros
            </Badge>
            <Button onClick={exportToCSV} variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Exportar CSV
            </Button>
          </div>
        </CardTitle>
        
        {/* Filtros optimizados */}
        <div className="flex flex-col sm:flex-row gap-4 mt-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por función o modelo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="success">Éxito</SelectItem>
              <SelectItem value="error">Error</SelectItem>
            </SelectContent>
          </Select>

          <Select value={orgFilter} onValueChange={setOrgFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Organización" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              {uniqueOrgs.map(orgId => (
                <SelectItem key={orgId} value={orgId}>
                  {orgId.substring(0, 8)}...
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="border rounded-[10px] border-0.5 border-black">
          {processedLogs.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No se encontraron logs que coincidan con los filtros
            </div>
          ) : (
            <List
              height={height}
              width="100%"
              itemCount={processedLogs.length}
              itemSize={80}
              itemData={processedLogs}
              overscanCount={5}
            >
              {LogRow}
            </List>
          )}
        </div>
        
        {processedLogs.length > 0 && (
          <div className="flex items-center justify-between mt-4 text-sm text-muted-foreground">
            <span>
              Mostrando {processedLogs.length.toLocaleString()} de {logs.length.toLocaleString()} registros
            </span>
            {logs.length > 500 && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={forceCleanup}
                className="text-xs"
              >
                🧹 Liberar memoria
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
