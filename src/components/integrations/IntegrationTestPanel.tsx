
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CheckCircle, XCircle, Clock, Play, RefreshCw, AlertTriangle } from 'lucide-react'
import { supabase } from '@/integrations/supabase/client'
import { useApp } from '@/contexts/AppContext'
import { toast } from 'sonner'

interface TestResult {
  name: string
  status: 'success' | 'error' | 'warning' | 'pending'
  message: string
  details?: string
}

export const IntegrationTestPanel = () => {
  const { user } = useApp()
  const [isRunning, setIsRunning] = useState(false)
  const [testResults, setTestResults] = useState<TestResult[]>([])

  const runTest = async (testName: string, testFn: () => Promise<TestResult>) => {
    setTestResults(prev => prev.map(result => 
      result.name === testName 
        ? { ...result, status: 'pending', message: 'Ejecutando...' }
        : result
    ))

    try {
      const result = await testFn()
      setTestResults(prev => prev.map(r => r.name === testName ? result : r))
    } catch (error) {
      setTestResults(prev => prev.map(r => 
        r.name === testName 
          ? { 
              name: testName, 
              status: 'error', 
              message: 'Error inesperado',
              details: error instanceof Error ? error.message : 'Error desconocido'
            }
          : r
      ))
    }
  }

  const testDatabaseConnection = async (): Promise<TestResult> => {
    try {
      const { data, error } = await supabase
        .from('organization_integrations')
        .select('id')
        .limit(1)

      if (error) throw error

      return {
        name: 'Conexión Base de Datos',
        status: 'success',
        message: 'Conexión establecida correctamente'
      }
    } catch (error) {
      return {
        name: 'Conexión Base de Datos',
        status: 'error',
        message: 'Error de conexión',
        details: error instanceof Error ? error.message : 'Error desconocido'
      }
    }
  }

  const testOutlookIntegration = async (): Promise<TestResult> => {
    try {
      if (!user?.org_id) {
        return {
          name: 'Integración Outlook',
          status: 'warning',
          message: 'Usuario sin organización'
        }
      }

      const { data, error } = await supabase
        .from('organization_integrations')
        .select('*')
        .eq('org_id', user.org_id)
        .eq('integration_type', 'outlook')
        .single()

      if (error && error.code !== 'PGRST116') throw error

      if (!data) {
        return {
          name: 'Integración Outlook',
          status: 'warning',
          message: 'Configuración no encontrada'
        }
      }

      if (!data.is_enabled) {
        return {
          name: 'Integración Outlook',
          status: 'warning',
          message: 'Integración deshabilitada'
        }
      }

      if (!data.outlook_client_id || !data.outlook_tenant_id) {
        return {
          name: 'Integración Outlook',
          status: 'error',
          message: 'Credenciales incompletas'
        }
      }

      return {
        name: 'Integración Outlook',
        status: 'success',
        message: 'Configuración válida'
      }
    } catch (error) {
      return {
        name: 'Integración Outlook',
        status: 'error',
        message: 'Error de verificación',
        details: error instanceof Error ? error.message : 'Error desconocido'
      }
    }
  }

  const testUserTokens = async (): Promise<TestResult> => {
    try {
      if (!user?.org_id) {
        return {
          name: 'Tokens Usuario',
          status: 'warning',
          message: 'Usuario sin organización'
        }
      }

      const { data, error } = await supabase
        .from('user_outlook_tokens')
        .select('*')
        .eq('user_id', user.id)
        .eq('org_id', user.org_id)
        .eq('is_active', true)

      if (error) throw error

      if (!data || data.length === 0) {
        return {
          name: 'Tokens Usuario',
          status: 'warning',
          message: 'No hay tokens activos'
        }
      }

      const activeToken = data[0]
      const isExpired = new Date(activeToken.token_expires_at) <= new Date()

      if (isExpired) {
        return {
          name: 'Tokens Usuario',
          status: 'warning',
          message: 'Token expirado',
          details: `Expiró: ${new Date(activeToken.token_expires_at).toLocaleString('es-ES')}`
        }
      }

      return {
        name: 'Tokens Usuario',
        status: 'success',
        message: 'Token válido y activo'
      }
    } catch (error) {
      return {
        name: 'Tokens Usuario',
        status: 'error',
        message: 'Error verificando tokens',
        details: error instanceof Error ? error.message : 'Error desconocido'
      }
    }
  }

  const testEdgeFunctions = async (): Promise<TestResult> => {
    try {
      // Test simple ping to outlook-auth function
      const response = await fetch('/functions/v1/outlook-auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabase.supabaseKey}`
        },
        body: JSON.stringify({ action: 'ping' })
      })

      if (response.status === 404) {
        return {
          name: 'Edge Functions',
          status: 'warning',
          message: 'Función no desplegada'
        }
      }

      return {
        name: 'Edge Functions',
        status: 'success',
        message: 'Funciones accesibles'
      }
    } catch (error) {
      return {
        name: 'Edge Functions',
        status: 'warning',
        message: 'No se pueden verificar',
        details: 'Posiblemente no desplegadas'
      }
    }
  }

  const runAllTests = async () => {
    setIsRunning(true)
    setTestResults([
      { name: 'Conexión Base de Datos', status: 'pending', message: 'Iniciando...' },
      { name: 'Integración Outlook', status: 'pending', message: 'Iniciando...' },
      { name: 'Tokens Usuario', status: 'pending', message: 'Iniciando...' },
      { name: 'Edge Functions', status: 'pending', message: 'Iniciando...' }
    ])

    await runTest('Conexión Base de Datos', testDatabaseConnection)
    await runTest('Integración Outlook', testOutlookIntegration)
    await runTest('Tokens Usuario', testUserTokens)
    await runTest('Edge Functions', testEdgeFunctions)

    setIsRunning(false)
    toast.success('Tests completados')
  }

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'error':
        return <XCircle className="h-4 w-4 text-red-600" />
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />
      case 'pending':
        return <Clock className="h-4 w-4 text-blue-600 animate-pulse" />
    }
  }

  const getStatusColor = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return 'default'
      case 'error':
        return 'destructive'
      case 'warning':
        return 'secondary'
      case 'pending':
        return 'outline'
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Play className="h-5 w-5" />
            Panel de Testing de Integraciones
          </CardTitle>
          <Button 
            onClick={runAllTests} 
            disabled={isRunning}
            className="flex items-center gap-2"
          >
            {isRunning ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                Ejecutando...
              </>
            ) : (
              <>
                <Play className="h-4 w-4" />
                Ejecutar Tests
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="results" className="w-full">
          <TabsList>
            <TabsTrigger value="results">Resultados</TabsTrigger>
            <TabsTrigger value="recommendations">Recomendaciones</TabsTrigger>
          </TabsList>
          
          <TabsContent value="results" className="space-y-4">
            {testResults.length === 0 ? (
              <Alert>
                <AlertDescription>
                  Haz clic en "Ejecutar Tests" para verificar el estado de las integraciones.
                </AlertDescription>
              </Alert>
            ) : (
              <div className="space-y-3">
                {testResults.map((result, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(result.status)}
                      <div>
                        <div className="font-medium">{result.name}</div>
                        <div className="text-sm text-gray-600">{result.message}</div>
                        {result.details && (
                          <div className="text-xs text-gray-500 mt-1">{result.details}</div>
                        )}
                      </div>
                    </div>
                    <Badge variant={getStatusColor(result.status) as any}>
                      {result.status.toUpperCase()}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="recommendations" className="space-y-4">
            <div className="space-y-3">
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Configuración Inicial:</strong> Asegúrate de que las credenciales de Azure AD estén configuradas en el panel de administración.
                </AlertDescription>
              </Alert>
              
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Autenticación:</strong> Los usuarios deben autenticarse con Outlook desde la página de configuración personal.
                </AlertDescription>
              </Alert>
              
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Edge Functions:</strong> Despliega las funciones de Supabase para habilitar la sincronización automática.
                </AlertDescription>
              </Alert>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
