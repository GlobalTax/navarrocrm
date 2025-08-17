import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useSecurityAudit } from '@/hooks/useSecurityAudit'
import { Shield, AlertTriangle, CheckCircle, Users, Activity, Eye } from 'lucide-react'
import { useState } from 'react'
import { useApp } from '@/contexts/AppContext'
import { supabase } from '@/integrations/supabase/client'
import { SecurityMetricsChart } from './SecurityMetricsChart'
import { RoleChangeAuditList } from './RoleChangeAuditList'
import { SecurityEventsList } from './SecurityEventsList'

export const SecurityAuditPanel = () => {
  const { metrics, isLoading, error, logSecurityEvent, refetch } = useSecurityAudit()
  const { user } = useApp()
  const [isRunningSecurityScan, setIsRunningSecurityScan] = useState(false)

  const runSecurityScan = async () => {
    if (!user?.org_id) return
    
    setIsRunningSecurityScan(true)
    try {
      // Log security event using analytics
      const { error } = await supabase
        .from('analytics_events')
        .insert({
          org_id: user.org_id,
          user_id: user.id,
          session_id: 'manual-scan',
          event_type: 'security_scan',
          event_name: 'Manual Security Scan',
          page_url: '/security-audit',
          event_data: {
            initiated_by: user.id,
            scan_type: 'manual'
          }
        })

      if (error) throw error
      
      // Refresh metrics after logging the event
      setTimeout(() => {
        refetch()
        setIsRunningSecurityScan(false)
      }, 1000)
    } catch (err) {
      console.error('Error running security scan:', err)
      setIsRunningSecurityScan(false)
    }
  }

  const getStatusColor = (status: 'good' | 'warning' | 'critical') => {
    switch (status) {
      case 'good': return 'text-success'
      case 'warning': return 'text-warning'
      case 'critical': return 'text-destructive'
    }
  }

  const getStatusIcon = (status: 'good' | 'warning' | 'critical') => {
    switch (status) {
      case 'good': return <CheckCircle className="h-4 w-4 text-success" />
      case 'warning': return <AlertTriangle className="h-4 w-4 text-warning" />
      case 'critical': return <AlertTriangle className="h-4 w-4 text-destructive" />
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Auditoría de Seguridad
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
            <div className="h-4 bg-muted rounded w-2/3"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-6">
      {/* Security Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Estado de Seguridad del Sistema
              </CardTitle>
              <CardDescription>
                Monitoreo en tiempo real de métricas de seguridad y eventos de acceso
              </CardDescription>
            </div>
            <Button 
              onClick={runSecurityScan}
              disabled={isRunningSecurityScan}
              variant="outline"
              size="sm"
            >
              <Activity className="h-4 w-4 mr-2" />
              {isRunningSecurityScan ? 'Escaneando...' : 'Escanear Ahora'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {metrics.map((metric, index) => (
              <Card key={index} className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">
                      {metric.name}
                    </div>
                    <div className={`text-2xl font-bold ${getStatusColor(metric.status)}`}>
                      {metric.value}
                    </div>
                  </div>
                  {getStatusIcon(metric.status)}
                </div>
                <div className="text-xs text-muted-foreground mt-2">
                  {metric.description}
                </div>
                <Badge 
                  variant={metric.status === 'good' ? 'default' : 
                          metric.status === 'warning' ? 'secondary' : 'destructive'}
                  className="mt-2"
                >
                  {metric.status === 'good' ? 'Normal' : 
                   metric.status === 'warning' ? 'Atención' : 'Crítico'}
                </Badge>
              </Card>
            ))}
          </div>

          <SecurityMetricsChart />
        </CardContent>
      </Card>

      {/* Detailed Security Audit Tabs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Auditoría Detallada
          </CardTitle>
          <CardDescription>
            Registro completo de eventos de seguridad y cambios de permisos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="events" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="events">Eventos de Seguridad</TabsTrigger>
              <TabsTrigger value="roles">Cambios de Roles</TabsTrigger>
              <TabsTrigger value="permissions">Permisos</TabsTrigger>
            </TabsList>
            
            <TabsContent value="events" className="mt-6">
              <SecurityEventsList />
            </TabsContent>
            
            <TabsContent value="roles" className="mt-6">
              <RoleChangeAuditList />
            </TabsContent>
            
            <TabsContent value="permissions" className="mt-6">
              <div className="text-center py-8 text-muted-foreground">
                <Users className="h-8 w-8 mx-auto mb-2" />
                <p>Auditoría de permisos disponible próximamente</p>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}