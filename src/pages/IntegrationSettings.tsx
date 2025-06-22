
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { OutlookIntegrationSettings } from '@/components/integrations/OutlookIntegrationSettings'
import { UserOutlookSettings } from '@/components/integrations/UserOutlookSettings'
import { useApp } from '@/contexts/AppContext'
import { Settings, User } from 'lucide-react'

export default function IntegrationSettings() {
  const { user } = useApp()
  const isAdmin = user?.role === 'partner' || user?.role === 'area_manager'

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Configuración de Integraciones</h1>
        <p className="text-muted-foreground">
          Configura las integraciones externas del sistema
        </p>
      </div>

      <Tabs defaultValue={isAdmin ? "admin" : "user"} className="space-y-4">
        <TabsList>
          {isAdmin && (
            <TabsTrigger value="admin">
              <Settings className="w-4 h-4 mr-2" />
              Administración
            </TabsTrigger>
          )}
          <TabsTrigger value="user">
            <User className="w-4 h-4 mr-2" />
            Mi Cuenta
          </TabsTrigger>
        </TabsList>

        {isAdmin && (
          <TabsContent value="admin">
            <OutlookIntegrationSettings />
          </TabsContent>
        )}

        <TabsContent value="user">
          <UserOutlookSettings />
        </TabsContent>
      </Tabs>
    </div>
  )
}
