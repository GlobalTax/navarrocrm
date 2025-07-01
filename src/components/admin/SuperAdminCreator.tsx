
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useCreateSuperAdmin } from '@/hooks/useCreateSuperAdmin'
import { useUsers } from '@/hooks/useUsers'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export const SuperAdminCreator = () => {
  const [selectedUserId, setSelectedUserId] = useState('')
  const { users } = useUsers()
  const createSuperAdmin = useCreateSuperAdmin()

  const handleCreate = () => {
    if (!selectedUserId) return
    createSuperAdmin.mutate(selectedUserId)
  }

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Crear Super Admin</CardTitle>
        <CardDescription>
          Asigna el rol de Super Admin a un usuario para acceder al panel de IA
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="user">Seleccionar Usuario</Label>
          <Select value={selectedUserId} onValueChange={setSelectedUserId}>
            <SelectTrigger>
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
        
        <Button 
          onClick={handleCreate}
          disabled={!selectedUserId || createSuperAdmin.isPending}
          className="w-full"
        >
          {createSuperAdmin.isPending ? 'Creando...' : 'Crear Super Admin'}
        </Button>
      </CardContent>
    </Card>
  )
}
