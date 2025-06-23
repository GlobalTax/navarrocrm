
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { OutlookIntegrationSettings } from '@/components/integrations/OutlookIntegrationSettings'
import { UserOutlookSettings } from '@/components/integrations/UserOutlookSettings'
import { IntegrationTestPanel } from '@/components/integrations/IntegrationTestPanel'
import { ConnectionStatusCard } from '@/components/integrations/ConnectionStatusCard'
import { QuickSetupGuide } from '@/components/integrations/QuickSetupGuide'
import { IntegrationWizard } from '@/components/integrations/IntegrationWizard'
import { useApp } from '@/contexts/AppContext'
import { StandardPageContainer } from '@/components/layout/StandardPageContainer'
import { StandardPageHeader } from '@/components/layout/StandardPageHeader'

export default function IntegrationSettings() {
  const { user } = useApp()
  const isAdmin = user?.role === 'partner' || user?.role === 'area_manager'

  return (
    <StandardPageContainer>
      <StandardPageHeader
        title="Configuración de Integraciones"
        description="Conecta tu despacho con herramientas externas para automatizar flujos de trabajo"
      />

      <IntegrationWizard />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ConnectionStatusCard />
        </div>
        <div>
          <QuickSetupGuide />
        </div>
      </div>

      <Tabs defaultValue={isAdmin ? "admin" : "user"} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          {isAdmin && (
            <TabsTrigger value="admin">
              Administración
            </TabsTrigger>
          )}
          <TabsTrigger value="user">
            Mi Cuenta
          </TabsTrigger>
          <TabsTrigger value="testing">
            Pruebas
          </TabsTrigger>
        </TabsList>

        {isAdmin && (
          <TabsContent value="admin" className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2">Panel de Administrador</h3>
              <p className="text-blue-700 text-sm">
                Configura las integraciones a nivel organizacional. Los cambios afectarán a todos los usuarios.
              </p>
            </div>
            <OutlookIntegrationSettings />
          </TabsContent>
        )}

        <TabsContent value="user" className="space-y-6">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="font-semibold text-green-900 mb-2">Configuración Personal</h3>
            <p className="text-green-700 text-sm">
              Personaliza las integraciones según tus necesidades y preferencias de trabajo.
            </p>
          </div>
          <UserOutlookSettings />
        </TabsContent>

        <TabsContent value="testing" className="space-y-6">
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <h3 className="font-semibold text-orange-900 mb-2">Panel de Pruebas</h3>
            <p className="text-orange-700 text-sm">
              Verifica el funcionamiento de las integraciones y diagnostica posibles problemas.
            </p>
          </div>
          <IntegrationTestPanel />
        </TabsContent>
      </Tabs>
    </StandardPageContainer>
  )
}
