
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useCreateSuperAdmin } from '@/hooks/useCreateSuperAdmin'
import { useUsers } from '@/hooks/useUsers'
import { useUserRoles } from '@/hooks/useUserRoles'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { AlertCircle, User, Shield, CheckCircle, Info } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

export const SuperAdminCreator = () => {
  const [selectedUserId, setSelectedUserId] = useState('')
  const { users, isLoading: usersLoading } = useUsers()
  const { data: userRoles, isLoading: rolesLoading } = useUserRoles()
  const createSuperAdmin = useCreateSuperAdmin()

  const handleCreate = () => {
    if (!selectedUserId) {
      console.warn('⚠️ No se seleccionó usuario')
      return
    }
    
    console.log('🚀 Iniciando creación de Super Admin para:', selectedUserId)
    createSuperAdmin.mutate(selectedUserId)
  }

  const selectedUser = users.find(user => user.id === selectedUserId)
  
  // Verificar si ya existe un super admin
  const existingSuperAdmins = userRoles?.filter(role => role.role === 'super_admin') || []
  const isBootstrapMode = existingSuperAdmins.length === 0

  return (
    <div className="space-y-4">
      {/* Información sobre el estado del sistema */}
      {isBootstrapMode && (
        <Alert className="border-blue-200 bg-blue-50">
          <Info className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            <strong>Configuración inicial:</strong> No se han detectado Super Admins en el sistema. 
            Esta será la configuración inicial del primer Super Admin.
          </AlertDescription>
        </Alert>
      )}

      {!isBootstrapMode && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            <strong>Sistema configurado:</strong> Ya existen {existingSuperAdmins.length} Super Admin(s) en el sistema.
          </AlertDescription>
        </Alert>
      )}

      <Card className="max-w-md mx-auto border-0.5 border-black rounded-[10px]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            {isBootstrapMode ? 'Configuración Inicial - Super Admin' : 'Crear Super Admin'}
          </CardTitle>
          <CardDescription>
            {isBootstrapMode 
              ? 'Configura el primer Super Admin para acceder al panel de IA y administración avanzada'
              : 'Asigna el rol de Super Admin a un usuario para acceder al panel de IA'
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {(usersLoading || rolesLoading) ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900 mx-auto"></div>
              <p className="text-sm text-gray-500 mt-2">Cargando información del sistema...</p>
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <Label htmlFor="user">Seleccionar Usuario</Label>
                <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                  <SelectTrigger className="border-0.5 border-black rounded-[10px]">
                    <SelectValue placeholder="Selecciona un usuario" />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          {user.email} - {user.role}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedUser && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Se asignará el rol de Super Admin a: <strong>{selectedUser.email}</strong>
                    {isBootstrapMode && (
                      <div className="mt-2 text-sm">
                        Este será el primer Super Admin del sistema y tendrá acceso completo a todas las funcionalidades administrativas.
                      </div>
                    )}
                  </AlertDescription>
                </Alert>
              )}

              {/* Mostrar error específico si existe */}
              {createSuperAdmin.error && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-800">
                    <strong>Error:</strong> {createSuperAdmin.error.message}
                    {createSuperAdmin.error.message.includes('row-level security') && (
                      <div className="mt-2 text-sm">
                        Parece haber un problema con los permisos. Si este es el primer Super Admin, 
                        asegúrate de que las políticas de seguridad están configuradas correctamente.
                      </div>
                    )}
                  </AlertDescription>
                </Alert>
              )}
              
              <Button 
                onClick={handleCreate}
                disabled={!selectedUserId || createSuperAdmin.isPending}
                className="w-full border-0.5 border-black rounded-[10px] hover-lift"
              >
                {createSuperAdmin.isPending ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    {isBootstrapMode ? 'Configurando...' : 'Creando...'}
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    {isBootstrapMode ? 'Configurar Super Admin' : 'Crear Super Admin'}
                  </div>
                )}
              </Button>

              {/* Información de debug mejorada */}
              <div className="text-xs text-gray-500 space-y-1 pt-2 border-t">
                <p>Total usuarios: {users.length}</p>
                <p>Usuario seleccionado: {selectedUser?.email || 'Ninguno'}</p>
                <p>Super Admins existentes: {existingSuperAdmins.length}</p>
                <p>Modo: {isBootstrapMode ? 'Bootstrap (Inicial)' : 'Estándar'}</p>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
