
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { OutlookIntegrationSettings } from '@/components/integrations/OutlookIntegrationSettings'
import { UserOutlookSettings } from '@/components/integrations/UserOutlookSettings'
import { IntegrationTestPanel } from '@/components/integrations/IntegrationTestPanel'
import { ConnectionStatusCard } from '@/components/integrations/ConnectionStatusCard'
import { QuickSetupGuide } from '@/components/integrations/QuickSetupGuide'
import { IntegrationWizard } from '@/components/integrations/IntegrationWizard'
import { useApp } from '@/contexts/AppContext'
import { Settings, User, TestTube, Zap, Shield } from 'lucide-react'

export default function IntegrationSettings() {
  const { user } = useApp()
  const isAdmin = user?.role === 'partner' || user?.role === 'area_manager'

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Header mejorado */}
      <div className="text-center lg:text-left">
        <h1 className="text-3xl font-bold text-gray-900">Configuración de Integraciones</h1>
        <p className="text-gray-600 mt-2">
          Conecta tu despacho con herramientas externas para automatizar flujos de trabajo
        </p>
      </div>

      {/* Wizard de configuración */}
      <IntegrationWizard />

      {/* Estado rápido de conexión */}
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
            <TabsTrigger value="admin" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Administración</span>
            </TabsTrigger>
          )}
          <TabsTrigger value="user" className="flex items-center gap-2">
            <User className="w-4 h-4" />
            <span className="hidden sm:inline">Mi Cuenta</span>
          </TabsTrigger>
          <TabsTrigger value="testing" className="flex items-center gap-2">
            <TestTube className="w-4 h-4" />
            <span className="hidden sm:inline">Pruebas</span>
          </TabsTrigger>
        </TabsList>

        {isAdmin && (
          <TabsContent value="admin" className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="h-5 w-5 text-blue-600" />
                <h3 className="font-semibold text-blue-900">Panel de Administrador</h3>
              </div>
              <p className="text-blue-700 text-sm">
                Configura las integraciones a nivel organizacional. Los cambios afectarán a todos los usuarios.
              </p>
            </div>
            <OutlookIntegrationSettings />
          </TabsContent>
        )}

        <TabsContent value="user" className="space-y-6">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <User className="h-5 w-5 text-green-600" />
              <h3 className="font-semibold text-green-900">Configuración Personal</h3>
            </div>
            <p className="text-green-700 text-sm">
              Personaliza las integraciones según tus necesidades y preferencias de trabajo.
            </p>
          </div>
          <UserOutlookSettings />
        </TabsContent>

        <TabsContent value="testing" className="space-y-6">
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <TestTube className="h-5 w-5 text-orange-600" />
              <h3 className="font-semibold text-orange-900">Panel de Pruebas</h3>
            </div>
            <p className="text-orange-700 text-sm">
              Verifica el funcionamiento de las integraciones y diagnostica posibles problemas.
            </p>
          </div>
          <IntegrationTestPanel />
        </TabsContent>
      </Tabs>
    </div>
  )
}
