import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { RefreshCw, AlertTriangle, CheckCircle, Clock } from 'lucide-react'

interface LoadingDiagnosticProps {
  authLoading: boolean
  setupLoading: boolean
  isSetup: boolean | null
  session: any
  user: any
  onForceLogin: () => void
  onRetry: () => void
}

export const LoadingDiagnostic: React.FC<LoadingDiagnosticProps> = ({
  authLoading,
  setupLoading,
  isSetup,
  session,
  user,
  onForceLogin,
  onRetry
}) => {
  const getStatusIcon = (loading: boolean, hasData: boolean) => {
    if (loading) return <Clock className="h-4 w-4 text-yellow-500" />
    return hasData ? 
      <CheckCircle className="h-4 w-4 text-green-500" /> : 
      <AlertTriangle className="h-4 w-4 text-red-500" />
  }

  const getStatusText = (loading: boolean, hasData: boolean) => {
    if (loading) return 'Cargando...'
    return hasData ? 'Completado' : 'Error/Sin datos'
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-500" />
            Diagnóstico de Carga
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Autenticación</span>
              <div className="flex items-center gap-2">
                {getStatusIcon(authLoading, !!session)}
                <Badge variant={authLoading ? "secondary" : session ? "default" : "destructive"}>
                  {getStatusText(authLoading, !!session)}
                </Badge>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm">Usuario</span>
              <div className="flex items-center gap-2">
                {getStatusIcon(false, !!user)}
                <Badge variant={user ? "default" : "destructive"}>
                  {user ? 'Cargado' : 'No disponible'}
                </Badge>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm">Configuración</span>
              <div className="flex items-center gap-2">
                {getStatusIcon(setupLoading, isSetup === true)}
                <Badge variant={setupLoading ? "secondary" : isSetup ? "default" : "destructive"}>
                  {getStatusText(setupLoading, isSetup === true)}
                </Badge>
              </div>
            </div>
          </div>

          <div className="pt-4 space-y-2">
            <Button onClick={onRetry} variant="outline" className="w-full">
              <RefreshCw className="h-4 w-4 mr-2" />
              Reintentar Carga
            </Button>
            
            <Button onClick={onForceLogin} variant="default" className="w-full">
              Forzar Ingreso a Login
            </Button>
          </div>

          <div className="text-xs text-muted-foreground mt-4 p-2 bg-muted rounded">
            <strong>Debug Info:</strong><br />
            Auth: {authLoading ? '⏳' : '✅'} | 
            Setup: {setupLoading ? '⏳' : '✅'} | 
            Session: {session ? '✅' : '❌'} | 
            User: {user ? '✅' : '❌'}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}