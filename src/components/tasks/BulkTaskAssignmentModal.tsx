
import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Users, Building2, User, CheckCircle2 } from 'lucide-react'
import { useTeams } from '@/hooks/useTeams'
import { useBulkTaskAssignment } from '@/hooks/useBulkTaskAssignment'
import { useUsers } from '@/hooks/useUsers'

interface BulkTaskAssignmentModalProps {
  isOpen: boolean
  onClose: () => void
  selectedTaskIds: string[]
  taskTitles: string[]
}

export const BulkTaskAssignmentModal = ({ 
  isOpen, 
  onClose, 
  selectedTaskIds,
  taskTitles
}: BulkTaskAssignmentModalProps) => {
  const [assignmentType, setAssignmentType] = useState<'user' | 'team' | 'department'>('user')
  const [selectedTargets, setSelectedTargets] = useState<string[]>([])
  
  const { departments, teams, isLoading: loadingTeams } = useTeams()
  const { users, isLoading: loadingUsers } = useUsers()
  const { bulkAssign, isAssigning } = useBulkTaskAssignment()

  const handleTargetToggle = (targetId: string, checked: boolean) => {
    setSelectedTargets(prev => 
      checked 
        ? [...prev, targetId]
        : prev.filter(id => id !== targetId)
    )
  }

  const handleAssign = async () => {
    if (selectedTargets.length === 0) {
      return
    }

    try {
      await bulkAssign({
        taskIds: selectedTaskIds,
        assignmentType,
        targetIds: selectedTargets,
        assignmentData: {
          timestamp: new Date().toISOString(),
          taskCount: selectedTaskIds.length
        }
      })
      
      onClose()
      setSelectedTargets([])
    } catch (error) {
      console.error('Error en asignación masiva:', error)
    }
  }

  const getTargetName = (targetId: string) => {
    if (assignmentType === 'user') {
      return users.find(u => u.id === targetId)?.email || 'Usuario desconocido'
    } else if (assignmentType === 'team') {
      return teams.find(t => t.id === targetId)?.name || 'Equipo desconocido'
    } else {
      return departments.find(d => d.id === targetId)?.name || 'Departamento desconocido'
    }
  }

  const renderTargetList = () => {
    if (loadingTeams || loadingUsers) {
      return <div className="text-center py-4">Cargando...</div>
    }

    let targets: Array<{ id: string; name: string; subtitle?: string; color?: string }> = []

    if (assignmentType === 'user') {
      targets = users.map(user => ({
        id: user.id,
        name: user.email,
        subtitle: user.role
      }))
    } else if (assignmentType === 'team') {
      targets = teams.map(team => ({
        id: team.id,
        name: team.name,
        subtitle: `${team.members_count || 0} miembros`,
        color: team.color
      }))
    } else {
      targets = departments.map(dept => ({
        id: dept.id,
        name: dept.name,
        subtitle: dept.description,
        color: dept.color
      }))
    }

    return (
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {targets.map(target => (
          <div key={target.id} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50">
            <Checkbox
              checked={selectedTargets.includes(target.id)}
              onCheckedChange={(checked) => handleTargetToggle(target.id, !!checked)}
            />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                {target.color && (
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: target.color }}
                  />
                )}
                <span className="font-medium">{target.name}</span>
              </div>
              {target.subtitle && (
                <span className="text-sm text-gray-500">{target.subtitle}</span>
              )}
            </div>
          </div>
        ))}
        {targets.length === 0 && (
          <div className="text-center py-4 text-gray-500">
            No hay {assignmentType === 'user' ? 'usuarios' : assignmentType === 'team' ? 'equipos' : 'departamentos'} disponibles
          </div>
        )}
      </div>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Asignación Masiva de Tareas
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Resumen de tareas seleccionadas */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">
              {selectedTaskIds.length} tareas seleccionadas
            </h4>
            <div className="space-y-1">
              {taskTitles.slice(0, 3).map((title, index) => (
                <div key={index} className="text-sm text-blue-700 flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  {title}
                </div>
              ))}
              {taskTitles.length > 3 && (
                <div className="text-sm text-blue-600">
                  +{taskTitles.length - 3} tareas más...
                </div>
              )}
            </div>
          </div>

          {/* Tipo de asignación */}
          <div className="space-y-2">
            <Label>Asignar a:</Label>
            <Select value={assignmentType} onValueChange={(value: any) => {
              setAssignmentType(value)
              setSelectedTargets([])
            }}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="user">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Usuarios individuales
                  </div>
                </SelectItem>
                <SelectItem value="team">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Equipos completos
                  </div>
                </SelectItem>
                <SelectItem value="department">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    Departamentos
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Lista de objetivos */}
          <div className="space-y-2">
            <Label>
              Seleccionar {assignmentType === 'user' ? 'usuarios' : assignmentType === 'team' ? 'equipos' : 'departamentos'}:
            </Label>
            {renderTargetList()}
          </div>

          {/* Resumen de selección */}
          {selectedTargets.length > 0 && (
            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="font-medium text-green-900 mb-2">Seleccionados:</h4>
              <div className="flex flex-wrap gap-1">
                {selectedTargets.map(targetId => (
                  <Badge key={targetId} variant="secondary" className="text-xs">
                    {getTargetName(targetId)}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Botones */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button 
              onClick={handleAssign}
              disabled={selectedTargets.length === 0 || isAssigning}
            >
              {isAssigning ? 'Asignando...' : 'Asignar Tareas'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
