import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { toast } from 'sonner'
import { supabase } from '@/integrations/supabase/client'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { CheckCircle, XCircle, Mail, Calendar, AlertCircle, LogOut } from 'lucide-react'

export const UserOutlookSettings = () => {
  const queryClient = useQueryClient()
  const [isConnecting, setIsConnecting] = useState(false)

  // Obtener configuración de la organización
  const { data: orgConfig } = useQuery({
    queryKey: ['org-outlook-config'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('organization_integrations')
        .select('*')
        .eq('integration_type', 'outlook')
        .eq('is_enabled', true)
        .maybeSingle()
      
      if (error) throw error
      return data
    }
  })

  // Obtener tokens del usuario
  const { data: userToken, isLoading } = useQuery({
    queryKey: ['user-outlook-token'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_outlook_tokens')
        .select('*')
        .eq('is_active', true)
        .maybeSingle()
      
      if (error) throw error
      return data
    }
  })

  // Conectar con Outlook
  const connectMutation = useMutation({
    mutationFn: async () => {
      if (!orgConfig) throw new Error('Integración no configurada')

      const { data, error } = await supabase.functions.invoke('outlook-auth', {
        body: {
          action: 'get_auth_url',
          org_id: orgConfig.org_id
        }
      })

      if (error) throw error
      if (!data?.auth_url) throw new Error('No se pudo obtener URL de autorización')

      // Redirigir a Microsoft OAuth
      window.location.href = data.auth_url
    },
    onError: (error: any) => {
      toast.error("Error de conexión", {
        description: error.message || "No se pudo conectar con Outlook",
      })
    }
  })

  // Desconectar Outlook
  const disconnectMutation = useMutation({
    mutationFn: async () => {
      if (!userToken) return

      const { error } = await supabase
        .from('user_outlook_tokens')
        .update({ is_active: false })
        .eq('id', userToken.id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-outlook-token'] })
      toast.success("Desconectado", {
        description: "Tu cuenta de Outlook ha sido desconectada",
      })
    },
    onError: (error: any) => {
      toast.error("Error", {
        description: error.message || "No se pudo desconectar",
      })
    }
  })

  const handleConnect = () => {
    setIsConnecting(true)
    connectMutation.mutate()
  }

  const handleDisconnect = () => {
    disconnectMutation.mutate()
  }

  const isConnected = userToken && userToken.is_active
  const isTokenExpired = userToken && new Date(userToken.token_expires_at) <= new Date()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!orgConfig) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Integración con Outlook</CardTitle>
          <CardDescription>
            La integración con Outlook no está configurada
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Contacta con tu administrador para activar la integración con Microsoft Outlook
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Mi cuenta de Outlook</h2>
          <p className="text-muted-foreground">
            Configura tu conexión personal con Microsoft Outlook
          </p>
        </div>
        <Badge variant={isConnected && !isTokenExpired ? "default" : "secondary"}>
          {isConnected && !isTokenExpired ? "Conectado" : "Desconectado"}
        </Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Mail className="w-5 h-5 mr-2" />
            Estado de Conexión
          </CardTitle>
          <CardDescription>
            Conecta tu cuenta personal de Microsoft Outlook para sincronización
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isConnected ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="font-medium text-green-900">Cuenta conectada</p>
                    <p className="text-sm text-green-700">{userToken.outlook_email}</p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDisconnect}
                  disabled={disconnectMutation.isPending}
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Desconectar
                </Button>
              </div>

              {isTokenExpired && (
                <Alert variant="destructive">
                  <XCircle className="h-4 w-4" />
                  <AlertDescription>
                    Tu token ha expirado. Reconéctate para continuar sincronizando.
                  </AlertDescription>
                </Alert>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <Calendar className="w-4 h-4" />
                    <span className="font-medium">Calendario</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Sincronización bidireccional activa
                  </p>
                </div>

                <div className="p-4 border rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <Mail className="w-4 h-4" />
                    <span className="font-medium">Email</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Envío de invitaciones habilitado
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium">Permisos concedidos:</h4>
                <div className="flex flex-wrap gap-2">
                  {userToken.scope_permissions?.map((permission, index) => (
                    <Badge key={index} variant="outline">
                      {permission}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <XCircle className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="font-medium text-gray-900">Sin conexión</p>
                    <p className="text-sm text-gray-600">
                      Conecta tu cuenta para sincronizar calendario y enviar emails
                    </p>
                  </div>
                </div>
                <Button
                  onClick={handleConnect}
                  disabled={isConnecting || connectMutation.isPending}
                >
                  {isConnecting || connectMutation.isPending ? 'Conectando...' : 'Conectar Outlook'}
                </Button>
              </div>

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Al conectar tu cuenta, podrás sincronizar eventos de calendario y enviar emails automáticamente desde el sistema.
                </AlertDescription>
              </Alert>
            </div>
          )}
        </CardContent>
      </Card>

      {isConnected && (
        <Card>
          <CardHeader>
            <CardTitle>Configuración de Sincronización</CardTitle>
            <CardDescription>
              Personaliza cómo quieres sincronizar con Outlook
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Sincronización automática de eventos</Label>
                <p className="text-sm text-muted-foreground">
                  Los eventos creados se sincronizarán automáticamente
                </p>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Invitaciones automáticas</Label>
                <p className="text-sm text-muted-foreground">
                  Enviar invitaciones por email al crear eventos
                </p>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Recordatorios por email</Label>
                <p className="text-sm text-muted-foreground">
                  Enviar recordatorios automáticos antes de reuniones
                </p>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
