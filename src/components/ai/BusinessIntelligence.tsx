
import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts'
import { TrendingUp, AlertTriangle, Users, DollarSign, Briefcase, Target } from 'lucide-react'
import { useAdvancedAI } from '@/hooks/useAdvancedAI'
import type { BusinessInsight } from '@/types/interfaces'
import type { BusinessInsightState } from '@/types/states'

const BusinessIntelligence = () => {
  const { generateBusinessInsights, isAnalyzing } = useAdvancedAI()
  const [insightState, setInsightState] = useState<BusinessInsightState>({
    insights: [],
    isLoading: false,
    lastUpdated: null,
    error: null
  })

  const [insights, setInsights] = useState<BusinessInsight | null>(null)

  const generateInsights = async (): Promise<void> => {
    setInsightState(prev => ({ ...prev, isLoading: true, error: null }))
    
    try {
      const result = await generateBusinessInsights()
      setInsights(result)
      setInsightState(prev => ({
        ...prev,
        insights: [result],
        lastUpdated: new Date(),
        isLoading: false
      }))
    } catch (error) {
      setInsightState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Error generating insights',
        isLoading: false
      }))
    }
  }

  useEffect(() => {
    generateInsights()
  }, [])

  const getRiskColor = (level: 'high' | 'medium' | 'low'): string => {
    const colorMap: Record<typeof level, string> = {
      high: 'destructive',
      medium: 'default',
      low: 'secondary'
    }
    return colorMap[level]
  }

  const getEffortColor = (effort: 'low' | 'medium' | 'high'): string => {
    const colorMap: Record<typeof effort, string> = {
      low: 'default',
      medium: 'secondary',
      high: 'destructive'
    }
    return colorMap[effort]
  }

  if (insightState.isLoading || isAnalyzing) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Business Intelligence</h2>
          <Progress value={45} className="w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (insightState.error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            Error en Business Intelligence
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-4">{insightState.error}</p>
          <Button onClick={generateInsights}>
            Reintentar Análisis
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (!insights) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Business Intelligence</CardTitle>
          <CardDescription>Genera insights inteligentes sobre tu negocio</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={generateInsights}>
            Generar Insights
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Business Intelligence</h2>
          <p className="text-gray-600">
            Última actualización: {insightState.lastUpdated?.toLocaleString('es-ES')}
          </p>
        </div>
        <Button onClick={generateInsights} disabled={insightState.isLoading}>
          Actualizar Insights
        </Button>
      </div>

      {/* KPIs Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ingresos Totales</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              €{insights.kpis.totalRevenue.toLocaleString('es-ES')}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clientes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{insights.kpis.totalClients}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Casos Totales</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{insights.kpis.totalCases}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Proyectos Activos</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{insights.kpis.activeProjects}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="revenue" className="space-y-4">
        <TabsList>
          <TabsTrigger value="revenue">Ingresos</TabsTrigger>
          <TabsTrigger value="clients">Clientes</TabsTrigger>
          <TabsTrigger value="opportunities">Oportunidades</TabsTrigger>
          <TabsTrigger value="risks">Riesgos</TabsTrigger>
        </TabsList>

        <TabsContent value="revenue" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Evolución de Ingresos</CardTitle>
              <CardDescription>Tendencia mensual de ingresos</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={insights.revenueChart}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`€${value}`, 'Ingresos']} />
                  <Line 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#0061FF" 
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Rentabilidad por Tipo de Caso</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={insights.casesProfitability}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="type" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`€${value}`, 'Beneficio']} />
                  <Bar dataKey="profit" fill="#0061FF" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="clients" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Clientes en Riesgo de Abandono</CardTitle>
              <CardDescription>Clientes que requieren atención inmediata</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {insights.clientChurnRisk.map((client) => (
                  <div key={client.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{client.name}</p>
                      <p className="text-sm text-gray-600">{client.reason}</p>
                    </div>
                    <Badge variant={getRiskColor(client.riskLevel) as any}>
                      {client.riskLevel === 'high' ? 'Alto' : 
                       client.riskLevel === 'medium' ? 'Medio' : 'Bajo'}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="opportunities" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Oportunidades de Crecimiento</CardTitle>
              <CardDescription>Áreas identificadas para expansión</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {insights.growthOpportunities.map((opportunity, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium">{opportunity.title}</h4>
                      <div className="flex gap-2">
                        <Badge variant={getEffortColor(opportunity.effort) as any}>
                          Esfuerzo: {opportunity.effort === 'low' ? 'Bajo' :
                                    opportunity.effort === 'medium' ? 'Medio' : 'Alto'}
                        </Badge>
                        <Badge variant="outline">
                          Impacto: {opportunity.impact === 'low' ? 'Bajo' :
                                   opportunity.impact === 'medium' ? 'Medio' : 'Alto'}
                        </Badge>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600">{opportunity.description}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="risks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Análisis de Riesgos</CardTitle>
              <CardDescription>Riesgos identificados y recomendaciones</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {insights.risks.map((risk, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-medium flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4" />
                          {risk.category}
                        </h4>
                        <p className="text-sm text-gray-600 mt-1">{risk.description}</p>
                      </div>
                      <Badge variant={getRiskColor(risk.severity) as any}>
                        {risk.severity === 'high' ? 'Crítico' :
                         risk.severity === 'medium' ? 'Moderado' : 'Bajo'}
                      </Badge>
                    </div>
                    <div className="mt-3 p-3 bg-blue-50 rounded">
                      <p className="text-sm font-medium text-blue-900">Recomendación:</p>
                      <p className="text-sm text-blue-800">{risk.recommendation}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default BusinessIntelligence
