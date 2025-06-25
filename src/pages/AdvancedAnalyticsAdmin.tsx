
import React from 'react'
import { StandardPageContainer } from '@/components/layout/StandardPageContainer'
import { StandardPageHeader } from '@/components/layout/StandardPageHeader'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AdminAlertsCenter } from '@/components/analytics/AdminAlertsCenter'
import { SystemHealthMonitor } from '@/components/analytics/SystemHealthMonitor'
import { useAlertsManager } from '@/hooks/analytics/useAlertsManager'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { AlertTriangle, Activity, Settings, Download } from 'lucide-react'
import { useCRMAnalytics } from '@/hooks/useCRMAnalytics'

export default function AdvancedAnalyticsAdmin() {
  const { activeAlertsCount, criticalAlertsCount } = useAlertsManager()
  const crmAnalytics = useCRMAnalytics()

  React.useEffect(() => {
    crmAnalytics.trackPageView('/advanced-analytics-admin', 'Advanced Analytics Admin')
  }, [crmAnalytics])

  const handleExportReport = () => {
    crmAnalytics.trackFeatureUsage('analytics_admin', 'export_report')
    // Implementar exportación de reporte
    console.log('Exporting comprehensive analytics report...')
  }

  return (
    <StandardPageContainer>
      <StandardPageHeader
        title="Centro de Control Analytics"
        description="Sistema avanzado de monitoreo, alertas y optimización del rendimiento"
        actions={
          <div className="flex items-center space-x-3">
            {criticalAlertsCount > 0 && (
              <Badge className="bg-red-500 text-white animate-pulse">
                {criticalAlertsCount} Críticas
              </Badge>
            )}
            {activeAlertsCount > 0 && (
              <Badge variant="secondary">
                {activeAlertsCount} Activas
              </Badge>
            )}
            <Button variant="outline" onClick={handleExportReport}>
              <Download className="h-4 w-4 mr-2" />
              Exportar Reporte
            </Button>
          </div>
        }
      />

      <Tabs defaultValue="health" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="health" className="flex items-center space-x-2">
            <Activity className="h-4 w-4" />
            <span>Salud del Sistema</span>
          </TabsTrigger>
          <TabsTrigger value="alerts" className="flex items-center space-x-2">
            <AlertTriangle className="h-4 w-4" />
            <span>Centro de Alertas</span>
            {activeAlertsCount > 0 && (
              <Badge variant="secondary" className="ml-1 text-xs">
                {activeAlertsCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center space-x-2">
            <Settings className="h-4 w-4" />
            <span>Configuración</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="health" className="space-y-6">
          <SystemHealthMonitor />
        </TabsContent>

        <TabsContent value="alerts" className="space-y-6">
          <AdminAlertsCenter />
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Configuraciones de alertas */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Configuración de Alertas</h3>
              <p className="text-muted-foreground">
                La configuración avanzada de alertas está en desarrollo. 
                Próximamente podrás personalizar umbrales, tipos de notificaciones y más.
              </p>
            </div>

            {/* Configuraciones de cache */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Optimización del Sistema</h3>
              <p className="text-muted-foreground">
                El sistema de cache y optimización automática está funcionando en segundo plano
                para garantizar el mejor rendimiento posible.
              </p>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </StandardPageContainer>
  )
}
