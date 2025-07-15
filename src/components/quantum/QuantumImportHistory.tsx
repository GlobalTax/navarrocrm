import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import { supabase } from '@/integrations/supabase/client'
import { 
  RefreshCw, 
  CheckCircle, 
  XCircle, 
  Clock, 
  History,
  AlertCircle 
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'

interface SyncHistoryRecord {
  id: string
  sync_date: string
  status: string
  message: string
  records_processed: number
  error_details?: any
  created_at: string
}

export function QuantumImportHistory() {
  const { data: historyData, isLoading, error, refetch } = useQuery({
    queryKey: ['quantum-sync-history'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('quantum_sync_history')
        .select('*')
        .order('sync_date', { ascending: false })
        .limit(50)
      
      if (error) throw error
      return data as SyncHistoryRecord[]
    },
    refetchInterval: 30000 // Actualizar cada 30 segundos
  })

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case 'error':
        return <XCircle className="w-4 h-4 text-red-600" />
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-600" />
      default:
        return <AlertCircle className="w-4 h-4 text-gray-600" />
    }
  }

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'success':
        return 'default'
      case 'error':
        return 'destructive'
      case 'pending':
        return 'secondary'
      default:
        return 'outline'
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <RefreshCw className="w-8 h-8 animate-spin text-muted-foreground" />
          <span className="ml-2 text-muted-foreground">Cargando historial...</span>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-8">
          <AlertCircle className="w-12 h-12 text-destructive mb-4" />
          <h3 className="text-lg font-semibold mb-2">Error al cargar historial</h3>
          <p className="text-muted-foreground mb-4">No se pudo cargar el historial de sincronización</p>
          <Button onClick={() => refetch()} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Reintentar
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <History className="w-5 h-5" />
              Historial de Sincronización
              <Badge variant="secondary">{historyData?.length || 0}</Badge>
            </CardTitle>
            <Button 
              onClick={() => refetch()} 
              variant="outline" 
              size="sm"
              disabled={isLoading}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Actualizar
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[500px]">
            <div className="space-y-4">
              {historyData?.map((record) => (
                <div 
                  key={record.id}
                  className="flex items-start space-x-4 p-4 border rounded-lg hover:bg-muted/50"
                >
                  <div className="flex-shrink-0 mt-1">
                    {getStatusIcon(record.status)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant={getStatusVariant(record.status)}>
                        {record.status}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {formatDistanceToNow(new Date(record.sync_date), { 
                          addSuffix: true, 
                          locale: es 
                        })}
                      </span>
                    </div>
                    
                    <p className="text-sm font-medium mb-1">{record.message}</p>
                    
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>Registros: {record.records_processed}</span>
                      <span>
                        Fecha: {new Date(record.sync_date).toLocaleString('es-ES')}
                      </span>
                    </div>
                    
                    {record.error_details && (
                      <details className="mt-2">
                        <summary className="text-xs text-red-600 cursor-pointer hover:text-red-700">
                          Ver detalles del error
                        </summary>
                        <pre className="mt-1 text-xs bg-red-50 p-2 rounded text-red-800 overflow-x-auto">
                          {JSON.stringify(record.error_details, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                </div>
              ))}
              
              {(!historyData || historyData.length === 0) && (
                <div className="text-center py-8 text-muted-foreground">
                  <History className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
                  <p>No hay historial de sincronización disponible</p>
                  <p className="text-sm">Las próximas sincronizaciones aparecerán aquí</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
}