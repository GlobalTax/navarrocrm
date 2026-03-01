
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Plus, Pencil, Trash2, Shield, Lock } from 'lucide-react'
import { usePermissionGroups, PermissionGroup } from '@/hooks/usePermissionGroups'
import { PermissionGroupDialog } from './PermissionGroupDialog'
import { AVAILABLE_MODULES, PERMISSION_LEVELS } from '@/hooks/useUserPermissions/constants'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

const getModuleLabel = (key: string) => AVAILABLE_MODULES.find(m => m.key === key)?.label || key
const getPermissionLabel = (key: string) => PERMISSION_LEVELS.find(p => p.key === key)?.label || key

const permissionColor: Record<string, string> = {
  read: 'bg-blue-50 text-blue-700 border-blue-200',
  write: 'bg-green-50 text-green-700 border-green-200',
  delete: 'bg-orange-50 text-orange-700 border-orange-200',
  admin: 'bg-purple-50 text-purple-700 border-purple-200',
}

export const PermissionGroupsTab = () => {
  const { groups, isLoading, createGroup, updateGroup, deleteGroup } = usePermissionGroups()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingGroup, setEditingGroup] = useState<PermissionGroup | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  const handleCreate = () => {
    setEditingGroup(null)
    setDialogOpen(true)
  }

  const handleEdit = (group: PermissionGroup) => {
    setEditingGroup(group)
    setDialogOpen(true)
  }

  const handleSave = async (data: { name: string; description: string; items: { module: string; permission: string }[] }) => {
    if (editingGroup) {
      await updateGroup.mutateAsync({ id: editingGroup.id, ...data })
    } else {
      await createGroup.mutateAsync(data)
    }
    setDialogOpen(false)
  }

  if (isLoading) {
    return <div className="flex items-center justify-center py-12 text-muted-foreground">Cargando grupos...</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Grupos de Permisos</h3>
          <p className="text-sm text-muted-foreground">Plantillas para asignar permisos de forma masiva</p>
        </div>
        <Button onClick={handleCreate} className="rounded-[10px]">
          <Plus className="h-4 w-4 mr-2" />
          Crear Grupo
        </Button>
      </div>

      {groups.length === 0 ? (
        <div className="text-center py-12 border-[0.5px] border-black rounded-[10px] bg-white">
          <Shield className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground">No hay grupos de permisos</p>
          <Button variant="outline" onClick={handleCreate} className="mt-3 border-[0.5px] border-black rounded-[10px]">
            Crear el primero
          </Button>
        </div>
      ) : (
        <div className="border-[0.5px] border-black rounded-[10px] overflow-hidden bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/50 border-b border-border/50">
                <th className="text-left p-3 font-medium">Nombre</th>
                <th className="text-left p-3 font-medium">Descripción</th>
                <th className="text-left p-3 font-medium">Permisos</th>
                <th className="text-right p-3 font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {groups.map(group => (
                <tr key={group.id} className="border-b border-border/30 hover:bg-muted/20 transition-colors">
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{group.name}</span>
                      {group.is_system && (
                        <Lock className="h-3.5 w-3.5 text-muted-foreground" />
                      )}
                    </div>
                  </td>
                  <td className="p-3 text-muted-foreground max-w-[200px] truncate">{group.description || '—'}</td>
                  <td className="p-3">
                    <div className="flex flex-wrap gap-1">
                      {group.items.slice(0, 6).map(item => (
                        <Badge
                          key={`${item.module}-${item.permission}`}
                          variant="outline"
                          className={`text-[10px] ${permissionColor[item.permission] || ''}`}
                        >
                          {getModuleLabel(item.module)}: {getPermissionLabel(item.permission)}
                        </Badge>
                      ))}
                      {group.items.length > 6 && (
                        <Badge variant="outline" className="text-[10px]">
                          +{group.items.length - 6} más
                        </Badge>
                      )}
                    </div>
                  </td>
                  <td className="p-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button size="sm" variant="ghost" onClick={() => handleEdit(group)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      {!group.is_system && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-destructive hover:text-destructive"
                          onClick={() => setDeleteConfirm(group.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <PermissionGroupDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        group={editingGroup}
        onSave={handleSave}
        isPending={createGroup.isPending || updateGroup.isPending}
      />

      <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar este grupo?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Los permisos ya asignados a usuarios no se verán afectados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteConfirm) deleteGroup.mutate(deleteConfirm)
                setDeleteConfirm(null)
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
