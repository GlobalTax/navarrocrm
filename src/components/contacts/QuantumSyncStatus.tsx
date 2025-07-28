import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { RefreshCw, Clock, CheckCircle, AlertCircle, Users, Calendar } from 'lucide-react'
import { supabase } from '@/integrations/supabase/client'
import { toast } from 'sonner'
import { handleQuantumError } from '@/lib/quantum/errors'

interface SyncNotification {
  id: string
  sync_date: string
  contacts_imported: number
  contacts_skipped: number
  status: 'success' | 'error'
  error_message?: string
}

export function QuantumSyncStatus() {
  const [lastSync, setLastSync] = useState<SyncNotification | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSyncing, setIsSyncing] = useState(false)

  const fetchSyncStatus = async () => {
    try {
      const { data, error } = await supabase
        .from('quantum_sync_notifications')
        .select('*')
        .order('sync_date', { ascending: false })
        .limit(1)
        .single()

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching sync status:', error)
        return
      }

      if (data) {
        setLastSync({
          id: data.id,
          sync_date: data.sync_date,
          contacts_imported: data.contacts_imported,
          contacts_skipped: data.contacts_skipped,
          status: data.status as 'success' | 'error',
          error_message: data.error_message
        })
      } else {
        setLastSync(null)
      }
    } catch (error) {
      console.error('Error fetching sync status:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const triggerManualSync = async () => {
    setIsSyncing(true)
    try {
      const { data, error } = await supabase.functions.invoke('quantum-clients', {
        body: { auto_sync: true }
      })

      if (error) throw error

      if (data?.success) {
        toast.success(`Sincronización completada: ${data.data?.imported || 0} contactos importados, ${data.data?.skipped || 0} omitidos`)
        fetchSyncStatus()
      } else {
        throw new Error(data?.error || 'Error desconocido')
      }
    } catch (error: any) {
      const quantumError = handleQuantumError(error, {
        component: 'QuantumSyncStatus',
        action: 'triggerManualSync'
      })
      toast.error(quantumError.userMessage)
    } finally {
      setIsSyncing(false)
    }
  }

  useEffect(() => {
    fetchSyncStatus()
  }, [])

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-2">
            <RefreshCw className="h-4 w-4 animate-spin" />
            <span>Cargando estado de sincronización...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  const getNextSyncTime = () => {
    if (!lastSync) return "En las próximas 5 horas"
    
    const lastSyncTime = new Date(lastSync.sync_date)
    const nextSync = new Date(lastSyncTime.getTime() + 5 * 60 * 60 * 1000) // +5 horas
    const now = new Date()
    
    if (nextSync > now) {
      const diffMs = nextSync.getTime() - now.getTime()
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
      const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
      
      if (diffHours > 0) {
        return `En ${diffHours}h ${diffMinutes}m`
      } else {
        return `En ${diffMinutes}m`
      }
    } else {
      return "Próximamente"
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          Sincronización Quantum Economics
        </CardTitle>
        <Button
          variant="outline"
          size="sm"
          onClick={triggerManualSync}
          disabled={isSyncing}
        >
          {isSyncing ? (
            <RefreshCw className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <RefreshCw className="h-4 w-4 mr-2" />
          )}
          Sincronizar ahora
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Estado de última sincronización */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {lastSync?.status === 'success' ? (
                <CheckCircle className="h-4 w-4 text-success" />
              ) : lastSync?.status === 'error' ? (
                <AlertCircle className="h-4 w-4 text-destructive" />
              ) : (
                <Clock className="h-4 w-4 text-muted-foreground" />
              )}
              <span className="text-sm">
                {lastSync 
                  ? `Última sincronización: ${new Date(lastSync.sync_date).toLocaleString()}`
                  : 'Sin sincronizaciones previas'
                }
              </span>
            </div>
            <Badge variant={lastSync?.status === 'success' ? 'default' : lastSync?.status === 'error' ? 'destructive' : 'secondary'}>
              {lastSync?.status === 'success' ? 'Exitoso' : lastSync?.status === 'error' ? 'Error' : 'Pendiente'}
            </Badge>
          </div>

          {/* Estadísticas de última sincronización */}
          {lastSync && lastSync.status === 'success' && (
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4 text-success" />
                <div>
                  <p className="text-sm font-medium">{lastSync.contacts_imported}</p>
                  <p className="text-xs text-muted-foreground">Importados</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">{lastSync.contacts_skipped}</p>
                  <p className="text-xs text-muted-foreground">Omitidos</p>
                </div>
              </div>
            </div>
          )}

          {/* Error message */}
          {lastSync?.status === 'error' && lastSync.error_message && (
            <div className="p-3 bg-destructive/10 rounded-md">
              <p className="text-sm text-destructive">{lastSync.error_message}</p>
            </div>
          )}

          {/* Próxima sincronización */}
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>Próxima sincronización automática: {getNextSyncTime()}</span>
          </div>

          {/* Información */}
          <div className="text-xs text-muted-foreground bg-muted/50 p-3 rounded-md">
            <p>
              <strong>Sincronización automática:</strong> Cada 5 horas se ejecuta automáticamente 
              para importar nuevos contactos de Quantum Economics. Los contactos duplicados 
              se omiten automáticamente.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}