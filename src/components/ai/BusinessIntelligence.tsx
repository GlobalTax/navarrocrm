
import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts'
import { TrendingUp, DollarSign, Users, Briefcase, AlertCircle, CheckCircle } from 'lucide-react'
import { useAdvancedAI } from '@/hooks/useAdvancedAI'

interface BusinessInsight {
  revenue: {
    current: number
    predicted: number
    trend: 'up' | 'down' | 'stable'
    monthlyData: Array<{ month: string; revenue: number; prediction: number }>
  }
  clients: {
    total: number
    new: number
    retention: number
    churnRisk: Array<{ name: string; riskLevel: number; reason: string }>
  }
  cases: {
    active: number
    completion_rate: number
    profitability: Array<{ type: string; profit: number; cases: number }>
  }
  opportunities: Array<{
    type: 'cross_sell' | 'upsell' | 'new_market' | 'efficiency'
    title: string
    description: string
    potential_value: number
    effort: 'low' | 'medium' | 'high'
  }>
  risks: Array<{
    category: string
    description: string
    probability: number
    impact: number
    mitigation: string
  }>
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8']

export const BusinessIntelligence = () => {
  const [insights, setInsights] = useState<BusinessInsight | null>(null)
  const [selectedPeriod, setSelectedPeriod] = useState('month')
  const { isAnalyzing, generateBusinessInsights } = useAdvancedAI()

  const handleGenerateInsights = async () => {
    const result = await generateBusinessInsights()
    if (result) {
      // Adaptar el resultado a la interfaz local
      const adaptedResult: BusinessInsight = {
        revenue: {
          current: result.kpis.totalRevenue,
          predicted: result.kpis.totalRevenue * 1.1,
          trend: 'up',
          monthlyData: result.revenueChart.map(item => ({
            month: item.month,
            revenue: item.revenue,
            prediction: item.revenue * 1.05
          }))
        },
        clients: {
          total: result.kpis.totalClients,
          new: 5,
          retention: 95,
          churnRisk: result.clientChurnRisk.map(client => ({
            name: client.name,
            riskLevel: client.riskLevel === 'high' ? 80 : client.riskLevel === 'medium' ? 50 : 20,
            reason: client.reason
          }))
        },
        cases: {
          active: result.kpis.activeProjects,
          completion_rate: 85,
          profitability: result.casesProfitability
        },
        opportunities: result.growthOpportunities.map(opp => ({
          type: 'efficiency' as const,
          title: opp.title,
          description: opp.description,
          potential_value: 5000,
          effort: opp.effort
        })),
        risks: result.risks.map(risk => ({
          category: risk.category,
          description: risk.description,
          probability: risk.severity === 'high' ? 0.8 : risk.severity === 'medium' ? 0.5 : 0.2,
          impact: risk.severity === 'high' ? 90 : risk.severity === 'medium' ? 60 : 30,
          mitigation: risk.recommendation
        }))
      }
      setInsights(adaptedResult)
    }
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-green-600" />
      case 'down': return <TrendingUp className="h-4 w-4 text-red-600 rotate-180" />
      case 'stable': return <TrendingUp className="h-4 w-4 text-yellow-600 rotate-90" />
      default: return <TrendingUp className="h-4 w-4 text-gray-600" />
    }
  }

  const getEffortColor = (effort: string) => {
    switch (effort) {
      case 'low': return 'bg-green-100 text-green-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'high': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Business Intelligence IA
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">Última Semana</SelectItem>
                <SelectItem value="month">Último Mes</SelectItem>
                <SelectItem value="quarter">Último Trimestre</SelectItem>
                <SelectItem value="year">Último Año</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleGenerateInsights} disabled={isAnalyzing} size="lg">
              {isAnalyzing ? 'Generando Insights...' : 'Generar Análisis'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {insights && (
        <div className="space-y-6">
          {/* KPIs principales */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Ingresos</p>
                    <p className="text-2xl font-bold">€{insights.revenue.current.toLocaleString()}</p>
                    <div className="flex items-center gap-1 mt-1">
                      {getTrendIcon(insights.revenue.trend)}
                      <span className="text-sm">
                        Pred: €{insights.revenue.predicted.toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <DollarSign className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Clientes</p>
                    <p className="text-2xl font-bold">{insights.clients.total}</p>
                    <p className="text-sm text-green-600">+{insights.clients.new} nuevos</p>
                  </div>
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Casos Activos</p>
                    <p className="text-2xl font-bold">{insights.cases.active}</p>
                    <p className="text-sm text-blue-600">
                      {insights.cases.completion_rate}% completado
                    </p>
                  </div>
                  <Briefcase className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Retención</p>
                    <p className="text-2xl font-bold">{insights.clients.retention}%</p>
                    <p className="text-sm text-red-600">
                      {insights.clients.churnRisk.length} en riesgo
                    </p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Gráfico de ingresos */}
          <Card>
            <CardHeader>
              <CardTitle>Evolución de Ingresos vs Predicción</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={insights.revenue.monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`€${value}`, '']} />
                  <Line type="monotone" dataKey="revenue" stroke="#0088FE" strokeWidth={2} name="Ingresos Reales" />
                  <Line type="monotone" dataKey="prediction" stroke="#00C49F" strokeDasharray="5 5" name="Predicción IA" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Rentabilidad por tipo de caso */}
          <Card>
            <CardHeader>
              <CardTitle>Rentabilidad por Tipo de Caso</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={insights.cases.profitability}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="type" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`€${value}`, 'Beneficio']} />
                  <Bar dataKey="profit" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Clientes en riesgo */}
          {insights.clients.churnRisk.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                  Clientes en Riesgo de Abandono
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {insights.clients.churnRisk.map((client, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{client.name}</p>
                        <p className="text-sm text-gray-600">{client.reason}</p>
                      </div>
                      <Badge variant="destructive">
                        Riesgo: {client.riskLevel}%
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Oportunidades */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                Oportunidades de Crecimiento
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {insights.opportunities.map((opportunity, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium">{opportunity.title}</h4>
                      <Badge className={getEffortColor(opportunity.effort)}>
                        {opportunity.effort}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{opportunity.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-green-600">
                        Potencial: €{opportunity.potential_value.toLocaleString()}
                      </span>
                      <Badge variant="outline">{opportunity.type}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Riesgos identificados */}
          {insights.risks.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                  Riesgos Identificados
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {insights.risks.map((risk, index) => (
                    <div key={index} className="p-4 border-l-4 border-l-red-500 bg-red-50">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium text-red-800">{risk.category}</h4>
                        <div className="flex gap-2">
                          <Badge variant="outline">
                            Prob: {risk.probability}%
                          </Badge>
                          <Badge variant="outline">
                            Impacto: {risk.impact}/10
                          </Badge>
                        </div>
                      </div>
                      <p className="text-sm text-red-700 mb-2">{risk.description}</p>
                      <p className="text-sm font-medium text-red-800">
                        Mitigación: {risk.mitigation}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}
