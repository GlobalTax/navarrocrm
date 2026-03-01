
import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { AVAILABLE_MODULES, PERMISSION_LEVELS } from '@/hooks/useUserPermissions/constants'
import type { PermissionGroup } from '@/hooks/usePermissionGroups'

interface PermissionGroupDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  group?: PermissionGroup | null
  onSave: (data: { name: string; description: string; items: { module: string; permission: string }[] }) => void
  isPending: boolean
}

export const PermissionGroupDialog = ({ open, onOpenChange, group, onSave, isPending }: PermissionGroupDialogProps) => {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [selected, setSelected] = useState<Record<string, Set<string>>>({})

  useEffect(() => {
    if (group) {
      setName(group.name)
      setDescription(group.description || '')
      const sel: Record<string, Set<string>> = {}
      group.items.forEach(i => {
        if (!sel[i.module]) sel[i.module] = new Set()
        sel[i.module].add(i.permission)
      })
      setSelected(sel)
    } else {
      setName('')
      setDescription('')
      setSelected({})
    }
  }, [group, open])

  const togglePermission = (module: string, permission: string) => {
    setSelected(prev => {
      const next = { ...prev }
      if (!next[module]) next[module] = new Set()
      else next[module] = new Set(next[module])
      
      if (next[module].has(permission)) {
        next[module].delete(permission)
        if (next[module].size === 0) delete next[module]
      } else {
        next[module].add(permission)
      }
      return next
    })
  }

  const isChecked = (module: string, permission: string) => {
    return selected[module]?.has(permission) || false
  }

  const handleSave = () => {
    const items: { module: string; permission: string }[] = []
    Object.entries(selected).forEach(([module, perms]) => {
      perms.forEach(p => items.push({ module, permission: p }))
    })
    onSave({ name, description, items })
  }

  const totalSelected = Object.values(selected).reduce((acc, s) => acc + s.size, 0)
  const isSystem = group?.is_system || false

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{group ? 'Editar Grupo' : 'Crear Grupo de Permisos'}</DialogTitle>
        </DialogHeader>

        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Nombre</Label>
              <Input
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Ej: Gestor de Expedientes"
                disabled={isSystem}
                className="border-[0.5px] border-black rounded-[10px]"
              />
            </div>
            <div className="space-y-2">
              <Label>Descripción</Label>
              <Textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Descripción del grupo..."
                disabled={isSystem}
                className="border-[0.5px] border-black rounded-[10px] min-h-[38px] resize-none"
                rows={1}
              />
            </div>
          </div>

          {/* Matriz de permisos */}
          <div className="border-[0.5px] border-black rounded-[10px] overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/50">
                  <th className="text-left p-3 font-medium">Módulo</th>
                  {PERMISSION_LEVELS.map(p => (
                    <th key={p.key} className="text-center p-3 font-medium">{p.label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {AVAILABLE_MODULES.map(m => (
                  <tr key={m.key} className="border-t border-border/50">
                    <td className="p-3">
                      <div className="font-medium">{m.label}</div>
                      {m.description && (
                        <div className="text-xs text-muted-foreground">{m.description}</div>
                      )}
                    </td>
                    {PERMISSION_LEVELS.map(p => (
                      <td key={p.key} className="text-center p-3">
                        <Checkbox
                          checked={isChecked(m.key, p.key)}
                          onCheckedChange={() => togglePermission(m.key, p.key)}
                          disabled={isSystem}
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="text-sm text-muted-foreground">
              {totalSelected} permiso{totalSelected !== 1 ? 's' : ''} seleccionado{totalSelected !== 1 ? 's' : ''}
            </span>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)} className="border-[0.5px] border-black rounded-[10px]">
                Cancelar
              </Button>
              <Button
                onClick={handleSave}
                disabled={!name.trim() || totalSelected === 0 || isPending || isSystem}
                className="rounded-[10px]"
              >
                {isPending ? 'Guardando...' : group ? 'Actualizar' : 'Crear Grupo'}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
