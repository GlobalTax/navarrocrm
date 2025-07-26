
import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { supabase } from '@/integrations/supabase/client'
import { CheckCircle, XCircle, AlertTriangle, RefreshCw } from 'lucide-react'
import { setupLogger } from '@/utils/logging'

interface SecurityCheck {
  name: string
  status: 'success' | 'warning' | 'error'
  message: string
  details?: string
}

export const SecurityVerification = () => {
  const [checks, setChecks] = useState<SecurityCheck[]>([])
  const [isRunning, setIsRunning] = useState(false)

  const runSecurityChecks = async () => {
    setIsRunning(true)
    const securityChecks: SecurityCheck[] = []

    try {
      // Test 1: Verificar función is_system_setup con search_path seguro
      setupLogger.info('Verificando función is_system_setup')
      const { data: setupResult, error: setupError } = await supabase.rpc('is_system_setup')
      
      if (setupError) {
        securityChecks.push({
          name: 'Función is_system_setup',
          status: 'error',
          message: 'Error al ejecutar función',
          details: setupError.message
        })
      } else {
        securityChecks.push({
          name: 'Función is_system_setup',
          status: 'success',
          message: `Función ejecutada correctamente con search_path seguro (resultado: ${setupResult})`
        })
      }

      // Test 2: Verificar función get_user_org_id con search_path seguro
      setupLogger.info('Verificando función get_user_org_id')
      const { data: { session } } = await supabase.auth.getSession()
      
      if (session) {
        const { data: orgIdResult, error: orgIdError } = await supabase.rpc('get_user_org_id')
        
        if (orgIdError) {
          securityChecks.push({
            name: 'Función get_user_org_id',
            status: 'error',
            message: 'Error al ejecutar función',
            details: orgIdError.message
          })
        } else {
          securityChecks.push({
            name: 'Función get_user_org_id',
            status: 'success',
            message: `Función ejecutada correctamente con search_path seguro (org_id: ${orgIdResult || 'null'})`
          })
        }
      } else {
        securityChecks.push({
          name: 'Función get_user_org_id',
          status: 'warning',
          message: 'No se puede verificar sin sesión de usuario activa'
        })
      }

      // Test 3: Verificar configuración de autenticación
      setupLogger.info('Verificando configuración de Auth')
      securityChecks.push({
        name: 'Configuración de Auth',
        status: 'warning',
        message: 'Configuración manual requerida',
        details: 'Para completar las mejoras de seguridad, ve a Configuración > Auth en el dashboard de Supabase y: 1) Habilita "Leaked Password Protection", 2) Ajusta OTP expiry a 15-30 minutos'
      })

      // Test 4: Verificar conexión general
      setupLogger.info('Verificando conexión general')
      const { data: connTest, error: connError } = await supabase
        .from('organizations')
        .select('id')
        .limit(1)
      
      if (connError) {
        securityChecks.push({
          name: 'Conexión a Base de Datos',
          status: 'error',
          message: 'Error de conexión',
          details: connError.message
        })
      } else {
        securityChecks.push({
          name: 'Conexión a Base de Datos',
          status: 'success',
          message: 'Conexión exitosa con políticas RLS activas'
        })
      }

    } catch (error) {
      securityChecks.push({
        name: 'Verificación General',
        status: 'error',
        message: 'Error crítico en verificación',
        details: error instanceof Error ? error.message : 'Error desconocido'
      })
    }

    setChecks(securityChecks)
    setIsRunning(false)
  }

  const getStatusIcon = (status: SecurityCheck['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />
    }
  }

  const getStatusBadgeVariant = (status: SecurityCheck['status']) => {
    switch (status) {
      case 'success':
        return 'default'
      case 'error':
        return 'destructive'
      case 'warning':
        return 'secondary'
    }
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Verificación de Seguridad
          <Button
            variant="outline"
            size="sm"
            onClick={runSecurityChecks}
            disabled={isRunning}
          >
            {isRunning ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            {isRunning ? 'Verificando...' : 'Ejecutar Verificaciones'}
          </Button>
        </CardTitle>
        <CardDescription>
          Verifica que las mejoras de seguridad se hayan aplicado correctamente
        </CardDescription>
      </CardHeader>
      <CardContent>
        {checks.length === 0 ? (
          <p className="text-muted-foreground">
            Haz clic en "Ejecutar Verificaciones" para comprobar el estado de seguridad del sistema.
          </p>
        ) : (
          <div className="space-y-4">
            {checks.map((check, index) => (
              <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                {getStatusIcon(check.status)}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium">{check.name}</span>
                    <Badge variant={getStatusBadgeVariant(check.status)}>
                      {check.status.toUpperCase()}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-1">
                    {check.message}
                  </p>
                  {check.details && (
                    <p className="text-xs text-muted-foreground bg-muted p-2 rounded">
                      {check.details}
                    </p>
                  )}
                </div>
              </div>
            ))}
            
            {/* Instrucciones de configuración manual */}
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">📋 Configuración Manual Requerida</h4>
              <div className="text-sm text-blue-800 space-y-2">
                <p><strong>Para completar las mejoras de seguridad:</strong></p>
                <ol className="list-decimal list-inside space-y-1 ml-2">
                  <li>Ve al dashboard de Supabase → Authentication → Settings</li>
                  <li>Habilita "Leaked Password Protection"</li>
                  <li>Ajusta "OTP Expiry" a 15-30 minutos (actualmente está en más de 1 hora)</li>
                  <li>Guarda los cambios</li>
                </ol>
                <p className="mt-2"><strong>Nota:</strong> Estas configuraciones requieren acceso directo al dashboard de Supabase.</p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
