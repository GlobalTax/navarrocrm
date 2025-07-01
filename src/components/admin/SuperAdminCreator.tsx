
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useCreateSuperAdmin } from '@/hooks/useCreateSuperAdmin'
import { useUsers } from '@/hooks/useUsers'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { AlertCircle, User } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

export const SuperAdminCreator = () => {
  const [selectedUserId, setSelectedUserId] = useState('')
  const { users, isLoading: usersLoading } = useUsers()
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

  return (
    <div className="space-y-4">
      <Card className="max-w-md mx-auto border-0.5 border-black rounded-[10px]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Crear Super Admin
          </CardTitle>
          <CardDescription>
            Asigna el rol de Super Admin a un usuario para acceder al panel de IA
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {usersLoading ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900 mx-auto"></div>
              <p className="text-sm text-gray-500 mt-2">Cargando usuarios...</p>
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
                        {user.email} - {user.role}
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
                  </AlertDescription>
                </Alert>
              )}
              
              <Button 
                onClick={handleCreate}
                disabled={!selectedUserId || createSuperAdmin.isPending}
                className="w-full border-0.5 border-black rounded-[10px] hover-lift"
              >
                {createSuperAdmin.isPending ? 'Creando...' : 'Crear Super Admin'}
              </Button>

              {/* Debug info */}
              <div className="text-xs text-gray-500 space-y-1">
                <p>Total usuarios: {users.length}</p>
                <p>Usuario seleccionado: {selectedUser?.email || 'Ninguno'}</p>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
