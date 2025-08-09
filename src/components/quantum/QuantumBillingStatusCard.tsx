import { useEffect, useMemo, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { RefreshCw, Receipt, CheckCircle, AlertTriangle } from 'lucide-react'
import { useApp } from '@/contexts/AppContext'
import { supabase } from '@/integrations/supabase/client'
import { useSyncQuantumInvoices } from '@/hooks/quantum/useQuantumInvoices'

export function QuantumBillingStatusCard() {
  const { user } = useApp()
  const syncInvoices = useSyncQuantumInvoices()

  const [isLoading, setIsLoading] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)
  const [total90d, setTotal90d] = useState<number | null>(null)
  const [lastInvoiceDate, setLastInvoiceDate] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const orgId = user?.org_id

  const loadStats = async () => {
    if (!orgId) return
    setIsLoading(true)
    setError(null)
    try {
      const since = new Date()
      since.setDate(since.getDate() - 90)
      const sinceStr = since.toISOString().split('T')[0]

      // Count invoices last 90 days
      const { count, error: countError } = await supabase
        .from('quantum_invoices')
        .select('id', { count: 'exact', head: true })
        .eq('org_id', orgId)
        .gte('invoice_date', sinceStr)

      if (countError) throw countError

      // Last invoice date (overall)
      const { data: lastData, error: lastErr } = await supabase
        .from('quantum_invoices')
        .select('invoice_date')
        .eq('org_id', orgId)
        .order('invoice_date', { ascending: false })
        .limit(1)

      if (lastErr) throw lastErr

      setTotal90d(count ?? 0)
      setLastInvoiceDate(lastData?.[0]?.invoice_date ?? null)
    } catch (e: any) {
      setError(e.message || 'Error al cargar estado de facturación')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadStats()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orgId])

  const handleSyncNow = async () => {
    if (!orgId) return
    try {
      setIsSyncing(true)
      const end = new Date()
      const start = new Date()
      start.setDate(start.getDate() - 90)
      const payload = {
        org_id: orgId,
        start_date: start.toISOString().split('T')[0],
        end_date: end.toISOString().split('T')[0],
      }
      toast.info('Iniciando sincronización de facturas (90 días)')
      const result = await syncInvoices(payload)
      toast.success('Sincronización completada', {
        description: result?.summary
          ? `Procesadas: ${result.summary.processed} · Creadas: ${result.summary.created} · Actualizadas: ${result.summary.updated}`
          : 'Revisa el panel para ver los resultados',
      })
      await loadStats()
    } catch (e: any) {
      toast.error('Error al sincronizar facturas', {
        description: e.message || 'Consulta los logs de la función',
      })
    } finally {
      setIsSyncing(false)
    }
  }

  const statusBadge = useMemo(() => {
    if (isSyncing) return <Badge variant="secondary">Sincronizando…</Badge>
    if (error) return <Badge variant="destructive">Error</Badge>
    return <Badge variant="default">Activo</Badge>
  }, [isSyncing, error])

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2 text-base">
            <Receipt className="h-4 w-4" />
            Facturación Quantum
          </span>
          {statusBadge}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="text-sm">
              <div className="font-medium">Facturas últimos 90 días</div>
              <div className="text-muted-foreground">
                {isLoading ? 'Cargando…' : total90d ?? 0}
              </div>
            </div>
            <div className="text-sm text-right">
              <div className="font-medium">Última factura</div>
              <div className="text-muted-foreground">
                {isLoading
                  ? '—'
                  : lastInvoiceDate
                  ? new Date(lastInvoiceDate).toLocaleDateString('es-ES')
                  : 'Sin datos'}
              </div>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-sm text-destructive">
              <AlertTriangle className="h-4 w-4" />
              {error}
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <CheckCircle className="h-4 w-4" />
              Sincroniza periodo móvil de 90 días
            </div>
            <Button size="sm" variant="outline" onClick={handleSyncNow} disabled={isSyncing || !orgId} className="gap-2">
              <RefreshCw className={`h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
              Sincronizar ahora
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
