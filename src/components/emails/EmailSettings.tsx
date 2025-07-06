import { useState } from 'react'
import { StandardPageHeader } from '@/components/layout/StandardPageHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { OutlookConnectionStatus } from './OutlookConnectionStatus'
import { useOutlookConnection } from '@/hooks/useOutlookConnection'
import { Settings, Save, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'

export function EmailSettings() {
  const { connectionStatus, connect, syncEmails, isSyncing } = useOutlookConnection()
  const [settings, setSettings] = useState({
    autoSync: true,
    syncInterval: '15',
    enableNotifications: true,
    saveToSent: true,
    trackOpens: false,
    signature: '',
    syncFolders: ['inbox', 'sent', 'drafts']
  })
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async () => {
    setIsSaving(true)
    try {
      // TODO: Implementar guardado de configuración
      await new Promise(resolve => setTimeout(resolve, 1000))
      toast.success('Configuración guardada')
    } catch (error) {
      toast.error('Error al guardar configuración')
    } finally {
      setIsSaving(false)
    }
  }

  const handleSync = async () => {
    try {
      await syncEmails(true) // Full sync
      toast.success('Sincronización completa realizada')
    } catch (error) {
      toast.error('Error en la sincronización')
    }
  }

  return (
    <div className="space-y-6">
      <StandardPageHeader
        title="Configuración de Email"
        description="Gestiona la conexión y preferencias de correo electrónico"
        actions={
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="gap-2"
          >
            <Save className="h-4 w-4" />
            {isSaving ? 'Guardando...' : 'Guardar'}
          </Button>
        }
      />

      {/* Estado de conexión */}
      <OutlookConnectionStatus 
        status={connectionStatus}
        onSync={handleSync}
        onConfigure={connect}
        isSyncing={isSyncing}
      />

      {/* Configuración de sincronización */}
      <Card className="border-0.5 border-black rounded-[10px]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5" />
            Sincronización
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="font-medium">Sincronización automática</label>
              <p className="text-sm text-muted-foreground">
                Sincronizar emails automáticamente en segundo plano
              </p>
            </div>
            <Switch
              checked={settings.autoSync}
              onCheckedChange={(checked) => setSettings({ ...settings, autoSync: checked })}
            />
          </div>

          <div>
            <label className="font-medium mb-2 block">Intervalo de sincronización</label>
            <Select 
              value={settings.syncInterval}
              onValueChange={(value) => setSettings({ ...settings, syncInterval: value })}
            >
              <SelectTrigger className="border-0.5 border-black rounded-[10px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">Cada 5 minutos</SelectItem>
                <SelectItem value="15">Cada 15 minutos</SelectItem>
                <SelectItem value="30">Cada 30 minutos</SelectItem>
                <SelectItem value="60">Cada hora</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="font-medium mb-2 block">Carpetas a sincronizar</label>
            <div className="flex flex-wrap gap-2">
              {['inbox', 'sent', 'drafts', 'archive'].map((folder) => (
                <Badge
                  key={folder}
                  variant={settings.syncFolders.includes(folder) ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => {
                    const newFolders = settings.syncFolders.includes(folder)
                      ? settings.syncFolders.filter(f => f !== folder)
                      : [...settings.syncFolders, folder]
                    setSettings({ ...settings, syncFolders: newFolders })
                  }}
                >
                  {folder.charAt(0).toUpperCase() + folder.slice(1)}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Configuración general */}
      <Card className="border-0.5 border-black rounded-[10px]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Preferencias
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="font-medium">Notificaciones</label>
              <p className="text-sm text-muted-foreground">
                Recibir notificaciones de nuevos emails
              </p>
            </div>
            <Switch
              checked={settings.enableNotifications}
              onCheckedChange={(checked) => setSettings({ ...settings, enableNotifications: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <label className="font-medium">Guardar en enviados</label>
              <p className="text-sm text-muted-foreground">
                Guardar copias de emails enviados desde el CRM
              </p>
            </div>
            <Switch
              checked={settings.saveToSent}
              onCheckedChange={(checked) => setSettings({ ...settings, saveToSent: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <label className="font-medium">Rastreo de apertura</label>
              <p className="text-sm text-muted-foreground">
                Rastrear cuándo los destinatarios abren tus emails
              </p>
            </div>
            <Switch
              checked={settings.trackOpens}
              onCheckedChange={(checked) => setSettings({ ...settings, trackOpens: checked })}
            />
          </div>

          <div>
            <label className="font-medium mb-2 block">Firma de email</label>
            <Input
              placeholder="Tu firma personalizada..."
              value={settings.signature}
              onChange={(e) => setSettings({ ...settings, signature: e.target.value })}
              className="border-0.5 border-black rounded-[10px]"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}