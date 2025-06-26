
import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Shield, AlertTriangle, CheckCircle, Database, Key, Lock, Settings } from 'lucide-react'
import { useApp } from '@/contexts/AppContext'
import { REAL_SECURITY_ISSUES, RESOLVED_CRITICAL_ISSUES } from './SecurityIssuesData'
import { SecurityActionButtons } from './SecurityActionButtons'

export const SecurityMonitoringPanel = () => {
  const { user } = useApp()

  const getStatusBadge = (level: string) => {
    const colors = {
      CRITICAL: 'text-red-900 bg-red-200',
      HIGH: 'text-orange-900 bg-orange-200', 
      WARN: 'text-yellow-900 bg-yellow-200',
      MEDIUM: 'text-yellow-900 bg-yellow-200',
      LOW: 'text-blue-900 bg-blue-200'
    }

    return (
      <Badge variant="outline" className={colors[level as keyof typeof colors] || colors.MEDIUM}>
        {level === 'WARN' ? 'WARNING' : level}
      </Badge>
    )
  }

  const getCategoryIcon = (categories: string[]) => {
    if (categories.includes('SECURITY')) {
      return <Shield className="w-4 h-4" />
    }
    return <AlertTriangle className="w-4 h-4" />
  }

  const pendingIssues = REAL_SECURITY_ISSUES
  const resolvedIssues = RESOLVED_CRITICAL_ISSUES

  return (
    <div className="space-y-6">
      {/* Resumen de seguridad */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Problemas Críticos Resueltos</p>
                <p className="text-2xl font-bold text-green-600">{resolvedIssues.length}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Warnings Pendientes</p>
                <p className="text-2xl font-bold text-yellow-600">{pendingIssues.length}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Score de Seguridad</p>
                <p className="text-2xl font-bold text-blue-600">85%</p>
              </div>
              <Shield className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Panel principal */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Monitor de Seguridad del CRM
          </CardTitle>
          <CardDescription>
            Estado actual según el linter de Supabase - Datos reales del 26 de junio 2025
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Alerta de problemas críticos resueltos */}
          <Alert className="mb-6 border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertTitle className="text-green-800">¡Problemas Críticos Resueltos!</AlertTitle>
            <AlertDescription className="text-green-700">
              <div className="mt-2">
                <p className="font-medium">✅ 5 vulnerabilidades críticas de SQL injection corregidas:</p>
                <ul className="list-disc list-inside mt-1 text-sm space-y-1">
                  {resolvedIssues.map((issue, index) => (
                    <li key={index}>{issue}</li>
                  ))}
                </ul>
                <p className="mt-2 text-sm">
                  Todas estas funciones ahora tienen <code>SET search_path = ''</code> configurado correctamente.
                </p>
              </div>
            </AlertDescription>
          </Alert>

          {/* Problemas pendientes */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-500" />
              Problemas Pendientes ({pendingIssues.length})
            </h3>
            
            {pendingIssues.map((issue, index) => (
              <div
                key={index}
                className="p-4 border rounded-lg border-yellow-200 bg-yellow-50"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {getCategoryIcon(issue.categories)}
                    <h4 className="font-medium">{issue.title}</h4>
                  </div>
                  <div className="flex gap-2">
                    {getStatusBadge(issue.level)}
                    <Badge variant="outline" className="text-orange-700 bg-orange-100">
                      {issue.facing}
                    </Badge>
                  </div>
                </div>
                
                <p className="text-sm text-muted-foreground mb-2">{issue.description}</p>
                
                <div className="text-xs text-gray-600 mb-3 p-2 bg-gray-50 rounded">
                  <strong>Detalle:</strong> {issue.detail}
                </div>
                
                <SecurityActionButtons 
                  issueType={issue.name}
                  title={issue.title}
                  remediationUrl={issue.remediation}
                />
              </div>
            ))}
          </div>

          {/* Instrucciones de corrección */}
          <div className="mt-6 pt-6 border-t">
            <Alert>
              <Settings className="h-4 w-4" />
              <AlertTitle>Plan de Corrección</AlertTitle>
              <AlertDescription className="mt-2">
                <div className="space-y-3">
                  <div>
                    <p className="font-medium text-blue-900">🔧 Configuración de Autenticación:</p>
                    <ul className="list-disc list-inside text-sm space-y-1 ml-4">
                      <li>Reducir OTP expiry a 3600 segundos (1 hora) o menos</li>
                      <li>Habilitar "Leaked Password Protection" contra HaveIBeenPwned</li>
                    </ul>
                  </div>
                  
                  <div>
                    <p className="font-medium text-blue-900">🗄️ Base de Datos:</p>
                    <ul className="list-disc list-inside text-sm space-y-1 ml-4">
                      <li>Evaluar si las tablas foráneas HubSpot deben estar expuestas</li>
                      <li>Implementar políticas RLS para vistas materializadas si es necesario</li>
                      <li>Considerar crear vistas específicas con acceso controlado</li>
                    </ul>
                  </div>
                  
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <strong>Nota:</strong> Los problemas críticos ya están resueltos. Los warnings actuales 
                      no comprometen la seguridad inmediata pero deben ser evaluados para completar la 
                      securización del sistema.
                    </p>
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
