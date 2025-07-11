import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAsyncOperation } from '@/hooks/useAsyncOperation'
import { supabase } from '@/integrations/supabase/client'
import { createError, showSuccessToast } from '@/utils/errorHandler'
import { ErrorState } from '@/components/ErrorState'
import { CheckCircle, XCircle, AlertTriangle, Clock } from 'lucide-react'

interface HealthCheck {
  name: string
  status: 'checking' | 'success' | 'warning' | 'error'
  message: string
  critical: boolean
}

export const HealthChecker: React.FC = () => {
  const [checks, setChecks] = useState<HealthCheck[]>([
    { name: 'Conexión a Base de Datos', status: 'checking', message: 'Verificando...', critical: true },
    { name: 'Autenticación', status: 'checking', message: 'Verificando...', critical: true },
    { name: 'Cache Local', status: 'checking', message: 'Verificando...', critical: false },
    { name: 'Navegador Compatible', status: 'checking', message: 'Verificando...', critical: false },
  ])

  const { execute: runHealthCheck, isLoading, error, retry } = useAsyncOperation({
    maxRetries: 1,
    delay: 2000
  })

  const updateCheck = (name: string, updates: Partial<HealthCheck>) => {
    setChecks(prev => prev.map(check => 
      check.name === name ? { ...check, ...updates } : check
    ))
  }

  const performHealthChecks = async () => {
    console.log('🔍 [HealthChecker] Iniciando verificaciones de salud')

    try {
      // 1. Verificar conexión a DB
      updateCheck('Conexión a Base de Datos', { status: 'checking', message: 'Consultando...' })
      
      const { data, error: dbError } = await supabase
        .from('organizations')
        .select('id')
        .limit(1)
        .maybeSingle()

      if (dbError) {
        updateCheck('Conexión a Base de Datos', {
          status: 'error',
          message: `Error: ${dbError.message}`
        })
      } else {
        updateCheck('Conexión a Base de Datos', {
          status: 'success',
          message: 'Conectado correctamente'
        })
      }

      // 2. Verificar auth
      updateCheck('Autenticación', { status: 'checking', message: 'Verificando estado...' })
      
      const { data: { session }, error: authError } = await supabase.auth.getSession()
      
      if (authError) {
        updateCheck('Autenticación', {
          status: 'warning',
          message: `Advertencia: ${authError.message}`
        })
      } else {
        updateCheck('Autenticación', {
          status: 'success',
          message: session ? 'Sesión activa' : 'Sistema listo para login'
        })
      }

      // 3. Verificar cache local
      updateCheck('Cache Local', { status: 'checking', message: 'Verificando storage...' })
      
      try {
        localStorage.setItem('health_check', Date.now().toString())
        const stored = localStorage.getItem('health_check')
        
        if (stored) {
          updateCheck('Cache Local', {
            status: 'success',
            message: 'LocalStorage funcionando'
          })
        } else {
          updateCheck('Cache Local', {
            status: 'warning',
            message: 'LocalStorage no disponible'
          })
        }
      } catch {
        updateCheck('Cache Local', {
          status: 'warning',
          message: 'Storage limitado o bloqueado'
        })
      }

      // 4. Verificar navegador
      updateCheck('Navegador Compatible', { status: 'checking', message: 'Verificando soporte...' })
      
      const hasModernFeatures = !!(
        window.fetch && 
        window.Promise && 
        window.localStorage &&
        Array.prototype.includes
      )

      if (hasModernFeatures) {
        updateCheck('Navegador Compatible', {
          status: 'success',
          message: 'Navegador compatible'
        })
      } else {
        updateCheck('Navegador Compatible', {
          status: 'error',
          message: 'Navegador no soportado'
        })
      }

    } catch (error) {
      console.error('❌ [HealthChecker] Error en verificaciones:', error)
      throw createError('Error en verificaciones de salud', {
        severity: 'high',
        retryable: true,
        userMessage: 'Error ejecutando verificaciones del sistema'
      })
    }
  }

  useEffect(() => {
    runHealthCheck(performHealthChecks)
  }, [])

  const getStatusIcon = (status: HealthCheck['status']) => {
    switch (status) {
      case 'checking': return <Clock className="h-4 w-4 text-yellow-500 animate-spin" />
      case 'success': return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'warning': return <AlertTriangle className="h-4 w-4 text-orange-500" />
      case 'error': return <XCircle className="h-4 w-4 text-red-500" />
    }
  }

  const criticalIssues = checks.filter(c => c.critical && c.status === 'error')
  const canProceed = criticalIssues.length === 0 && !isLoading

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-center">Verificación del Sistema</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <ErrorState error={error} onRetry={retry} />
        )}

        <div className="space-y-3">
          {checks.map((check) => (
            <div key={check.name} className="flex items-center gap-3 p-2 rounded border">
              {getStatusIcon(check.status)}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{check.name}</p>
                <p className="text-xs text-muted-foreground">{check.message}</p>
              </div>
              {check.critical && (
                <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                  Crítico
                </span>
              )}
            </div>
          ))}
        </div>

        <div className="pt-4 space-y-2">
          <Button 
            onClick={() => runHealthCheck(performHealthChecks)} 
            variant="outline" 
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? 'Verificando...' : 'Verificar de Nuevo'}
          </Button>

          {canProceed && (
            <Button 
              onClick={() => window.location.reload()} 
              className="w-full"
            >
              Continuar a la Aplicación
            </Button>
          )}
        </div>

        {criticalIssues.length > 0 && (
          <div className="p-3 bg-red-50 border border-red-200 rounded">
            <p className="text-sm text-red-800 font-medium">
              {criticalIssues.length} problema(s) crítico(s) detectado(s)
            </p>
            <p className="text-xs text-red-600 mt-1">
              Contacte al administrador si persisten estos errores.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}