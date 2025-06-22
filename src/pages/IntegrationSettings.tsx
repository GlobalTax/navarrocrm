
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { OutlookIntegrationSettings } from '@/components/integrations/OutlookIntegrationSettings'
import { UserOutlookSettings } from '@/components/integrations/UserOutlookSettings'
import { IntegrationTestPanel } from '@/components/integrations/IntegrationTestPanel'
import { ConnectionStatusCard } from '@/components/integrations/ConnectionStatusCard'
import { QuickSetupGuide } from '@/components/integrations/QuickSetupGuide'
import { useApp } from '@/contexts/AppContext'
import { Settings, User, TestTube, Zap } from 'lucide-react'

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

      {/* Estado rápido de conexión */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ConnectionStatusCard />
        </div>
        <div>
          <QuickSetupGuide />
        </div>
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
          <TabsTrigger value="testing">
            <TestTube className="w-4 h-4 mr-2" />
            Testing
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

        <TabsContent value="testing">
          <IntegrationTestPanel />
        </TabsContent>
      </Tabs>
    </div>
  )
}
