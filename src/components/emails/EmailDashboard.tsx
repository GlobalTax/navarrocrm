import { useState } from 'react'
import { StandardPageHeader } from '@/components/layout/StandardPageHeader'
import { useOutlookConnection } from '@/hooks/useOutlookConnection'
import { useOutlookAuth } from '@/hooks/useOutlookAuth'
import { useEmailMetrics } from '@/hooks/useEmailMetrics'
import { OutlookConnectionStatus } from './OutlookConnectionStatus'
import { OutlookConnectionDiagnostic } from './OutlookConnectionDiagnostic'
import { EmailConnectionStatus } from './EmailConnectionStatus'
import { EmailMetricsCards } from './EmailMetricsCards'
import { RecentEmailsList } from './RecentEmailsList'
import { EmailErrorBoundary } from './EmailErrorBoundary'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Mail, RefreshCw, Settings, AlertCircle, Bug } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '@/contexts/AppContext'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'

export function EmailDashboard() {
  const navigate = useNavigate()
  const { user, session, authLoading } = useApp()
  
  console.log('📧 [EmailDashboard] Estado de autenticación:', {
    authLoading,
    hasUser: !!user,
    hasSession: !!session,
    userId: user?.id,
    orgId: user?.org_id
  })
  
  // Mientras se está cargando la autenticación
  if (authLoading) {
    return (
      <div className="space-y-6">
        <StandardPageHeader
          title="Dashboard de Email"
          description="Verificando autenticación..."
        />
        <div className="space-y-4">
          <Skeleton className="h-20 w-full" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        </div>
      </div>
    )
  }
  
  // Si no hay sesión válida, redirigir al login
  if (!session || !user) {
    console.log('⚠️ [EmailDashboard] Sesión no válida, redirigiendo al login')
    navigate('/login', { 
      replace: true,
      state: { from: { pathname: '/emails/dashboard' } }
    })
    return null
  }
  
  // Verificar si el usuario tiene datos completos
  if (!user.id || !user.org_id) {
    return (
      <div className="space-y-6">
        <StandardPageHeader
          title="Dashboard de Email"
          description="Completando configuración del usuario..."
        />
        <Alert className="border-0.5 border-black rounded-[10px]">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Los datos del usuario están incompletos. Por favor, contacte al administrador.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return <EmailDashboardContent />
}

function EmailDashboardContent() {
  const navigate = useNavigate()
  const [showDiagnostic, setShowDiagnostic] = useState(false)
  const [hasError, setHasError] = useState<string | null>(null)
  
  // Usar try-catch para hooks problemáticos
  let connectionStatus: any = 'disconnected'
  let connectionData = null
  let isConnecting = false
  let isSyncing = false
  let connect = () => {}
  let syncEmails = () => {}
  
  try {
    const outlookConnection = useOutlookConnection()
    connectionStatus = outlookConnection.connectionStatus
    connectionData = outlookConnection.connectionData
    isConnecting = outlookConnection.isConnecting
    isSyncing = outlookConnection.isSyncing
    connect = outlookConnection.connect
    syncEmails = outlookConnection.syncEmails
  } catch (error) {
    console.error('❌ [EmailDashboard] Error en useOutlookConnection:', error)
    setHasError(`Error de conexión: ${error instanceof Error ? error.message : 'Error desconocido'}`)
  }
  
  // Hook para manejar errores de autenticación específicos con manejo de errores
  let authError: string | null = null
  let authConnectionStatus = 'idle'
  
  try {
    const outlookAuth = useOutlookAuth()
    authError = outlookAuth.error
    authConnectionStatus = outlookAuth.connectionStatus
  } catch (error) {
    console.error('❌ [EmailDashboard] Error en useOutlookAuth:', error)
    authError = `Error de autenticación: ${error instanceof Error ? error.message : 'Error desconocido'}`
  }
  
  // Métricas con manejo de errores
  let metrics = null
  let metricsLoading = false
  let metricsError: string | null = null
  
  try {
    const emailMetrics = useEmailMetrics()
    metrics = emailMetrics.metrics
    metricsLoading = emailMetrics.isLoading
    metricsError = emailMetrics.error ? String(emailMetrics.error) : null
  } catch (error) {
    console.error('❌ [EmailDashboard] Error en useEmailMetrics:', error)
    metricsError = `Error cargando métricas: ${error instanceof Error ? error.message : 'Error desconocido'}`
  }

  const handleConfigure = () => {
    connect()
  }

  const handleSync = () => {
    syncEmails()
  }

  return (
    <EmailErrorBoundary>
      <div className="space-y-6">
        <StandardPageHeader
          title="Dashboard de Email"
          description="Gestiona tus emails y sincronización con Outlook"
          actions={
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowDiagnostic(true)}
                className="gap-2"
              >
                <Bug className="h-4 w-4" />
                Diagnóstico
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/emails/settings')}
                className="gap-2"
              >
                <Settings className="h-4 w-4" />
                Configuración
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/emails/inbox')}
                className="gap-2"
              >
                <Mail className="h-4 w-4" />
                Ver Bandeja
              </Button>
            </div>
          }
        />

        {/* Estado de conexión mejorado */}
        <EmailConnectionStatus />
        
        {/* Estado de conexión original (respaldo) */}
        <OutlookConnectionStatus
          status={authConnectionStatus === 'expired' ? 'expired' : (connectionStatus as any)}
          lastSync={connectionData?.updated_at ? new Date(connectionData.updated_at) : undefined}
          onSync={handleSync}
          onConfigure={handleConfigure}
          isSyncing={isSyncing}
          error={authError || undefined}
        />

        {/* Error de métricas */}
        {metricsError && (
          <Alert className="border-0.5 border-black rounded-[10px]">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Error al cargar las métricas de email. Verifique su conexión e inténtelo de nuevo.
            </AlertDescription>
          </Alert>
        )}

        {/* Métricas de email */}
        <EmailMetricsCards 
          metrics={metrics} 
          isLoading={metricsLoading} 
        />

        {/* Emails recientes */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="border-0.5 border-black rounded-[10px]">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="h-5 w-5" />
                    Emails Recientes
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleSync}
                    disabled={isSyncing || connectionStatus !== 'connected'}
                    className="gap-2"
                  >
                    <RefreshCw className={`h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
                    {isSyncing ? 'Sincronizando...' : 'Actualizar'}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <RecentEmailsList />
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            {/* Acciones rápidas */}
            <Card className="border-0.5 border-black rounded-[10px]">
              <CardHeader>
                <CardTitle>Acciones Rápidas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  className="w-full gap-2" 
                  onClick={() => navigate('/emails/compose')}
                  disabled={connectionStatus !== 'connected'}
                >
                  <Mail className="h-4 w-4" />
                  Nuevo Email
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full gap-2"
                  onClick={() => navigate('/emails/inbox')}
                >
                  <Mail className="h-4 w-4" />
                  Ver Bandeja de Entrada
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full gap-2"
                  onClick={() => navigate('/emails/sent')}
                >
                  <Mail className="h-4 w-4" />
                  Emails Enviados
                </Button>
              </CardContent>
            </Card>

            {/* Estadísticas de conexión */}
            {connectionData && (
              <Card className="border-0.5 border-black rounded-[10px]">
                <CardHeader>
                  <CardTitle>Estado de Conexión</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="text-sm">
                    <span className="font-medium">Estado:</span>{' '}
                    <span className="text-green-600">Conectado</span>
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">Última actualización:</span>{' '}
                    <span className="text-muted-foreground">
                      {new Date(connectionData.updated_at).toLocaleString('es-ES')}
                    </span>
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">Token expira:</span>{' '}
                    <span className="text-muted-foreground">
                      {new Date(connectionData.token_expires_at).toLocaleString('es-ES')}
                    </span>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Diagnóstico Modal */}
        <OutlookConnectionDiagnostic 
          isOpen={showDiagnostic}
          onClose={() => setShowDiagnostic(false)}
        />
      </div>
    </EmailErrorBoundary>
  )
}