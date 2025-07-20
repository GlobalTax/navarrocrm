
import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  FileText,
  Calendar,
  Target
} from 'lucide-react'
import { useAdvancedAI } from '@/hooks/useAdvancedAI'
import type { ComplianceResult } from '@/types/interfaces'

interface ComplianceState {
  result: ComplianceResult | null
  isLoading: boolean
  error: string | null
  lastCheck: Date | null
}

const ComplianceMonitor = () => {
  const { checkCompliance, isAnalyzing } = useAdvancedAI()
  const [complianceState, setComplianceState] = useState<ComplianceState>({
    result: null,
    isLoading: false,
    error: null,
    lastCheck: null
  })

  const runComplianceCheck = async (): Promise<void> => {
    setComplianceState(prev => ({ ...prev, isLoading: true, error: null }))
    
    try {
      const result = await checkCompliance()
      setComplianceState({
        result,
        isLoading: false,
        error: null,
        lastCheck: new Date()
      })
    } catch (error) {
      setComplianceState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Error en verificación de compliance',
        isLoading: false
      }))
    }
  }

  useEffect(() => {
    runComplianceCheck()
  }, [])

  const getStatusIcon = (status: 'compliant' | 'warning' | 'critical') => {
    const iconMap = {
      compliant: <CheckCircle className="h-4 w-4 text-green-600" />,
      warning: <AlertTriangle className="h-4 w-4 text-yellow-600" />,
      critical: <AlertTriangle className="h-4 w-4 text-red-600" />
    }
    return iconMap[status]
  }

  const getStatusColor = (status: 'compliant' | 'warning' | 'critical'): string => {
    const colorMap = {
      compliant: 'default',
      warning: 'secondary',
      critical: 'destructive'
    }
    return colorMap[status]
  }

  const getSeverityColor = (severity: 'high' | 'medium' | 'low'): string => {
    const colorMap = {
      high: 'destructive',
      medium: 'secondary',
      low: 'default'
    }
    return colorMap[severity]
  }

  const getPriorityColor = (priority: 'urgent' | 'important' | 'normal'): string => {
    const colorMap = {
      urgent: 'destructive',
      important: 'secondary',
      normal: 'default'
    }
    return colorMap[priority]
  }

  if (complianceState.isLoading || isAnalyzing) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Shield className="h-6 w-6" />
            Monitor de Compliance
          </h2>
          <Progress value={60} className="w-32" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (complianceState.error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            Error en Monitor de Compliance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-4">{complianceState.error}</p>
          <Button onClick={runComplianceCheck}>
            Reintentar Verificación
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (!complianceState.result) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Monitor de Compliance
          </CardTitle>
          <CardDescription>Verifica el cumplimiento normativo de tu organización</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={runComplianceCheck}>
            Ejecutar Verificación
          </Button>
        </CardContent>
      </Card>
    )
  }

  const { result } = complianceState

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Shield className="h-6 w-6" />
            Monitor de Compliance
          </h2>
          <p className="text-gray-600">
            Última verificación: {complianceState.lastCheck?.toLocaleString('es-ES')}
          </p>
        </div>
        <Button onClick={runComplianceCheck} disabled={complianceState.isLoading}>
          Actualizar Compliance
        </Button>
      </div>

      {/* Overall Score */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Puntuación General de Compliance</span>
            <Badge variant={result.overallScore >= 80 ? 'default' : result.overallScore >= 60 ? 'secondary' : 'destructive'}>
              {result.overallScore}%
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Progress value={result.overallScore} className="mb-4" />
          <p className="text-sm text-gray-600">
            {result.overallScore >= 80 
              ? 'Excelente nivel de compliance. Continúa manteniendo los estándares.'
              : result.overallScore >= 60
              ? 'Nivel de compliance aceptable. Se recomienda mejorar en algunas áreas.'
              : 'Nivel de compliance bajo. Se requiere atención inmediata.'
            }
          </p>
        </CardContent>
      </Card>

      <Tabs defaultValue="categories" className="space-y-4">
        <TabsList>
          <TabsTrigger value="categories">Categorías</TabsTrigger>
          <TabsTrigger value="issues">Problemas Críticos</TabsTrigger>
          <TabsTrigger value="deadlines">Próximos Vencimientos</TabsTrigger>
          <TabsTrigger value="recommendations">Recomendaciones</TabsTrigger>
        </TabsList>

        <TabsContent value="categories" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {result.categories.map((category, index) => (
              <Card key={index}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      {getStatusIcon(category.status)}
                      {category.name}
                    </span>
                    <Badge variant={getStatusColor(category.status) as any}>
                      {category.score}%
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Progress value={category.score} className="mb-2" />
                  <p className="text-sm text-gray-600">
                    {category.issues > 0 
                      ? `${category.issues} problema${category.issues > 1 ? 's' : ''} detectado${category.issues > 1 ? 's' : ''}`
                      : 'Sin problemas detectados'
                    }
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="issues" className="space-y-4">
          <div className="space-y-4">
            {result.criticalIssues.map((issue, index) => (
              <Alert key={index} className="border-l-4 border-l-red-500">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant={getSeverityColor(issue.severity) as any}>
                          {issue.severity === 'high' ? 'Alta' : 
                           issue.severity === 'medium' ? 'Media' : 'Baja'}
                        </Badge>
                        <span className="text-sm font-medium">{issue.category}</span>
                      </div>
                      <p className="text-sm mb-2">{issue.description}</p>
                      <div className="bg-blue-50 p-3 rounded text-sm">
                        <p className="font-medium text-blue-900">Recomendación:</p>
                        <p className="text-blue-800">{issue.recommendation}</p>
                      </div>
                      {issue.deadline && (
                        <div className="mt-2 flex items-center gap-2 text-sm text-orange-600">
                          <Calendar className="h-4 w-4" />
                          <span>Fecha límite: {new Date(issue.deadline).toLocaleDateString('es-ES')}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </AlertDescription>
              </Alert>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="deadlines" className="space-y-4">
          <div className="space-y-4">
            {result.upcomingDeadlines.map((deadline, index) => (
              <Card key={index}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className="h-4 w-4" />
                        <span className="font-medium">{deadline.type}</span>
                        <Badge variant={getPriorityColor(deadline.priority) as any}>
                          {deadline.priority === 'urgent' ? 'Urgente' :
                           deadline.priority === 'important' ? 'Importante' : 'Normal'}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{deadline.description}</p>
                      <div className="flex items-center gap-4 text-sm">
                        <span>Fecha: {new Date(deadline.date).toLocaleDateString('es-ES')}</span>
                        <span className={`font-medium ${
                          deadline.daysLeft <= 7 ? 'text-red-600' :
                          deadline.daysLeft <= 30 ? 'text-orange-600' : 'text-green-600'
                        }`}>
                          {deadline.daysLeft} días restantes
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-4">
          <div className="space-y-4">
            {result.recommendations.map((recommendation, index) => (
              <Card key={index}>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <Target className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <p className="text-sm">{recommendation}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default ComplianceMonitor
