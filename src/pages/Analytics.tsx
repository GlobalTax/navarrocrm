
import { StandardPageContainer } from '@/components/layout/StandardPageContainer'
import { StandardPageHeader } from '@/components/layout/StandardPageHeader'
import { AnalyticsSection } from '@/components/analytics/AnalyticsSection'
import { RealTimeMetricsChart } from '@/components/analytics/RealTimeMetricsChart'
import { WebVitalsDisplay } from '@/components/analytics/WebVitalsDisplay'
import { ErrorAnalyticsPanel } from '@/components/analytics/ErrorAnalyticsPanel'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useCRMAnalytics } from '@/hooks/useCRMAnalytics'
import { useEffect, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { Button } from '@/components/ui/button'
import { ExternalLink } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function Analytics() {
  const analytics = useCRMAnalytics()
  const [sessionEvents, setSessionEvents] = useState(analytics.getSessionEvents())

  useEffect(() => {
    analytics.trackPageView('/analytics', 'Analytics Dashboard')
  }, [analytics])

  // Datos de ejemplo para gráficos de actividad CRM
  const crmActivityData = [
    { name: 'Contactos', created: 12, updated: 8, viewed: 45 },
    { name: 'Expedientes', created: 5, updated: 15, viewed: 32 },
    { name: 'Propuestas', created: 3, updated: 7, viewed: 18 },
    { name: 'Tareas', created: 8, updated: 12, viewed: 28 },
  ]

  const featureUsageData = [
    { name: 'Búsqueda', value: 45, color: '#8884d8' },
    { name: 'Filtros', value: 32, color: '#82ca9d' },
    { name: 'Exportar', value: 18, color: '#ffc658' },
    { name: 'Plantillas', value: 12, color: '#ff7300' },
  ]

  return (
    <StandardPageContainer>
      <StandardPageHeader
        title="Analytics Dashboard"
        description="Análisis detallado del uso de la aplicación y métricas de rendimiento"
        actions={
          <Link to="/advanced-analytics">
            <Button variant="outline">
              <ExternalLink className="h-4 w-4 mr-2" />
              Dashboard Avanzado
            </Button>
          </Link>
        }
      />

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Resumen</TabsTrigger>
          <TabsTrigger value="realtime">Tiempo Real</TabsTrigger>
          <TabsTrigger value="crm">Actividad CRM</TabsTrigger>
          <TabsTrigger value="performance">Web Vitals</TabsTrigger>
          <TabsTrigger value="errors">Errores</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <AnalyticsSection />
        </TabsContent>

        <TabsContent value="realtime" className="space-y-6">
          <RealTimeMetricsChart />
        </TabsContent>

        <TabsContent value="crm" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Actividad por Módulo</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={crmActivityData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="created" fill="#8884d8" name="Creados" />
                    <Bar dataKey="updated" fill="#82ca9d" name="Actualizados" />
                    <Bar dataKey="viewed" fill="#ffc658" name="Visualizados" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Uso de Funcionalidades</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={featureUsageData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {featureUsageData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <WebVitalsDisplay />
        </TabsContent>

        <TabsContent value="errors" className="space-y-6">
          <ErrorAnalyticsPanel />
        </TabsContent>
      </Tabs>
    </StandardPageContainer>
  )
}
