
import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { Shield, AlertTriangle, CheckCircle, Clock, FileText } from 'lucide-react'
import { useAdvancedAI } from '@/hooks/useAdvancedAI'

interface ComplianceResult {
  overallScore: number
  categories: Array<{
    name: string
    score: number
    status: 'compliant' | 'warning' | 'critical'
    issues: number
  }>
  criticalIssues: Array<{
    severity: 'high' | 'medium' | 'low'
    category: string
    description: string
    recommendation: string
    deadline?: string
  }>
  upcomingDeadlines: Array<{
    type: string
    description: string
    date: string
    daysLeft: number
    priority: 'urgent' | 'important' | 'normal'
  }>
  recommendations: string[]
}

export const ComplianceMonitor = () => {
  const [complianceResult, setComplianceResult] = useState<ComplianceResult | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const { isAnalyzing, checkCompliance } = useAdvancedAI()

  const handleCheckCompliance = async () => {
    const result = await checkCompliance()
    if (result) {
      setComplianceResult(result as ComplianceResult)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'compliant': return 'bg-green-100 text-green-800'
      case 'warning': return 'bg-yellow-100 text-yellow-800'
      case 'critical': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'text-red-600'
      case 'medium': return 'text-yellow-600'
      case 'low': return 'text-green-600'
      default: return 'text-gray-600'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800'
      case 'important': return 'bg-yellow-100 text-yellow-800'
      case 'normal': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Monitor de Compliance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center">
            <Button onClick={handleCheckCompliance} disabled={isAnalyzing} size="lg">
              {isAnalyzing ? 'Analizando...' : 'Realizar Auditoría Completa'}
            </Button>
            <p className="text-sm text-gray-500 mt-2">
              Revisará todas las áreas de compliance y normativas
            </p>
          </div>
        </CardContent>
      </Card>

      {complianceResult && (
        <div className="space-y-4">
          {/* Score general */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Puntuación General de Compliance
                <Badge variant={complianceResult.overallScore >= 80 ? 'default' : 'destructive'}>
                  {complianceResult.overallScore}/100
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Progress value={complianceResult.overallScore} className="w-full h-3" />
              <p className="text-sm text-gray-600 mt-2">
                {complianceResult.overallScore >= 90 ? 'Excelente compliance' :
                 complianceResult.overallScore >= 70 ? 'Compliance aceptable' :
                 'Requiere atención inmediata'}
              </p>
            </CardContent>
          </Card>

          {/* Categorías de compliance */}
          <Card>
            <CardHeader>
              <CardTitle>Categorías de Compliance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {complianceResult.categories.map((category) => (
                  <div
                    key={category.name}
                    className="p-4 border rounded-lg cursor-pointer hover:bg-gray-50"
                    onClick={() => setSelectedCategory(category.name)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{category.name}</h4>
                      <Badge className={getStatusColor(category.status)}>
                        {category.status}
                      </Badge>
                    </div>
                    <Progress value={category.score} className="w-full h-2 mb-2" />
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>{category.score}%</span>
                      <span>{category.issues} issue(s)</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Issues críticos */}
          {complianceResult.criticalIssues.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                  Issues Críticos
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {complianceResult.criticalIssues.map((issue, index) => (
                  <Alert key={index} className="border-l-4 border-l-red-500">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className={getSeverityColor(issue.severity)}>
                            {issue.severity.toUpperCase()}
                          </Badge>
                          <span className="text-sm font-medium">{issue.category}</span>
                        </div>
                        <AlertDescription className="mb-2">
                          {issue.description}
                        </AlertDescription>
                        <p className="text-sm text-blue-600 font-medium">
                          Recomendación: {issue.recommendation}
                        </p>
                        {issue.deadline && (
                          <p className="text-sm text-red-600 mt-1">
                            Plazo: {issue.deadline}
                          </p>
                        )}
                      </div>
                    </div>
                  </Alert>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Próximos vencimientos */}
          {complianceResult.upcomingDeadlines.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Próximos Vencimientos
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {complianceResult.upcomingDeadlines.map((deadline, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileText className="h-4 w-4 text-gray-500" />
                      <div>
                        <p className="font-medium">{deadline.description}</p>
                        <p className="text-sm text-gray-600">{deadline.type}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge className={getPriorityColor(deadline.priority)}>
                        {deadline.daysLeft} días
                      </Badge>
                      <p className="text-xs text-gray-500 mt-1">{deadline.date}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Recomendaciones */}
          {complianceResult.recommendations.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  Recomendaciones de Mejora
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {complianceResult.recommendations.map((recommendation, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-green-600 mt-1">•</span>
                      <span className="text-sm">{recommendation}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}
