
import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Shield, AlertTriangle, CheckCircle, ExternalLink, Database, Key, Lock } from 'lucide-react'
import { useApp } from '@/contexts/AppContext'
import { toast } from 'sonner'

interface SecurityIssue {
  id: string
  title: string
  level: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'
  category: string
  status: 'RESOLVED' | 'PENDING' | 'IN_PROGRESS'
  description: string
  remediation?: string
  docsUrl?: string
}

export const SecurityMonitoringPanel = () => {
  const { user } = useApp()
  const [issues, setIssues] = useState<SecurityIssue[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simular carga de problemas de seguridad desde el linting
    const securityIssues: SecurityIssue[] = [
      {
        id: 'function_search_path_1',
        title: 'Function Search Path - identify_churn_risk_clients',
        level: 'CRITICAL',
        category: 'SQL_SECURITY',
        status: 'RESOLVED',
        description: 'Función corregida con search_path seguro',
        remediation: 'Agregado SET search_path = \'\' para prevenir inyección SQL'
      },
      {
        id: 'function_search_path_2',
        title: 'Function Search Path - get_historical_revenue',
        level: 'CRITICAL',
        category: 'SQL_SECURITY',
        status: 'RESOLVED',
        description: 'Función corregida con search_path seguro',
        remediation: 'Agregado SET search_path = \'\' para prevenir inyección SQL'
      },
      {
        id: 'function_search_path_3',
        title: 'Function Search Path - update_analytics_sessions_updated_at',
        level: 'CRITICAL',
        category: 'SQL_SECURITY',
        status: 'RESOLVED',
        description: 'Función trigger corregida con search_path seguro',
        remediation: 'Agregado SET search_path = \'\' para prevenir inyección SQL'
      },
      {
        id: 'function_search_path_4',
        title: 'Function Search Path - update_updated_at_column',
        level: 'CRITICAL',
        category: 'SQL_SECURITY',
        status: 'RESOLVED',
        description: 'Función trigger corregida con search_path seguro',
        remediation: 'Agregado SET search_path = \'\' para prevenir inyección SQL'
      },
      {
        id: 'function_search_path_5',
        title: 'Function Search Path - calculate_productivity_metrics',
        level: 'CRITICAL',
        category: 'SQL_SECURITY',
        status: 'RESOLVED',
        description: 'Función corregida con search_path seguro',
        remediation: 'Agregado SET search_path = \'\' para prevenir inyección SQL'
      },
      {
        id: 'materialized_view_1',
        title: 'Vista Materializada - copia_empresas_hubspot',
        level: 'MEDIUM',
        category: 'DATA_ACCESS',
        status: 'PENDING',
        description: 'Vista materializada accesible por roles anon/authenticated',
        remediation: 'Implementar políticas RLS específicas o restringir acceso',
        docsUrl: 'https://supabase.com/docs/guides/database/database-linter?lint=0016_materialized_view_in_api'
      },
      {
        id: 'materialized_view_2',
        title: 'Vista Materializada - copia_contactos_hubspot',
        level: 'MEDIUM',
        category: 'DATA_ACCESS',
        status: 'PENDING',
        description: 'Vista materializada accesible por roles anon/authenticated',
        remediation: 'Implementar políticas RLS específicas o restringir acceso',
        docsUrl: 'https://supabase.com/docs/guides/database/database-linter?lint=0016_materialized_view_in_api'
      },
      {
        id: 'foreign_table_hubspot',
        title: 'Tablas Foráneas HubSpot en API',
        level: 'HIGH',
        category: 'DATA_EXPOSURE',
        status: 'PENDING',
        description: '5 tablas foráneas de HubSpot expuestas en la API sin RLS',
        remediation: 'Evaluar si deben estar en la API o crear vistas seguras',
        docsUrl: 'https://supabase.com/docs/guides/database/database-linter?lint=0017_foreign_table_in_api'
      },
      {
        id: 'auth_otp_expiry',
        title: 'OTP Expiry Too Long',
        level: 'MEDIUM',
        category: 'AUTH_CONFIG',
        status: 'PENDING',
        description: 'Expiración de OTP configurada a más de una hora',
        remediation: 'Configurar OTP expiry a 3600 segundos (1 hora) o menos',
        docsUrl: 'https://supabase.com/docs/guides/platform/going-into-prod#security'
      },
      {
        id: 'auth_leaked_password',
        title: 'Leaked Password Protection Disabled',
        level: 'MEDIUM',
        category: 'AUTH_CONFIG',
        status: 'PENDING',
        description: 'Protección contra contraseñas comprometidas deshabilitada',
        remediation: 'Habilitar la verificación contra HaveIBeenPwned.org',
        docsUrl: 'https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection'
      }
    ]

    setIssues(securityIssues)
    setLoading(false)
  }, [])

  const getStatusBadge = (status: SecurityIssue['status']) => {
    const variants = {
      RESOLVED: 'default',
      PENDING: 'destructive',
      IN_PROGRESS: 'secondary'
    } as const

    const colors = {
      RESOLVED: 'text-green-700 bg-green-100',
      PENDING: 'text-red-700 bg-red-100',
      IN_PROGRESS: 'text-yellow-700 bg-yellow-100'
    }

    return (
      <Badge variant={variants[status]} className={colors[status]}>
        {status === 'RESOLVED' && <CheckCircle className="w-3 h-3 mr-1" />}
        {status === 'PENDING' && <AlertTriangle className="w-3 h-3 mr-1" />}
        {status}
      </Badge>
    )
  }

  const getLevelBadge = (level: SecurityIssue['level']) => {
    const colors = {
      CRITICAL: 'text-red-900 bg-red-200',
      HIGH: 'text-orange-900 bg-orange-200',
      MEDIUM: 'text-yellow-900 bg-yellow-200',
      LOW: 'text-blue-900 bg-blue-200'
    }

    return (
      <Badge variant="outline" className={colors[level]}>
        {level}
      </Badge>
    )
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'SQL_SECURITY':
        return <Database className="w-4 h-4" />
      case 'AUTH_CONFIG':
        return <Key className="w-4 h-4" />
      case 'DATA_ACCESS':
      case 'DATA_EXPOSURE':
        return <Lock className="w-4 h-4" />
      default:
        return <Shield className="w-4 h-4" />
    }
  }

  const resolvedCount = issues.filter(issue => issue.status === 'RESOLVED').length
  const pendingCount = issues.filter(issue => issue.status === 'PENDING').length
  const criticalCount = issues.filter(issue => issue.level === 'CRITICAL' && issue.status !== 'RESOLVED').length

  const handleOpenSupabaseDashboard = () => {
    window.open('https://supabase.com/dashboard/project/jzbbbwfnzpwxmuhpbdya/auth', '_blank')
    toast.info('Abriendo configuración de autenticación de Supabase')
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Monitor de Seguridad
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Resumen de seguridad */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Problemas Resueltos</p>
                <p className="text-2xl font-bold text-green-600">{resolvedCount}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Problemas Pendientes</p>
                <p className="text-2xl font-bold text-orange-600">{pendingCount}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Críticos Restantes</p>
                <p className="text-2xl font-bold text-red-600">{criticalCount}</p>
              </div>
              <Shield className="w-8 h-8 text-red-500" />
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
            Estado de las correcciones de seguridad implementadas según el linting de Supabase
          </CardDescription>
        </CardHeader>
        <CardContent>
          {criticalCount === 0 && (
            <Alert className="mb-6 border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertTitle className="text-green-800">¡Problemas Críticos Resueltos!</AlertTitle>
              <AlertDescription className="text-green-700">
                Todas las vulnerabilidades críticas de SQL injection han sido corregidas. 
                Las funciones ahora tienen search_path seguro configurado.
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-4">
            {issues.map((issue) => (
              <div
                key={issue.id}
                className={`p-4 border rounded-lg ${
                  issue.status === 'RESOLVED' 
                    ? 'border-green-200 bg-green-50' 
                    : issue.level === 'CRITICAL' 
                    ? 'border-red-200 bg-red-50'
                    : 'border-gray-200'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {getCategoryIcon(issue.category)}
                    <h3 className="font-medium">{issue.title}</h3>
                  </div>
                  <div className="flex gap-2">
                    {getLevelBadge(issue.level)}
                    {getStatusBadge(issue.status)}
                  </div>
                </div>
                
                <p className="text-sm text-muted-foreground mb-2">{issue.description}</p>
                
                {issue.remediation && (
                  <div className="text-sm mb-2">
                    <span className="font-medium text-blue-600">Solución: </span>
                    <span>{issue.remediation}</span>
                  </div>
                )}
                
                {issue.docsUrl && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(issue.docsUrl, '_blank')}
                  >
                    <ExternalLink className="w-3 h-3 mr-1" />
                    Ver documentación
                  </Button>
                )}
              </div>
            ))}
          </div>

          {pendingCount > 0 && (
            <div className="mt-6 pt-6 border-t">
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Acciones Requeridas</AlertTitle>
                <AlertDescription className="mt-2">
                  <p className="mb-3">
                    Quedan {pendingCount} problemas por resolver. Para completar la segurización:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>Configura OTP expiry a 1 hora o menos en Supabase Dashboard</li>
                    <li>Habilita la protección contra contraseñas comprometidas</li>
                    <li>Evalúa la exposición de tablas HubSpot en la API</li>
                    <li>Implementa políticas RLS para las vistas materializadas</li>
                  </ul>
                  <Button 
                    className="mt-3" 
                    onClick={handleOpenSupabaseDashboard}
                    variant="outline"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Abrir Dashboard de Supabase
                  </Button>
                </AlertDescription>
              </Alert>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
