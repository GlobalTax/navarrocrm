
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
  Eye
} from 'lucide-react'
import { supabase } from '@/integrations/supabase/client'
import { toast } from 'sonner'

export function EmailDiagnostics() {
  const [testEmail, setTestEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [lastTestResult, setLastTestResult] = useState<any>(null)
  const [invitationLogs, setInvitationLogs] = useState<any[]>([])
  const [showLogs, setShowLogs] = useState(false)

  const runEmailTest = async () => {
    if (!testEmail.trim()) {
      toast.error('Por favor ingresa un email válido')
      return
    }

    setIsLoading(true)
    try {
      console.log('🔍 Iniciando test de email...')
      
      const { data, error } = await supabase.functions.invoke('send-email', {
        body: {
          to: testEmail,
          subject: 'Test de configuración - CRM Sistema',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2>Test de configuración exitoso</h2>
              <p>Este es un email de prueba para verificar que la configuración de Resend funciona correctamente.</p>
              <p>Fecha: ${new Date().toLocaleString('es-ES')}</p>
            </div>
          `,
          testMode: true
        }
      })

      console.log('📧 Respuesta del test:', { data, error })

      if (error) {
        throw error
      }

      setLastTestResult({
        success: true,
        message: 'Test de email exitoso',
        timestamp: new Date(),
        details: data
      })

      toast.success('Test de email exitoso - Revisa tu bandeja de entrada')
    } catch (error: any) {
      console.error('❌ Error en test:', error)
      
      setLastTestResult({
        success: false,
        message: error.message || 'Error desconocido',
        timestamp: new Date(),
        details: error
      })

      toast.error(`Error en test: ${error.message}`)
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
            Diagnóstico de Email
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
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

          <div className="flex gap-3">
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
                  Enviar Test
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
        </CardContent>
      </Card>

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
