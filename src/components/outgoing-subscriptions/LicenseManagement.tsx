import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useSubscriptionAssignments } from '@/hooks/useSubscriptionAssignments'
import { useUsers } from '@/hooks/useUsers'
import { Users, Plus, Trash2, AlertTriangle } from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import type { OutgoingSubscription } from '@/types/outgoing-subscriptions'

interface LicenseManagementProps {
  subscription: OutgoingSubscription
}

export const LicenseManagement: React.FC<LicenseManagementProps> = ({ subscription }) => {
  const [showAssignForm, setShowAssignForm] = useState(false)
  const [selectedUserId, setSelectedUserId] = useState('')
  const [notes, setNotes] = useState('')

  const { assignments, createAssignment, deleteAssignment, isCreating, isDeleting } = useSubscriptionAssignments(subscription.id)
  const { users } = useUsers()

  const activeAssignments = assignments.filter(a => a.status === 'active')
  const availableLicenses = subscription.quantity - activeAssignments.length
  const assignedUsers = activeAssignments.map(a => a.user_id)
  const availableUsers = users.filter(user => !assignedUsers.includes(user.id))

  const handleAssignLicense = async () => {
    if (!selectedUserId) return

    await createAssignment.mutateAsync({
      subscription_id: subscription.id,
      user_id: selectedUserId,
      status: 'active',
      notes: notes || undefined,
    })

    setSelectedUserId('')
    setNotes('')
    setShowAssignForm(false)
  }

  const handleRemoveAssignment = async (assignmentId: string) => {
    await deleteAssignment.mutateAsync(assignmentId)
  }

  const getUtilizationColor = () => {
    const utilization = (activeAssignments.length / subscription.quantity) * 100
    if (utilization >= 100) return 'bg-destructive'
    if (utilization >= 80) return 'bg-warning'
    return 'bg-success'
  }

  return (
    <Card className="border-0.5 rounded-[10px]">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Gestión de Licencias</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="border-0.5 rounded-[10px]">
              {activeAssignments.length}/{subscription.quantity} asignadas
            </Badge>
            {availableLicenses === 0 && (
              <Badge variant="destructive" className="border-0.5 rounded-[10px]">
                <AlertTriangle className="h-3 w-3 mr-1" />
                Sin licencias disponibles
              </Badge>
            )}
          </div>
        </div>
        <CardDescription>
          Asigna licencias de {subscription.provider_name} a usuarios específicos
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Progress bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Utilización de licencias</span>
            <span>{Math.round((activeAssignments.length / subscription.quantity) * 100)}%</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all ${getUtilizationColor()}`}
              style={{ width: `${(activeAssignments.length / subscription.quantity) * 100}%` }}
            />
          </div>
        </div>

        {/* Assigned users list */}
        {activeAssignments.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium">Usuarios asignados</h4>
            <div className="space-y-2">
              {activeAssignments.map((assignment) => {
                const user = users.find(u => u.id === assignment.user_id)
                return (
                  <div key={assignment.id} className="flex items-center justify-between p-3 bg-muted rounded-[10px] border-0.5">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-xs">
                          {user?.email.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-sm">{user?.email}</p>
                        <p className="text-xs text-muted-foreground">
                          Asignado el {new Date(assignment.assigned_date).toLocaleDateString()}
                        </p>
                        {assignment.notes && (
                          <p className="text-xs text-muted-foreground mt-1">{assignment.notes}</p>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveAssignment(assignment.id)}
                      disabled={isDeleting}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Add assignment form */}
        {showAssignForm ? (
          <div className="space-y-4 p-4 bg-muted rounded-[10px] border-0.5">
            <div className="space-y-2">
              <Label htmlFor="user-select">Seleccionar usuario</Label>
              <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                <SelectTrigger className="border-0.5 rounded-[10px]">
                  <SelectValue placeholder="Elegir usuario..." />
                </SelectTrigger>
                <SelectContent>
                  {availableUsers.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="text-xs">
                            {user.email.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span>{user.email}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notas (opcional)</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Agregar notas sobre esta asignación..."
                className="border-0.5 rounded-[10px]"
                rows={2}
              />
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleAssignLicense}
                disabled={!selectedUserId || isCreating}
                className="border-0.5 rounded-[10px]"
              >
                {isCreating ? 'Asignando...' : 'Asignar Licencia'}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowAssignForm(false)
                  setSelectedUserId('')
                  setNotes('')
                }}
                className="border-0.5 rounded-[10px]"
              >
                Cancelar
              </Button>
            </div>
          </div>
        ) : (
          <Button
            onClick={() => setShowAssignForm(true)}
            disabled={availableLicenses === 0 || availableUsers.length === 0}
            className="border-0.5 rounded-[10px] w-full"
            variant="outline"
          >
            <Plus className="h-4 w-4 mr-2" />
            {availableLicenses === 0 
              ? 'Sin licencias disponibles' 
              : availableUsers.length === 0
              ? 'Todos los usuarios ya tienen licencia'
              : 'Asignar Licencia'
            }
          </Button>
        )}

        {/* Summary */}
        <div className="text-sm text-muted-foreground">
          <p>• Licencias disponibles: {availableLicenses}</p>
          <p>• Usuarios sin asignar: {availableUsers.length}</p>
          {subscription.unit_description && (
            <p>• Tipo de licencia: {subscription.unit_description}</p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}