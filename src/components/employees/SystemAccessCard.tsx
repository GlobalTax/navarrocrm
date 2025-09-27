import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Shield, 
  User, 
  Key, 
  UserPlus, 
  UserMinus,
  Settings,
  RefreshCw,
  AlertTriangle
} from 'lucide-react'
import { useUserPermissions } from '@/hooks/useUserPermissions'
import { useRegeneratePassword } from '@/hooks/useRegeneratePassword'
import { UserPermissionsDialog } from '@/components/users/UserPermissionsDialog'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import type { SimpleEmployee } from '@/hooks/useSimpleEmployees'
import { toast } from 'sonner'

interface SystemAccessCardProps {
  employee: SimpleEmployee
}

export const SystemAccessCard = ({ employee }: SystemAccessCardProps) => {
  const { getUserPermissions, AVAILABLE_MODULES } = useUserPermissions()
  const { regeneratePassword, isRegenerating, regeneratedCredentials } = useRegeneratePassword()
  
  const [showPermissionsDialog, setShowPermissionsDialog] = useState(false)
  const [showRegenerateDialog, setShowRegenerateDialog] = useState(false)

  // Obtener permisos del usuario si tiene cuenta
  const userPermissions = employee.user_id ? getUserPermissions(employee.user_id) : []
  
  const handleRegeneratePassword = () => {
    if (!employee.user_id) return
    
    regeneratePassword({ userId: employee.user_id })
    setShowRegenerateDialog(false)
  }

  const getRoleColor = (role: string) => {
    const colors = {
      partner: 'bg-purple-50 text-purple-700 border-purple-200',
      area_manager: 'bg-blue-50 text-blue-700 border-blue-200',
      senior: 'bg-green-50 text-green-700 border-green-200',
      junior: 'bg-yellow-50 text-yellow-700 border-yellow-200',
      finance: 'bg-orange-50 text-orange-700 border-orange-200',
      client: 'bg-gray-50 text-gray-700 border-gray-200'
    }
    return colors[role as keyof typeof colors] || 'bg-slate-50 text-slate-600 border-slate-200'
  }

  const getRoleLabel = (role: string) => {
    const labels = {
      partner: 'Socio',
      area_manager: 'Jefe de Área',
      senior: 'Senior',
      junior: 'Junior',
      finance: 'Finanzas',
      client: 'Cliente'
    }
    return labels[role as keyof typeof labels] || role
  }

  return (
    <div className="space-y-4">
      {/* Estado de acceso */}
      <Card className="border-0.5 border-black rounded-[10px]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Estado de Acceso al Sistema
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Cuenta de Usuario:</span>
            </div>
            <Badge className={employee.is_user ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}>
              {employee.is_user ? 'Activa' : 'Sin cuenta'}
            </Badge>
          </div>

          {employee.is_user && employee.role && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Key className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Rol del Sistema:</span>
              </div>
              <Badge className={getRoleColor(employee.role)}>
                {getRoleLabel(employee.role)}
              </Badge>
            </div>
          )}

          {employee.is_user && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Settings className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Permisos Específicos:</span>
              </div>
              <span className="text-sm text-muted-foreground">
                {userPermissions.length} permisos asignados
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Permisos por módulos */}
      {employee.is_user && userPermissions.length > 0 && (
        <Card className="border-0.5 border-black rounded-[10px]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Permisos por Módulos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {AVAILABLE_MODULES.map((module) => {
                const modulePermissions = userPermissions.filter(p => p.module === module.key)
                return (
                  <div key={module.key} className="p-3 border border-slate-200 rounded-[10px]">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">{module.label}</span>
                      <Badge className="text-xs">
                        {modulePermissions.length}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {modulePermissions.map((perm) => (
                        <Badge 
                          key={perm.id} 
                          variant="secondary" 
                          className="text-xs"
                        >
                          {perm.permission}
                        </Badge>
                      ))}
                      {modulePermissions.length === 0 && (
                        <span className="text-xs text-muted-foreground">Sin permisos</span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Acciones de gestión */}
      <Card className="border-0.5 border-black rounded-[10px]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Gestión de Accesos
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {!employee.is_user ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2 p-3 bg-orange-50 border border-orange-200 rounded-[10px]">
                <AlertTriangle className="h-4 w-4 text-orange-600" />
                <span className="text-sm text-orange-700">
                  Este empleado no tiene acceso al sistema. Crea una cuenta para permitir el acceso.
                </span>
              </div>
              <Button className="w-full border-0.5 border-black rounded-[10px]">
                <UserPlus className="h-4 w-4 mr-2" />
                Crear Cuenta de Usuario
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <Button 
                onClick={() => setShowPermissionsDialog(true)}
                className="w-full border-0.5 border-black rounded-[10px]"
                variant="outline"
              >
                <Shield className="h-4 w-4 mr-2" />
                Gestionar Permisos
              </Button>
              
              <Button 
                onClick={() => setShowRegenerateDialog(true)}
                disabled={isRegenerating}
                className="w-full border-0.5 border-black rounded-[10px]"
                variant="outline"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isRegenerating ? 'animate-spin' : ''}`} />
                {isRegenerating ? 'Regenerando...' : 'Regenerar Contraseña'}
              </Button>

              <Button 
                className="w-full border-0.5 border-black rounded-[10px]"
                variant="outline"
              >
                <UserMinus className="h-4 w-4 mr-2" />
                Desactivar Acceso
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Credenciales regeneradas */}
      {regeneratedCredentials && (
        <Card className="border-0.5 border-black rounded-[10px] bg-green-50 border-green-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-800">
              <Key className="h-5 w-5" />
              Nuevas Credenciales
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm font-medium text-green-800">Email:</span>
                <span className="text-sm text-green-700">{regeneratedCredentials.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium text-green-800">Contraseña:</span>
                <span className="text-sm text-green-700 font-mono">{regeneratedCredentials.password}</span>
              </div>
            </div>
            <div className="text-xs text-green-600 bg-green-100 p-2 rounded-[10px]">
              Guarda estas credenciales de forma segura. La contraseña no se mostrará nuevamente.
            </div>
          </CardContent>
        </Card>
      )}

      {/* Diálogos */}
      {employee.is_user && (
        <UserPermissionsDialog
          open={showPermissionsDialog}
          onOpenChange={setShowPermissionsDialog}
          user={{ id: employee.user_id, email: employee.email }}
          onClose={() => setShowPermissionsDialog(false)}
        />
      )}

      <ConfirmDialog
        open={showRegenerateDialog}
        onOpenChange={setShowRegenerateDialog}
        onConfirm={handleRegeneratePassword}
        title="Regenerar Contraseña"
        description="¿Estás seguro de que quieres regenerar la contraseña de este usuario? La contraseña actual dejará de funcionar."
      />
    </div>
  )
}