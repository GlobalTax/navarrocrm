
import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/integrations/supabase/client'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { CheckCircle, XCircle, Settings, Mail, Calendar, AlertCircle } from 'lucide-react'
import { useApp } from '@/contexts/AppContext'

interface OutlookConfig {
  id?: string
  is_enabled: boolean
  outlook_client_id: string
  outlook_tenant_id: string
  outlook_client_secret: string
  email_integration_enabled: boolean
  auto_email_enabled: boolean
  sync_frequency_minutes: number
}

export const OutlookIntegrationSettings = () => {
  const { toast } = useToast()
  const { user } = useApp()
  const queryClient = useQueryClient()
  const [isTestingConnection, setIsTestingConnection] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'success' | 'error'>('idle')
  
  // Obtener configuración actual
  const { data: config, isLoading } = useQuery({
    queryKey: ['outlook-integration-config'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('organization_integrations')
        .select('*')
        .eq('integration_type', 'outlook')
        .maybeSingle()
      
      if (error) throw error
      return data
    }
  })

  // Mutación para guardar configuración
  const saveConfigMutation = useMutation({
    mutationFn: async (newConfig: OutlookConfig) => {
      if (!user?.org_id) {
        throw new Error('No se pudo obtener el ID de la organización')
      }

      const configData = {
        org_id: user.org_id,
        integration_type: 'outlook',
        is_enabled: newConfig.is_enabled,
        outlook_client_id: newConfig.outlook_client_id,
        outlook_tenant_id: newConfig.outlook_tenant_id,
        outlook_client_secret_encrypted: newConfig.outlook_client_secret, // En producción: cifrar
        email_integration_enabled: newConfig.email_integration_enabled,
        auto_email_enabled: newConfig.auto_email_enabled,
        sync_frequency_minutes: newConfig.sync_frequency_minutes
      }

      if (config?.id) {
        const { data, error } = await supabase
          .from('organization_integrations')
          .update(configData)
          .eq('id', config.id)
          .select()
          .single()
        
        if (error) throw error
        return data
      } else {
        const { data, error } = await supabase
          .from('organization_integrations')
          .insert(configData)
          .select()
          .single()
        
        if (error) throw error
        return data
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['outlook-integration-config'] })
      toast({
        title: "Configuración guardada",
        description: "La integración con Outlook ha sido configurada correctamente",
      })
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "No se pudo guardar la configuración",
        variant: "destructive",
      })
    }
  })

  const testConnection = async () => {
    if (!config?.outlook_client_id || !config?.outlook_tenant_id) {
      toast({
        title: "Configuración incompleta",
        description: "Por favor, completa todos los campos antes de probar la conexión",
        variant: "destructive",
      })
      return
    }

    setIsTestingConnection(true)
    setConnectionStatus('idle')

    try {
      const { data, error } = await supabase.functions.invoke('outlook-auth', {
        body: {
          action: 'get_auth_url',
          org_id: config.org_id
        }
      })

      if (error) throw error
      if (data?.auth_url) {
        setConnectionStatus('success')
        toast({
          title: "Conexión exitosa",
          description: "La configuración de Azure AD es correcta",
        })
      }
    } catch (error: any) {
      setConnectionStatus('error')
      toast({
        title: "Error de conexión",
        description: error.message || "No se pudo conectar con Microsoft Graph",
        variant: "destructive",
      })
    } finally {
      setIsTestingConnection(false)
    }
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    
    const newConfig: OutlookConfig = {
      is_enabled: formData.get('is_enabled') === 'on',
      outlook_client_id: formData.get('outlook_client_id') as string,
      outlook_tenant_id: formData.get('outlook_tenant_id') as string,
      outlook_client_secret: formData.get('outlook_client_secret') as string,
      email_integration_enabled: formData.get('email_integration_enabled') === 'on',
      auto_email_enabled: formData.get('auto_email_enabled') === 'on',
      sync_frequency_minutes: parseInt(formData.get('sync_frequency_minutes') as string) || 15
    }

    saveConfigMutation.mutate(newConfig)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Integración con Outlook</h2>
          <p className="text-muted-foreground">
            Configura la sincronización con Microsoft Outlook/Exchange
          </p>
        </div>
        <Badge variant={config?.is_enabled ? "default" : "secondary"}>
          {config?.is_enabled ? "Activa" : "Inactiva"}
        </Badge>
      </div>

      <Tabs defaultValue="config" className="space-y-4">
        <TabsList>
          <TabsTrigger value="config">
            <Settings className="w-4 h-4 mr-2" />
            Configuración
          </TabsTrigger>
          <TabsTrigger value="features">
            <Calendar className="w-4 h-4 mr-2" />
            Funcionalidades
          </TabsTrigger>
          <TabsTrigger value="help">
            <AlertCircle className="w-4 h-4 mr-2" />
            Ayuda
          </TabsTrigger>
        </TabsList>

        <TabsContent value="config">
          <form onSubmit={handleSubmit} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Configuración de Azure AD</CardTitle>
                <CardDescription>
                  Credenciales de la aplicación registrada en Azure Active Directory
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch 
                    name="is_enabled"
                    defaultChecked={config?.is_enabled || false}
                  />
                  <Label htmlFor="is_enabled">Activar integración con Outlook</Label>
                </div>

                <Separator />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="outlook_client_id">Client ID</Label>
                    <Input
                      id="outlook_client_id"
                      name="outlook_client_id"
                      type="text"
                      defaultValue={config?.outlook_client_id || ''}
                      placeholder="12345678-1234-1234-1234-123456789012"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="outlook_tenant_id">Tenant ID</Label>
                    <Input
                      id="outlook_tenant_id"
                      name="outlook_tenant_id"
                      type="text"
                      defaultValue={config?.outlook_tenant_id || ''}
                      placeholder="87654321-4321-4321-4321-210987654321"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="outlook_client_secret">Client Secret</Label>
                  <Input
                    id="outlook_client_secret"
                    name="outlook_client_secret"
                    type="password"
                    defaultValue={config?.outlook_client_secret_encrypted || ''}
                    placeholder="Secreto de la aplicación de Azure AD"
                    required
                  />
                </div>

                <div className="flex items-center gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={testConnection}
                    disabled={isTestingConnection}
                  >
                    {isTestingConnection ? 'Probando...' : 'Probar Conexión'}
                  </Button>
                  
                  {connectionStatus === 'success' && (
                    <div className="flex items-center text-green-600">
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Conexión exitosa
                    </div>
                  )}
                  
                  {connectionStatus === 'error' && (
                    <div className="flex items-center text-red-600">
                      <XCircle className="w-4 h-4 mr-1" />
                      Error de conexión
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Configuración de Email</CardTitle>
                <CardDescription>
                  Configuración para envío automático de emails
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch 
                    name="email_integration_enabled"
                    defaultChecked={config?.email_integration_enabled || false}
                  />
                  <Label>Activar integración de email</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch 
                    name="auto_email_enabled"
                    defaultChecked={config?.auto_email_enabled || false}
                  />
                  <Label>Envío automático de invitaciones</Label>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sync_frequency_minutes">Frecuencia de sincronización (minutos)</Label>
                  <Input
                    id="sync_frequency_minutes"
                    name="sync_frequency_minutes"
                    type="number"
                    min="5"
                    max="1440"
                    defaultValue={config?.sync_frequency_minutes || 15}
                  />
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button 
                type="submit" 
                disabled={saveConfigMutation.isPending}
              >
                {saveConfigMutation.isPending ? 'Guardando...' : 'Guardar Configuración'}
              </Button>
            </div>
          </form>
        </TabsContent>

        <TabsContent value="features">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="w-5 h-5 mr-2" />
                  Sincronización de Calendario
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li>• Sincronización bidireccional de eventos</li>
                  <li>• Creación automática en Outlook</li>
                  <li>• Actualización en tiempo real</li>
                  <li>• Gestión de invitados</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Mail className="w-5 h-5 mr-2" />
                  Gestión de Emails
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li>• Invitaciones automáticas</li>
                  <li>• Recordatorios personalizables</li>
                  <li>• Plantillas de email</li>
                  <li>• Follow-ups automáticos</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="help">
          <Card>
            <CardHeader>
              <CardTitle>Configuración de Azure AD</CardTitle>
              <CardDescription>
                Pasos para registrar la aplicación en Microsoft Azure
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Para configurar la integración necesitas registrar una aplicación en Azure Active Directory
                </AlertDescription>
              </Alert>

              <div className="space-y-3 text-sm">
                <div>
                  <h4 className="font-medium">1. Registrar aplicación</h4>
                  <p className="text-muted-foreground">Ve a Azure Portal → Azure Active Directory → App registrations</p>
                </div>
                
                <div>
                  <h4 className="font-medium">2. Configurar permisos</h4>
                  <p className="text-muted-foreground">API permissions → Microsoft Graph:</p>
                  <ul className="list-disc list-inside ml-4 text-muted-foreground">
                    <li>Calendars.ReadWrite</li>
                    <li>Mail.Send</li>
                    <li>offline_access</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-medium">3. URL de redirección</h4>
                  <p className="text-muted-foreground">
                    Añadir: <code className="bg-muted px-1 rounded">
                      {window.location.origin}/functions/v1/outlook-auth
                    </code>
                  </p>
                </div>
                
                <div>
                  <h4 className="font-medium">4. Crear secreto</h4>
                  <p className="text-muted-foreground">Certificates & secrets → New client secret</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
