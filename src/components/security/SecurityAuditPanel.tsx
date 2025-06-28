
import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Shield, AlertTriangle, CheckCircle, Eye, Database } from 'lucide-react'
import { supabase } from '@/integrations/supabase/client'
import { useApp } from '@/contexts/AppContext'
import { toast } from 'sonner'

interface SecurityIssue {
  name: string
  title: string
  level: 'WARN' | 'ERROR' | 'INFO'
  categories: string[]
  description: string
  remediation: string
  status: 'pending' | 'resolved' | 'investigating'
}

export const SecurityAuditPanel = () => {
  const { user } = useApp()
  const [issues, setIssues] = useState<SecurityIssue[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [auditLogs, setAuditLogs] = useState<any[]>([])

  const securityIssues: SecurityIssue[] = [
    {
      name: 'foreign_table_access',
      title: 'Tablas Foráneas Expuestas',
      level: 'WARN',
      categories: ['SECURITY'],
      description: 'Las tablas foráneas de HubSpot están accesibles sin restricciones RLS',
      remediation: 'Revocar permisos públicos y restringir acceso solo a usuarios autenticados',
      status: 'resolved'
    },
    {
      name: 'function_search_path',
      title: 'Funciones con Search Path Mutable',
      level: 'WARN',
      categories: ['SECURITY'],
      description: 'Funciones de sincronización Quantum sin search_path fijo',
      remediation: 'Agregar SET search_path = \'\' a todas las funciones SECURITY DEFINER',
      status: 'resolved'
    },
    {
      name: 'materialized_view_access',
      title: 'Vistas Materializadas en API',
      level: 'WARN',
      categories: ['SECURITY'],
      description: 'Vistas materializadas accesibles sin restricciones',
      remediation: 'Evaluar necesidad y restringir acceso apropiadamente',
      status: 'investigating'
    },
    {
      name: 'auth_otp_expiry',
      title: 'OTP con Expiración Larga',
      level: 'WARN',
      categories: ['SECURITY'],
      description: 'Tiempo de expiración OTP mayor a 1 hora',
      remediation: 'Configurar expiración OTP a menos de 1 hora en Auth settings',
      status: 'pending'
    },
    {
      name: 'leaked_password_protection',
      title: 'Protección Contraseñas Filtradas Deshabilitada',
      level: 'WARN',
      categories: ['SECURITY'],
      description: 'No se verifica contra bases de datos de contraseñas comprometidas',
      remediation: 'Habilitar verificación contra HaveIBeenPwned en Auth settings',
      status: 'pending'
    }
  ]

  useEffect(() => {
    setIssues(securityIssues)
    loadAuditLogs()
    setIsLoading(false)
  }, [])

  const loadAuditLogs = async () => {
    if (!user?.org_id) return

    try {
      const { data, error } = await supabase
        .from('audit_log')
        .select('*')
        .eq('org_id', user.org_id)
        .order('timestamp', { ascending: false })
        .limit(50)

      if (error) throw error
      setAuditLogs(data || [])
    } catch (error) {
      console.error('Error loading audit logs:', error)
    }
  }

  const updateIssueStatus = (issueName: string, newStatus: SecurityIssue['status']) => {
    setIssues(prev => prev.map(issue => 
      issue.name === issueName ? { ...issue, status: newStatus } : issue
    ))
    toast.success('Estado de seguridad actualizado')
  }

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'ERROR': return 'bg-red-100 text-red-800'
      case 'WARN': return 'bg-yellow-100 text-yellow-800'
      case 'INFO': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'resolved': return 'bg-green-100 text-green-800'
      case 'investigating': return 'bg-blue-100 text-blue-800'
      case 'pending': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'resolved': return <CheckCircle className="h-4 w-4" />
      case 'investigating': return <Eye className="h-4 w-4" />
      case 'pending': return <AlertTriangle className="h-4 w-4" />
      default: return <AlertTriangle className="h-4 w-4" />
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              <div className="space-y-2">
                <div className="h-3 bg-gray-200 rounded"></div>
                <div className="h-3 bg-gray-200 rounded w-5/6"></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const resolvedCount = issues.filter(i => i.status === 'resolved').length
  const pendingCount = issues.filter(i => i.status === 'pending').length
  const investigatingCount = issues.filter(i => i.status === 'investigating').length

  return (
    <div className="space-y-6">
      {/* Resumen de Seguridad */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-green-600" />
              <div>
                <div className="text-2xl font-bold text-green-600">{resolvedCount}</div>
                <div className="text-sm text-gray-600">Resueltos</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              <div>
                <div className="text-2xl font-bold text-orange-600">{pendingCount}</div>
                <div className="text-sm text-gray-600">Pendientes</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-blue-600" />
              <div>
                <div className="text-2xl font-bold text-blue-600">{investigatingCount}</div>
                <div className="text-sm text-gray-600">En Revisión</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Database className="h-5 w-5 text-purple-600" />
              <div>
                <div className="text-2xl font-bold text-purple-600">{auditLogs.length}</div>
                <div className="text-sm text-gray-600">Logs Auditoría</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Problemas de Seguridad */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Auditoría de Seguridad
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {issues.map((issue) => (
              <div key={issue.name} className="border rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-medium">{issue.title}</h3>
                      <Badge variant="outline" className={getLevelColor(issue.level)}>
                        {issue.level}
                      </Badge>
                      <Badge variant="outline" className={getStatusColor(issue.status)}>
                        <div className="flex items-center gap-1">
                          {getStatusIcon(issue.status)}
                          {issue.status === 'resolved' ? 'Resuelto' : 
                           issue.status === 'investigating' ? 'En Revisión' : 'Pendiente'}
                        </div>
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-2">{issue.description}</p>
                    
                    <div className="bg-gray-50 p-3 rounded text-sm">
                      <strong>Solución:</strong> {issue.remediation}
                    </div>
                  </div>
                  
                  <div className="flex gap-2 ml-4">
                    {issue.status === 'pending' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateIssueStatus(issue.name, 'investigating')}
                      >
                        Investigar
                      </Button>
                    )}
                    {issue.status === 'investigating' && (
                      <Button
                        size="sm"
                        onClick={() => updateIssueStatus(issue.name, 'resolved')}
                      >
                        Marcar Resuelto
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recomendaciones Pendientes */}
      {pendingCount > 0 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Acciones Recomendadas:</strong>
            <ul className="mt-2 space-y-1">
              <li>• Configurar OTP con expiración menor a 1 hora en Supabase Auth</li>
              <li>• Habilitar protección contra contraseñas filtradas</li>
              <li>• Revisar permisos de vistas materializadas</li>
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Log de Auditoría */}
      {auditLogs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Registro de Auditoría Reciente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {auditLogs.map((log) => (
                <div key={log.id} className="flex items-center justify-between p-2 bg-gray-50 rounded text-sm">
                  <div>
                    <span className="font-medium">{log.action}</span> en {log.table_name}
                  </div>
                  <div className="text-gray-500">
                    {new Date(log.timestamp).toLocaleString('es-ES')}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
