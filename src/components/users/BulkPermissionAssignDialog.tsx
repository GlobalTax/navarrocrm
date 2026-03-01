import { useState } from 'react'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import { Shield, Users } from 'lucide-react'
import { usePermissionGroups } from '@/hooks/usePermissionGroups'
import { toast } from 'sonner'

interface BulkPermissionAssignDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedUserIds: string[]
  onComplete: () => void
}

export const BulkPermissionAssignDialog = ({
  open,
  onOpenChange,
  selectedUserIds,
  onComplete
}: BulkPermissionAssignDialogProps) => {
  const [selectedGroupId, setSelectedGroupId] = useState<string>('')
  const [progress, setProgress] = useState(0)
  const [isProcessing, setIsProcessing] = useState(false)

  const { groups, isLoading, applyGroupToMultipleUsers } = usePermissionGroups()

  const handleApply = async () => {
    if (!selectedGroupId) return

    setIsProcessing(true)
    setProgress(0)

    try {
      await applyGroupToMultipleUsers.mutateAsync({
        userIds: selectedUserIds,
        groupId: selectedGroupId,
        onProgress: (current, total) => {
          setProgress(Math.round((current / total) * 100))
        }
      })
      toast.success(`Permisos asignados a ${selectedUserIds.length} usuarios`)
      onComplete()
      onOpenChange(false)
    } catch {
      // error handled by mutation
    } finally {
      setIsProcessing(false)
      setProgress(0)
      setSelectedGroupId('')
    }
  }

  return (
    <Dialog open={open} onOpenChange={isProcessing ? undefined : onOpenChange}>
      <DialogContent className="sm:max-w-md border-[0.5px] border-black rounded-[10px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Asignar permisos masivamente
          </DialogTitle>
          <DialogDescription>
            Se aplicará el grupo de permisos a {selectedUserIds.length} usuario{selectedUserIds.length !== 1 ? 's' : ''} seleccionado{selectedUserIds.length !== 1 ? 's' : ''}.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 p-3 rounded-[10px] border-[0.5px] border-black/10">
            <Users className="h-4 w-4 shrink-0" />
            <span>{selectedUserIds.length} usuario{selectedUserIds.length !== 1 ? 's' : ''} seleccionado{selectedUserIds.length !== 1 ? 's' : ''}</span>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Grupo de permisos</label>
            <Select value={selectedGroupId} onValueChange={setSelectedGroupId} disabled={isProcessing}>
              <SelectTrigger className="border-[0.5px] border-black rounded-[10px]">
                <SelectValue placeholder="Selecciona un grupo..." />
              </SelectTrigger>
              <SelectContent>
                {groups.map(group => (
                  <SelectItem key={group.id} value={group.id}>
                    {group.name} ({group.items.length} permisos)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {isProcessing && (
            <div className="space-y-2">
              <Progress value={progress} className="h-2" />
              <p className="text-xs text-muted-foreground text-center">{progress}% completado</p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isProcessing}
            className="border-[0.5px] border-black rounded-[10px]"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleApply}
            disabled={!selectedGroupId || isProcessing || isLoading}
            className="border-[0.5px] border-black rounded-[10px]"
          >
            {isProcessing ? 'Aplicando...' : `Aplicar a ${selectedUserIds.length} usuarios`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
