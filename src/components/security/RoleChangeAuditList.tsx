import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useApp } from '@/contexts/AppContext'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { AlertCircle, User, Clock } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'

interface RoleChangeAudit {
  id: string
  target_user_id: string
  changed_by: string
  old_role: string
  new_role: string
  reason: string
  created_at: string
  target_user?: {
    first_name?: string
    last_name?: string
    email: string
  }
  changed_by_user?: {
    first_name?: string
    last_name?: string
    email: string
  }
}

export const RoleChangeAuditList = () => {
  const { user } = useApp()
  const [auditLogs, setAuditLogs] = useState<RoleChangeAudit[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchAuditLogs()
  }, [user?.org_id])

  const fetchAuditLogs = async () => {
    if (!user?.org_id) return

    try {
      const { data, error } = await supabase
        .from('role_change_audit')
        .select(`
          id,
          target_user_id,
          changed_by,
          old_role,
          new_role,
          reason,
          created_at
        `)
        .eq('org_id', user.org_id)
        .order('created_at', { ascending: false })
        .limit(50)

      if (error) throw error

      // Fetch user details separately
      const logs = data || []
      const userIds = [...new Set([
        ...logs.map(log => log.target_user_id),
        ...logs.map(log => log.changed_by)
      ])]

      let usersData: any[] = []
      if (userIds.length > 0) {
        const { data: users } = await supabase
          .from('users')
          .select('id, first_name, last_name, email')
          .in('id', userIds)
        usersData = users || []
      }

      // Merge user data with audit logs
      const enrichedLogs = logs.map(log => ({
        ...log,
        target_user: usersData.find(u => u.id === log.target_user_id),
        changed_by_user: usersData.find(u => u.id === log.changed_by)
      }))

      setAuditLogs(enrichedLogs)
    } catch (error) {
      console.error('Error fetching role change audit:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getRoleDisplayName = (role: string) => {
    const roleNames = {
      'partner': 'Socio',
      'area_manager': 'Manager de Área',
      'senior': 'Senior',
      'junior': 'Junior',
      'finance': 'Finanzas',
      'client': 'Cliente'
    }
    return roleNames[role as keyof typeof roleNames] || role
  }

  const getRoleBadgeVariant = (role: string) => {
    const variants = {
      'partner': 'default',
      'area_manager': 'secondary',
      'senior': 'outline',
      'junior': 'outline',
      'finance': 'outline',
      'client': 'outline'
    }
    return variants[role as keyof typeof variants] || 'outline'
  }

  const getUserDisplayName = (user: any) => {
    if (user?.first_name || user?.last_name) {
      return `${user.first_name || ''} ${user.last_name || ''}`.trim()
    }
    return user?.email || 'Usuario desconocido'
  }

  const getUserInitials = (user: any) => {
    if (user?.first_name || user?.last_name) {
      return `${user.first_name?.[0] || ''}${user.last_name?.[0] || ''}`.toUpperCase()
    }
    return user?.email?.[0]?.toUpperCase() || 'U'
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="p-4">
            <div className="animate-pulse space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-muted rounded-full" />
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    )
  }

  if (auditLogs.length === 0) {
    return (
      <Card className="p-8 text-center">
        <User className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-2">No hay cambios de roles recientes</h3>
        <p className="text-muted-foreground">
          Los cambios de roles y permisos aparecerán aquí cuando se realicen.
        </p>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {auditLogs.map((log) => (
        <Card key={log.id} className="p-4">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <div className="flex space-x-2">
                <Avatar>
                  <AvatarFallback className="bg-muted">
                    {getUserInitials(log.target_user)}
                  </AvatarFallback>
                </Avatar>
                <AlertCircle className="h-4 w-4 text-muted-foreground mt-3" />
                <Avatar>
                  <AvatarFallback className="bg-primary/10">
                    {getUserInitials(log.changed_by_user)}
                  </AvatarFallback>
                </Avatar>
              </div>
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium">
                  Cambio de rol para {getUserDisplayName(log.target_user)}
                </h4>
                <div className="flex items-center text-xs text-muted-foreground">
                  <Clock className="h-3 w-3 mr-1" />
                  {formatDistanceToNow(new Date(log.created_at), { 
                    addSuffix: true, 
                    locale: es 
                  })}
                </div>
              </div>
              
              <div className="flex items-center space-x-2 mb-2">
                <Badge variant={getRoleBadgeVariant(log.old_role) as any}>
                  {getRoleDisplayName(log.old_role)}
                </Badge>
                <span className="text-muted-foreground">→</span>
                <Badge variant={getRoleBadgeVariant(log.new_role) as any}>
                  {getRoleDisplayName(log.new_role)}
                </Badge>
              </div>
              
              <div className="text-sm text-muted-foreground">
                <p>Realizado por: {getUserDisplayName(log.changed_by_user)}</p>
                {log.reason && (
                  <p className="mt-1">Razón: {log.reason}</p>
                )}
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}