
import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Trash2, Plus, Shield, UserCog } from 'lucide-react'
import { useUserPermissions } from '@/hooks/useUserPermissions'

interface UserPermissionsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: any
  onClose: () => void
}

export const UserPermissionsDialog = ({ open, onOpenChange, user, onClose }: UserPermissionsDialogProps) => {
  const { 
    getUserPermissions, 
    grantPermission, 
    revokePermission,
    AVAILABLE_MODULES,
    PERMISSION_LEVELS
  } = useUserPermissions()
  
  const [selectedModule, setSelectedModule] = useState('')
  const [selectedPermission, setSelectedPermission] = useState('')

  const userPermissions = user ? getUserPermissions(user.id) : []

  const handleGrantPermission = async () => {
    if (!user || !selectedModule || !selectedPermission) return

    await grantPermission.mutateAsync({
      userId: user.id,
      module: selectedModule,
      permission: selectedPermission
    })

    setSelectedModule('')
    setSelectedPermission('')
  }

  const getModuleLabel = (moduleKey: string) => {
    return AVAILABLE_MODULES.find(m => m.key === moduleKey)?.label || moduleKey
  }

  const getPermissionLabel = (permissionKey: string) => {
    return PERMISSION_LEVELS.find(p => p.key === permissionKey)?.label || permissionKey
  }

  const getPermissionColor = (permission: string) => {
    const colors = {
      read: 'bg-blue-50 text-blue-700 border-blue-200',
      write: 'bg-green-50 text-green-700 border-green-200',
      delete: 'bg-orange-50 text-orange-700 border-orange-200',
      admin: 'bg-purple-50 text-purple-700 border-purple-200'
    }
    return colors[permission as keyof typeof colors] || 'bg-slate-50 text-slate-600 border-slate-200'
  }

  const availableModules = AVAILABLE_MODULES.filter(module => 
    !userPermissions.some(p => p.module === module.key && p.permission === selectedPermission)
  )

  const availablePermissions = PERMISSION_LEVELS.filter(permission => 
    !userPermissions.some(p => p.module === selectedModule && p.permission === permission.key)
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserCog className="h-5 w-5" />
            Permisos de {user?.email}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Permisos actuales */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Permisos Actuales ({userPermissions.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {userPermissions.length === 0 ? (
                <p className="text-slate-600 text-sm">Este usuario no tiene permisos específicos asignados.</p>
              ) : (
                <div className="space-y-2">
                  {userPermissions.map((permission) => (
                    <div key={permission.id} className="flex items-center justify-between p-3 border border-slate-200 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div>
                          <span className="font-medium text-slate-900">
                            {getModuleLabel(permission.module)}
                          </span>
                        </div>
                        <Badge className={`${getPermissionColor(permission.permission)} text-xs font-medium border`}>
                          {getPermissionLabel(permission.permission)}
                        </Badge>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => revokePermission.mutate(permission.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Agregar nuevos permisos */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Agregar Nuevo Permiso
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Módulo</label>
                    <Select value={selectedModule} onValueChange={setSelectedModule}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona un módulo" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableModules.map((module) => (
                          <SelectItem key={module.key} value={module.key}>
                            {module.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Permiso</label>
                    <Select value={selectedPermission} onValueChange={setSelectedPermission}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona un permiso" />
                      </SelectTrigger>
                      <SelectContent>
                        {availablePermissions.map((permission) => (
                          <SelectItem key={permission.key} value={permission.key}>
                            {permission.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button 
                  onClick={handleGrantPermission}
                  disabled={!selectedModule || !selectedPermission || grantPermission.isPending}
                  className="w-full"
                >
                  {grantPermission.isPending ? 'Otorgando...' : 'Otorgar Permiso'}
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={onClose}>
              Cerrar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
