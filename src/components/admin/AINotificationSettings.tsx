
import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useAINotifications, useCreateAINotificationConfig, useUpdateAINotificationConfig } from '@/hooks/useAINotifications'
import { useApp } from '@/contexts/AppContext'
import { Bell, Mail, Monitor } from 'lucide-react'

export function AINotificationSettings() {
  const { user } = useApp()
  const { data: config } = useAINotifications()
  const createConfig = useCreateAINotificationConfig()
  const updateConfig = useUpdateAINotificationConfig()

  const [settings, setSettings] = useState({
    notification_type: config?.notification_type || 'email',
    threshold_cost: config?.threshold_cost || 50,
    threshold_failures: config?.threshold_failures || 20,
    is_enabled: config?.is_enabled ?? true,
    email_address: config?.email_address || user?.email || ''
  })

  const handleSave = () => {
    const configData = {
      org_id: user?.org_id!,
      user_id: user?.id!,
      ...settings
    }

    if (config?.id) {
      updateConfig.mutate({ id: config.id, ...configData })
    } else {
      createConfig.mutate(configData)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Configuración de Alertas
        </CardTitle>
        <CardDescription>
          Configura cuándo y cómo recibir notificaciones sobre anomalías en el uso de IA
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label className="text-base font-medium">Activar Alertas</Label>
            <p className="text-sm text-muted-foreground">
              Recibir notificaciones cuando se detecten anomalías
            </p>
          </div>
          <Switch
            checked={settings.is_enabled}
            onCheckedChange={(checked) => 
              setSettings(prev => ({ ...prev, is_enabled: checked }))
            }
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="notification_type">Tipo de Notificación</Label>
          <Select
            value={settings.notification_type}
            onValueChange={(value) => 
              setSettings(prev => ({ ...prev, notification_type: value as any }))
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecciona el tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="email">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Solo Email
                </div>
              </SelectItem>
              <SelectItem value="dashboard">
                <div className="flex items-center gap-2">
                  <Monitor className="h-4 w-4" />
                  Solo Dashboard
                </div>
              </SelectItem>
              <SelectItem value="both">
                <div className="flex items-center gap-2">
                  <Bell className="h-4 w-4" />
                  Email y Dashboard
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {(settings.notification_type === 'email' || settings.notification_type === 'both') && (
          <div className="space-y-2">
            <Label htmlFor="email_address">Email para Alertas</Label>
            <Input
              id="email_address"
              type="email"
              value={settings.email_address}
              onChange={(e) => 
                setSettings(prev => ({ ...prev, email_address: e.target.value }))
              }
              placeholder="tu-email@ejemplo.com"
            />
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="threshold_cost">Umbral de Costo (€)</Label>
            <Input
              id="threshold_cost"
              type="number"
              value={settings.threshold_cost}
              onChange={(e) => 
                setSettings(prev => ({ ...prev, threshold_cost: Number(e.target.value) }))
              }
              min="0"
              step="10"
            />
            <p className="text-xs text-muted-foreground">
              Alertar si el costo mensual supera este valor
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="threshold_failures">Umbral de Fallos (%)</Label>
            <Input
              id="threshold_failures"
              type="number" 
              value={settings.threshold_failures}
              onChange={(e) => 
                setSettings(prev => ({ ...prev, threshold_failures: Number(e.target.value) }))
              }
              min="0"
              max="100"
              step="5"
            />
            <p className="text-xs text-muted-foreground">
              Alertar si la tasa de fallos supera este porcentaje
            </p>
          </div>
        </div>

        <Button 
          onClick={handleSave}
          disabled={createConfig.isPending || updateConfig.isPending}
          className="w-full"
        >
          {createConfig.isPending || updateConfig.isPending ? 'Guardando...' : 'Guardar Configuración'}
        </Button>
      </CardContent>
    </Card>
  )
}
