
import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { supabase } from '@/integrations/supabase/client'
import { CheckCircle, XCircle, AlertCircle, RefreshCw } from 'lucide-react'

interface DiagnosticResult {
  name: string
  status: 'success' | 'error' | 'warning'
  message: string
  details?: string
}

export const SystemDiagnostics = () => {
  const [results, setResults] = useState<DiagnosticResult[]>([])
  const [isRunning, setIsRunning] = useState(false)

  const runDiagnostics = async () => {
    setIsRunning(true)
    const diagnostics: DiagnosticResult[] = []

    // Test 1: Supabase Connection
    try {
      const { data, error } = await supabase.from('organizations').select('id').limit(1)
      if (error) {
        diagnostics.push({
          name: 'Conexión a Supabase',
          status: 'error',
          message: 'Error de conexión',
          details: error.message
        })
      } else {
        diagnostics.push({
          name: 'Conexión a Supabase',
          status: 'success',
          message: 'Conectado exitosamente'
        })
      }
    } catch (error) {
      diagnostics.push({
        name: 'Conexión a Supabase',
        status: 'error',
        message: 'Error crítico de conexión',
        details: error instanceof Error ? error.message : 'Error desconocido'
      })
    }

    // Test 2: RPC Function
    try {
      const { data, error } = await supabase.rpc('is_system_setup')
      if (error) {
        diagnostics.push({
          name: 'Función RPC is_system_setup',
          status: 'error',
          message: 'Error en función RPC',
          details: error.message
        })
      } else {
        diagnostics.push({
          name: 'Función RPC is_system_setup',
          status: 'success',
          message: `Función ejecutada correctamente (resultado: ${data})`
        })
      }
    } catch (error) {
      diagnostics.push({
        name: 'Función RPC is_system_setup',
        status: 'error',
        message: 'Error crítico en RPC',
        details: error instanceof Error ? error.message : 'Error desconocido'
      })
    }

    // Test 3: Auth Status
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        diagnostics.push({
          name: 'Estado de Autenticación',
          status: 'success',
          message: `Usuario autenticado: ${session.user.email}`
        })
      } else {
        diagnostics.push({
          name: 'Estado de Autenticación',
          status: 'warning',
          message: 'No hay sesión activa'
        })
      }
    } catch (error) {
      diagnostics.push({
        name: 'Estado de Autenticación',
        status: 'error',
        message: 'Error verificando autenticación',
        details: error instanceof Error ? error.message : 'Error desconocido'
      })
    }

    // Test 4: Users Table Access
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        const { data, error } = await supabase
          .from('users')
          .select('role, org_id')
          .eq('id', session.user.id)
          .maybeSingle()
        
        if (error) {
          diagnostics.push({
            name: 'Acceso a tabla Users',
            status: 'error',
            message: 'Error accediendo a perfil de usuario',
            details: error.message
          })
        } else if (data) {
          diagnostics.push({
            name: 'Acceso a tabla Users',
            status: 'success',
            message: `Perfil encontrado: ${data.role} en org ${data.org_id}`
          })
        } else {
          diagnostics.push({
            name: 'Acceso a tabla Users',
            status: 'warning',
            message: 'No se encontró perfil de usuario'
          })
        }
      } else {
        diagnostics.push({
          name: 'Acceso a tabla Users',
          status: 'warning',
          message: 'No se puede verificar sin sesión activa'
        })
      }
    } catch (error) {
      diagnostics.push({
        name: 'Acceso a tabla Users',
        status: 'error',
        message: 'Error crítico accediendo a usuarios',
        details: error instanceof Error ? error.message : 'Error desconocido'
      })
    }

    setResults(diagnostics)
    setIsRunning(false)
  }

  const getStatusIcon = (status: DiagnosticResult['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />
    }
  }

  const getStatusBadgeVariant = (status: DiagnosticResult['status']) => {
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
          Diagnósticos del Sistema
          <Button
            variant="outline"
            size="sm"
            onClick={runDiagnostics}
            disabled={isRunning}
          >
            {isRunning ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            {isRunning ? 'Ejecutando...' : 'Ejecutar Diagnósticos'}
          </Button>
        </CardTitle>
        <CardDescription>
          Verifica el estado de conexiones y configuraciones críticas del sistema
        </CardDescription>
      </CardHeader>
      <CardContent>
        {results.length === 0 ? (
          <p className="text-muted-foreground">
            Haz clic en "Ejecutar Diagnósticos" para verificar el estado del sistema.
          </p>
        ) : (
          <div className="space-y-4">
            {results.map((result, index) => (
              <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                {getStatusIcon(result.status)}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium">{result.name}</span>
                    <Badge variant={getStatusBadgeVariant(result.status)}>
                      {result.status.toUpperCase()}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-1">
                    {result.message}
                  </p>
                  {result.details && (
                    <p className="text-xs text-muted-foreground bg-muted p-2 rounded">
                      {result.details}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
