
import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { 
  Mail, 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  Send,
  RefreshCw,
  Eye,
  Settings,
  Bug
} from 'lucide-react'
import { supabase } from '@/integrations/supabase/client'
import { toast } from 'sonner'

export function EmailDiagnostics() {
  const [testEmail, setTestEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isDiagnosing, setIsDiagnosing] = useState(false)
  const [lastTestResult, setLastTestResult] = useState<any>(null)
  const [diagnosticResults, setDiagnosticResults] = useState<any>(null)
  const [invitationLogs, setInvitationLogs] = useState<any[]>([])
  const [showLogs, setShowLogs] = useState(false)

  const runCompleteDiagnostic = async () => {
    setIsDiagnosing(true)
    setDiagnosticResults(null)
    
    try {
      console.log('🔍 Iniciando diagnóstico completo de email...')
      
      const results = {
        configTest: null,
        basicTest: null,
        invitationTest: null,
        timestamp: new Date()
      }

      // Test 1: Verificar configuración básica
      console.log('🧪 Test 1: Verificación de configuración')
      try {
        const { data: configData, error: configError } = await supabase.functions.invoke('send-email', {
          body: {
            to: 'test@example.com',
            subject: 'Config Test',
            html: '<p>Config test</p>',
            testMode: true
          }
        })

        results.configTest = {
          success: !configError,
          data: configData,
          error: configError
        }
        console.log('🧪 Test 1 resultado:', results.configTest)
      } catch (error) {
        results.configTest = {
          success: false,
          error: error
        }
      }

      // Test 2: Envío básico (si se proporciona email)
      if (testEmail) {
        console.log('🧪 Test 2: Envío básico')
        try {
          const { data: basicData, error: basicError } = await supabase.functions.invoke('send-email', {
            body: {
              to: testEmail,
              subject: 'Test Diagnóstico - CRM Sistema',
              html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                  <h2>Diagnóstico de Email</h2>
                  <p>Este es un email de prueba del sistema de diagnóstico.</p>
                  <p>Fecha: ${new Date().toLocaleString('es-ES')}</p>
                  <p>Si recibes este email, la configuración está funcionando correctamente.</p>
                </div>
              `,
              testMode: false
            }
          })

          results.basicTest = {
            success: !basicError,
            data: basicData,
            error: basicError
          }
          console.log('🧪 Test 2 resultado:', results.basicTest)
        } catch (error) {
          results.basicTest = {
            success: false,
            error: error
          }
        }
      }

      // Test 3: Simular envío de invitación
      if (testEmail) {
        console.log('🧪 Test 3: Simulación de invitación')
        try {
          const invitationUrl = `${window.location.origin}/signup?token=test-token`
          const invitationHtml = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #333;">Invitación de Prueba</h2>
              <p>Esta es una invitación de prueba del sistema.</p>
              <div style="margin: 30px 0;">
                <a href="${invitationUrl}" 
                   style="background-color: #0061FF; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                  Enlace de Prueba
                </a>
              </div>
              <p>Fecha de prueba: ${new Date().toLocaleString('es-ES')}</p>
            </div>
          `

          const { data: invitationData, error: invitationError } = await supabase.functions.invoke('send-email', {
            body: {
              to: testEmail,
              subject: 'Prueba de Invitación - CRM Sistema',
              html: invitationHtml,
              invitationToken: 'test-token'
            }
          })

          results.invitationTest = {
            success: !invitationError,
            data: invitationData,
            error: invitationError
          }
          console.log('🧪 Test 3 resultado:', results.invitationTest)
        } catch (error) {
          results.invitationTest = {
            success: false,
            error: error
          }
        }
      }

      setDiagnosticResults(results)
      console.log('🔍 Diagnóstico completo:', results)
      
      // Mostrar resultado general
      const allPassed = results.configTest?.success && 
                       (!testEmail || results.basicTest?.success) &&
                       (!testEmail || results.invitationTest?.success)
      
      if (allPassed) {
        toast.success('Diagnóstico completado - Todo funciona correctamente')
      } else {
        toast.warning('Diagnóstico completado - Se encontraron problemas')
      }

    } catch (error: any) {
      console.error('❌ Error en diagnóstico:', error)
      toast.error(`Error en diagnóstico: ${error.message}`)
    } finally {
      setIsDiagnosing(false)
    }
  }

  const runEmailTest = async () => {
    if (!testEmail.trim()) {
      toast.error('Por favor ingresa un email válido')
      return
    }

    setIsLoading(true)
    try {
      console.log('🔍 Iniciando test de email simple...')
      
      const { data, error } = await supabase.functions.invoke('send-email', {
        body: {
          to: testEmail,
          subject: 'Test Simple - CRM Sistema',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2>Test de Email Simple</h2>
              <p>Este es un test simple del sistema de email.</p>
              <p>Fecha: ${new Date().toLocaleString('es-ES')}</p>
            </div>
          `,
          testMode: false
        }
      })

      console.log('📧 Respuesta del test simple:', { data, error })

      if (error) {
        throw error
      }

      setLastTestResult({
        success: true,
        message: 'Test de email simple exitoso',
        timestamp: new Date(),
        details: data
      })

      toast.success('Test de email simple exitoso - Revisa tu bandeja de entrada')
    } catch (error: any) {
      console.error('❌ Error en test simple:', error)
      
      setLastTestResult({
        success: false,
        message: error.message || 'Error desconocido',
        timestamp: new Date(),
        details: error
      })

      toast.error(`Error en test simple: ${error.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  const loadInvitationLogs = async () => {
    try {
      const { data: invitations, error } = await supabase
        .from('user_invitations')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10)

      if (error) throw error

      const { data: auditLogs, error: auditError } = await supabase
        .from('user_audit_log')
        .select('*')
        .eq('action_type', 'invitation_sent')
        .order('created_at', { ascending: false })
        .limit(10)

      if (auditError) throw auditError

      setInvitationLogs([
        ...invitations.map(inv => ({ ...inv, type: 'invitation' })),
        ...auditLogs.map(log => ({ ...log, type: 'audit' }))
      ])
      setShowLogs(true)
    } catch (error: any) {
      console.error('Error cargando logs:', error)
      toast.error('Error cargando logs')
    }
  }

  const getStatusIcon = (success: boolean) => {
    return success ? (
      <CheckCircle className="h-4 w-4 text-green-600" />
    ) : (
      <XCircle className="h-4 w-4 text-red-600" />
    )
  }

  const getStatusColor = (success: boolean) => {
    return success 
      ? 'bg-green-50 text-green-700 border-green-200'
      : 'bg-red-50 text-red-700 border-red-200'
  }

  return (
    <div className="space-y-6">
      <Card className="border-0.5 border-black rounded-[10px]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Diagnóstico Avanzado de Email
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="test-email">Email de prueba</Label>
            <Input
              id="test-email"
              type="email"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              placeholder="tu@email.com"
              className="border-0.5 border-black rounded-[10px]"
            />
          </div>

          <div className="flex gap-3 flex-wrap">
            <Button 
              onClick={runEmailTest}
              disabled={isLoading || !testEmail.trim()}
              className="border-0.5 border-black rounded-[10px] hover-lift"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Test Simple
                </>
              )}
            </Button>

            <Button 
              onClick={runCompleteDiagnostic}
              disabled={isDiagnosing}
              variant="outline"
              className="border-0.5 border-black rounded-[10px]"
            >
              {isDiagnosing ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Diagnosticando...
                </>
              ) : (
                <>
                  <Bug className="h-4 w-4 mr-2" />
                  Diagnóstico Completo
                </>
              )}
            </Button>

            <Button 
              variant="outline"
              onClick={loadInvitationLogs}
              className="border-0.5 border-black rounded-[10px]"
            >
              <Eye className="h-4 w-4 mr-2" />
              Ver Logs
            </Button>
          </div>

          {/* Resultado de test simple */}
          {lastTestResult && (
            <Alert className={`border-0.5 rounded-[10px] ${
              lastTestResult.success ? 'border-green-300' : 'border-red-300'
            }`}>
              <div className="flex items-center gap-2">
                {getStatusIcon(lastTestResult.success)}
                <AlertDescription>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{lastTestResult.message}</span>
                      <Badge className={`${getStatusColor(lastTestResult.success)} text-xs font-medium border`}>
                        {lastTestResult.success ? 'Exitoso' : 'Error'}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-600">
                      {lastTestResult.timestamp.toLocaleString('es-ES')}
                    </p>
                    {!lastTestResult.success && lastTestResult.details && (
                      <details className="mt-2">
                        <summary className="cursor-pointer text-xs font-medium">
                          Detalles del error
                        </summary>
                        <pre className="mt-1 text-xs bg-gray-100 p-2 rounded">
                          {JSON.stringify(lastTestResult.details, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                </AlertDescription>
              </div>
            </Alert>
          )}

          {/* Resultados de diagnóstico completo */}
          {diagnosticResults && (
            <Card className="border-0.5 border-gray-300 rounded-[10px]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Settings className="h-4 w-4" />
                  Resultados del Diagnóstico Completo
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Test de configuración */}
                <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(diagnosticResults.configTest?.success)}
                    <div>
                      <p className="font-medium">Configuración del Servicio</p>
                      <p className="text-sm text-gray-600">Verificación de API Key y conectividad</p>
                    </div>
                  </div>
                  <Badge className={`${getStatusColor(diagnosticResults.configTest?.success)} text-xs`}>
                    {diagnosticResults.configTest?.success ? 'OK' : 'Error'}
                  </Badge>
                </div>

                {/* Test básico */}
                {diagnosticResults.basicTest && (
                  <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(diagnosticResults.basicTest?.success)}
                      <div>
                        <p className="font-medium">Envío Básico</p>
                        <p className="text-sm text-gray-600">Test de envío real a {testEmail}</p>
                      </div>
                    </div>
                    <Badge className={`${getStatusColor(diagnosticResults.basicTest?.success)} text-xs`}>
                      {diagnosticResults.basicTest?.success ? 'Enviado' : 'Error'}
                    </Badge>
                  </div>
                )}

                {/* Test de invitación */}
                {diagnosticResults.invitationTest && (
                  <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(diagnosticResults.invitationTest?.success)}
                      <div>
                        <p className="font-medium">Invitación Simulada</p>
                        <p className="text-sm text-gray-600">Test de email de invitación completo</p>
                      </div>
                    </div>
                    <Badge className={`${getStatusColor(diagnosticResults.invitationTest?.success)} text-xs`}>
                      {diagnosticResults.invitationTest?.success ? 'Enviado' : 'Error'}
                    </Badge>
                  </div>
                )}

                <div className="text-xs text-gray-500 pt-2 border-t">
                  Diagnóstico realizado: {diagnosticResults.timestamp.toLocaleString('es-ES')}
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>

      {/* Logs de invitaciones */}
      {showLogs && (
        <Card className="border-0.5 border-black rounded-[10px]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Logs de Invitaciones Recientes
            </CardTitle>
          </CardHeader>
          <CardContent>
            {invitationLogs.length === 0 ? (
              <p className="text-gray-600 text-center py-4">
                No hay logs de invitaciones recientes
              </p>
            ) : (
              <div className="space-y-3">
                {invitationLogs.map((log, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge className={`text-xs font-medium border ${
                          log.type === 'invitation' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-green-50 text-green-700 border-green-200'
                        }`}>
                          {log.type === 'invitation' ? 'Invitación' : 'Envío'}
                        </Badge>
                        <span className="font-medium">
                          {log.email || log.new_value?.email || 'Email no disponible'}
                        </span>
                      </div>
                      <div className="text-xs text-gray-600">
                        {log.type === 'invitation' ? (
                          <>
                            Estado: {log.status} | Rol: {log.role} | {new Date(log.created_at).toLocaleString('es-ES')}
                          </>
                        ) : (
                          <>
                            Acción: {log.action_type} | {log.details} | {new Date(log.created_at).toLocaleString('es-ES')}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
