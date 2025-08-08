
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { X, User } from 'lucide-react'
import { useUsers } from '@/hooks/useUsers'

interface TaskUserAssignmentFieldsProps {
  formData: {
    assigned_users: string[]
  }
  onInputChange: (field: string, value: string[]) => void
}

export const TaskUserAssignmentFields = ({ formData, onInputChange }: TaskUserAssignmentFieldsProps) => {
  const { users } = useUsers()

  const handleAddUser = (userId: string) => {
    if (userId && userId !== 'none' && !formData.assigned_users.includes(userId)) {
      const newAssignedUsers = [...formData.assigned_users, userId]
      onInputChange('assigned_users', newAssignedUsers)
    }
  }

  const handleRemoveUser = (userId: string) => {
    const newAssignedUsers = formData.assigned_users.filter(id => id !== userId)
    onInputChange('assigned_users', newAssignedUsers)
  }

  const getUser = (userId: string) => {
    return users?.find(user => user.id === userId)
  }

  const availableUsers = users?.filter(user => 
    !formData.assigned_users.includes(user.id)
  ) || []

  return (
    <div className="space-y-3">
      <Label>Asignar a usuarios</Label>
      
      {/* Usuarios ya asignados */}
      {formData.assigned_users.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {formData.assigned_users.map(userId => {
            const user = getUser(userId)
            return (
              <Badge key={userId} variant="outline" className="flex items-center gap-1 border-0.5 border-black rounded-[10px] bg-white text-black">
                <User className="h-3 w-3" />
                <span>{user?.email || 'Usuario desconocido'}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0"
                  onClick={() => handleRemoveUser(userId)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            )
          })}
        </div>
      )}

      {/* Selector para añadir usuarios */}
      {availableUsers.length > 0 && (
        <Select onValueChange={handleAddUser}>
          <SelectTrigger className="border-0.5 border-black rounded-[10px] bg-white">
            <SelectValue placeholder="Añadir usuario..." />
          </SelectTrigger>
          <SelectContent>
            {availableUsers.map(user => (
              <SelectItem key={user.id} value={user.id}>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <div>
                    <div className="font-medium">{user.email}</div>
                    <div className="text-xs text-gray-500 capitalize">{user.role}</div>
                  </div>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {availableUsers.length === 0 && formData.assigned_users.length === 0 && (
        <p className="text-sm text-gray-500">No hay usuarios disponibles para asignar</p>
      )}
    </div>
  )
}
