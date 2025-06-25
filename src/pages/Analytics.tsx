
import { StandardPageContainer } from '@/components/layout/StandardPageContainer'
import { StandardPageHeader } from '@/components/layout/StandardPageHeader'
import { AnalyticsSection } from '@/components/analytics/AnalyticsSection'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useCRMAnalytics } from '@/hooks/useCRMAnalytics'
import { useEffect, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

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
      />

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Resumen</TabsTrigger>
          <TabsTrigger value="crm">Actividad CRM</TabsTrigger>
          <TabsTrigger value="performance">Rendimiento</TabsTrigger>
          <TabsTrigger value="events">Eventos</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <AnalyticsSection />
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
          <Card>
            <CardHeader>
              <CardTitle>Métricas de Rendimiento Web</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center text-muted-foreground">
                Las métricas de rendimiento se recopilarán automáticamente durante el uso de la aplicación.
                <br />
                Incluye métricas de Web Vitals: LCP, FID, CLS
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="events" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Eventos de la Sesión</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {sessionEvents.length > 0 ? (
                  sessionEvents.slice(-10).map((event, index) => (
                    <div key={index} className="flex items-center justify-between p-2 border rounded">
                      <div>
                        <span className="font-medium">{event.category}</span>
                        <span className="mx-2">•</span>
                        <span>{event.action}</span>
                        {event.label && (
                          <>
                            <span className="mx-2">•</span>
                            <span className="text-muted-foreground">{event.label}</span>
                          </>
                        )}
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {new Date(event.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-muted-foreground">
                    No hay eventos registrados en esta sesión
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </StandardPageContainer>
  )
}
