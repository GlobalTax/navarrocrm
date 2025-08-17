import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'
import { 
  RefreshCw, 
  Settings, 
  Activity, 
  CheckCircle, 
  AlertTriangle, 
  Clock,
  Database,
  Users,
  Receipt
} from 'lucide-react'
import { useApp } from '@/contexts/AppContext'
import { supabase } from '@/integrations/supabase/client'
import { useSyncQuantumInvoices } from '@/hooks/quantum/useQuantumInvoices'

interface SyncProgress {
  isRunning: boolean
  progress: number
  currentStep: string
  summary?: {
    processed: number
    created: number
    updated: number
    errors: number
  }
}

interface SyncHistory {
  id: string
  sync_date: string | null
  status: string
  message: string | null
  records_processed: number | null
  error_details: any
  request_id: string
}

export function QuantumIntegration() {
  const { user } = useApp()
  const syncInvoices = useSyncQuantumInvoices()

  const [syncProgress, setSyncProgress] = useState<SyncProgress>({
    isRunning: false,
    progress: 0,
    currentStep: 'Preparando...'
  })
  const [syncHistory, setSyncHistory] = useState<SyncHistory[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [lastSync, setLastSync] = useState<string | null>(null)

  const orgId = user?.org_id

  // Cargar historial de sincronización
  const loadSyncHistory = async () => {
    if (!orgId) return
    
    try {
      const { data, error } = await supabase
        .from('quantum_sync_history')
        .select('*')
        .order('sync_date', { ascending: false })
        .limit(10)

      if (error) throw error

      setSyncHistory(data || [])
      setLastSync(data?.[0]?.sync_date || null)
    } catch (error) {
      console.error('Error loading sync history:', error)
    }
  }

  useEffect(() => {
    loadSyncHistory()
  }, [orgId])

  // Sincronización manual con progreso simulado
  const handleSyncNow = async (dateRange?: { start: string; end: string }) => {
    if (!orgId) return

    try {
      setSyncProgress({
        isRunning: true,
        progress: 10,
        currentStep: 'Conectando con Quantum Economics...'
      })

      const end = dateRange?.end || new Date().toISOString().split('T')[0]
      const start = dateRange?.start || (() => {
        const date = new Date()
        date.setDate(date.getDate() - 90)
        return date.toISOString().split('T')[0]
      })()

      setSyncProgress(prev => ({
        ...prev,
        progress: 25,
        currentStep: 'Obteniendo facturas de Quantum...'
      }))

      const payload = {
        org_id: orgId,
        start_date: start,
        end_date: end,
        invoice_type: 'ALL' as const
      }

      toast.info('Iniciando sincronización de facturas', {
        description: `Período: ${start} a ${end}`
      })

      setSyncProgress(prev => ({
        ...prev,
        progress: 50,
        currentStep: 'Procesando facturas...'
      }))

      const result = await syncInvoices(payload)

      setSyncProgress(prev => ({
        ...prev,
        progress: 80,
        currentStep: 'Actualizando base de datos...'
      }))

      // Simular tiempo de procesamiento final
      await new Promise(resolve => setTimeout(resolve, 1000))

      setSyncProgress({
        isRunning: false,
        progress: 100,
        currentStep: 'Completado',
        summary: result?.summary
      })

      toast.success('Sincronización completada', {
        description: result?.summary
          ? `Procesadas: ${result.summary.processed} · Creadas: ${result.summary.created} · Actualizadas: ${result.summary.updated}`
          : 'Revisa el historial para ver los resultados'
      })

      // Recargar historial
      await loadSyncHistory()

    } catch (error: any) {
      setSyncProgress({
        isRunning: false,
        progress: 0,
        currentStep: 'Error en sincronización'
      })

      toast.error('Error al sincronizar facturas', {
        description: error.message || 'Consulta los logs de la función'
      })
    }
  }

  // Sincronizaciones rápidas predefinidas
  const quickSyncOptions = [
    {
      label: 'Últimos 7 días',
      days: 7,
      variant: 'default' as const
    },
    {
      label: 'Últimos 30 días', 
      days: 30,
      variant: 'secondary' as const
    },
    {
      label: 'Últimos 90 días',
      days: 90,
      variant: 'outline' as const
    }
  ]

  const handleQuickSync = (days: number) => {
    const end = new Date().toISOString().split('T')[0]
    const start = new Date()
    start.setDate(start.getDate() - days)
    
    handleSyncNow({
      start: start.toISOString().split('T')[0],
      end
    })
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Integración Quantum Economics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="sync" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="sync">Sincronización</TabsTrigger>
              <TabsTrigger value="history">Historial</TabsTrigger>
              <TabsTrigger value="config">Configuración</TabsTrigger>
            </TabsList>

            <TabsContent value="sync" className="space-y-4">
              <div className="grid gap-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium">Estado de Sincronización</h3>
                    <p className="text-xs text-muted-foreground">
                      {lastSync 
                        ? `Última sincronización: ${new Date(lastSync).toLocaleString('es-ES')}`
                        : 'Nunca sincronizado'
                      }
                    </p>
                  </div>
                  <Badge variant={syncProgress.isRunning ? 'secondary' : 'default'}>
                    {syncProgress.isRunning ? 'Sincronizando' : 'Listo'}
                  </Badge>
                </div>

                {syncProgress.isRunning && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>{syncProgress.currentStep}</span>
                      <span>{syncProgress.progress}%</span>
                    </div>
                    <Progress value={syncProgress.progress} className="h-2" />
                  </div>
                )}

                {syncProgress.summary && !syncProgress.isRunning && (
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>
                      Sincronización completada: {syncProgress.summary.processed} facturas procesadas,
                      {syncProgress.summary.created} creadas, {syncProgress.summary.updated} actualizadas
                      {syncProgress.summary.errors > 0 && `, ${syncProgress.summary.errors} errores`}
                    </AlertDescription>
                  </Alert>
                )}

                <div className="space-y-3">
                  <h4 className="text-sm font-medium">Sincronización Rápida</h4>
                  <div className="flex gap-2 flex-wrap">
                    {quickSyncOptions.map(option => (
                      <Button
                        key={option.days}
                        variant={option.variant}
                        size="sm"
                        onClick={() => handleQuickSync(option.days)}
                        disabled={syncProgress.isRunning}
                        className="gap-2"
                      >
                        <RefreshCw className="h-4 w-4" />
                        {option.label}
                      </Button>
                    ))}
                  </div>
                </div>

                <Button 
                  variant="default" 
                  onClick={() => handleSyncNow()}
                  disabled={syncProgress.isRunning || !orgId}
                  className="w-full gap-2"
                >
                  <RefreshCw className={`h-4 w-4 ${syncProgress.isRunning ? 'animate-spin' : ''}`} />
                  {syncProgress.isRunning ? 'Sincronizando...' : 'Sincronizar Ahora (90 días)'}
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="history" className="space-y-4">
              <div className="space-y-3">
                <h3 className="text-sm font-medium">Historial de Sincronizaciones</h3>
                
                {syncHistory.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No hay historial de sincronizaciones
                  </p>
                ) : (
                  <div className="space-y-2">
                    {syncHistory.map((sync) => (
                      <Card key={sync.id} className="p-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <CheckCircle className="h-4 w-4 text-green-600" />
                              <span className="text-sm font-medium">
                                {sync.sync_date ? new Date(sync.sync_date).toLocaleString('es-ES') : 'Fecha desconocida'}
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {sync.message || 'Sincronización automática'}
                            </p>
                          </div>
                          <div className="text-right text-xs">
                            <div>Procesados: {sync.records_processed || 0}</div>
                            <div className="flex gap-2">
                              <Badge variant={sync.status === 'success' ? 'default' : 'destructive'}>
                                {sync.status}
                              </Badge>
                              {sync.error_details && (
                                <span className="text-red-600">Error</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="config" className="space-y-4">
              <div className="space-y-4">
                <h3 className="text-sm font-medium">Configuración de Sincronización</h3>
                
                <Alert>
                  <Settings className="h-4 w-4" />
                  <AlertDescription>
                    La sincronización automática ejecuta diariamente a las 02:00 AM (UTC) para todas las organizaciones.
                    Las ventanas de procesamiento evitan sobrecargar la API de Quantum Economics.
                  </AlertDescription>
                </Alert>

                <div className="grid gap-4 md:grid-cols-2">
                  <Card className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="h-4 w-4" />
                      <span className="text-sm font-medium">Cron Job Diario</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Sincronización automática configurada para ejecutar cada día.
                      Procesa organizaciones en ventanas de 5 para optimizar rendimiento.
                    </p>
                  </Card>

                  <Card className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Activity className="h-4 w-4" />
                      <span className="text-sm font-medium">Ventanas por Org</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Cada organización se procesa en ventanas separadas para evitar timeouts
                      y distribuir la carga en la API externa.
                    </p>
                  </Card>
                </div>

                <div className="pt-2">
                  <Button variant="outline" size="sm" className="gap-2">
                    <Settings className="h-4 w-4" />
                    Ver Configuración Avanzada
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}