
import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog'
import { Plus, Edit, Settings2 } from 'lucide-react'
import { useActivityTypes, type ActivityType } from '@/hooks/useActivityTypes'

export const ActivityTypesManager = () => {
  const { activityTypes, isLoading, createType, updateType, toggleActive } = useActivityTypes()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingType, setEditingType] = useState<ActivityType | null>(null)
  const [formName, setFormName] = useState('')
  const [formCategory, setFormCategory] = useState('')
  const [formColor, setFormColor] = useState('#0061FF')

  const openCreate = () => {
    setEditingType(null)
    setFormName('')
    setFormCategory('')
    setFormColor('#0061FF')
    setIsDialogOpen(true)
  }

  const openEdit = (t: ActivityType) => {
    setEditingType(t)
    setFormName(t.name)
    setFormCategory(t.category)
    setFormColor(t.color || '#0061FF')
    setIsDialogOpen(true)
  }

  const handleSave = () => {
    if (!formName.trim() || !formCategory.trim()) return

    if (editingType) {
      updateType.mutate({ id: editingType.id, name: formName, category: formCategory, color: formColor })
    } else {
      createType.mutate({ name: formName, category: formCategory, color: formColor })
    }
    setIsDialogOpen(false)
  }

  return (
    <Card className="border-[0.5px] border-black rounded-[10px]">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Settings2 className="h-4 w-4" />
            Tipos de Actividad
          </CardTitle>
          <Button size="sm" className="rounded-[10px] h-8" onClick={openCreate}>
            <Plus className="h-3.5 w-3.5 mr-1" />
            Nuevo tipo
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-6">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
          </div>
        ) : activityTypes.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No hay tipos configurados. Se usarán los valores por defecto.
          </p>
        ) : (
          <div className="rounded-md border-[0.5px] border-black">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Categoría</TableHead>
                  <TableHead className="w-20">Color</TableHead>
                  <TableHead className="w-20">Activo</TableHead>
                  <TableHead className="w-16" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {activityTypes.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell className="font-medium text-sm">{t.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs rounded-[10px]">
                        {t.category}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div
                        className="h-5 w-5 rounded-full border-[0.5px] border-black"
                        style={{ backgroundColor: t.color || '#ccc' }}
                      />
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={t.is_active}
                        onCheckedChange={(checked) => toggleActive.mutate({ id: t.id, is_active: checked })}
                      />
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => openEdit(t)}>
                        <Edit className="h-3.5 w-3.5" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="rounded-[10px]">
            <DialogHeader>
              <DialogTitle>{editingType ? 'Editar' : 'Nuevo'} tipo de actividad</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-1">
                <Label className="text-xs">Nombre</Label>
                <Input
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Ej: Facturable"
                  className="border-[0.5px] border-black rounded-[10px]"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Categoría (clave interna)</Label>
                <Input
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value)}
                  placeholder="Ej: billable"
                  className="border-[0.5px] border-black rounded-[10px]"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Color</Label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={formColor}
                    onChange={(e) => setFormColor(e.target.value)}
                    className="h-9 w-12 rounded border-[0.5px] border-black cursor-pointer"
                  />
                  <span className="text-xs text-muted-foreground">{formColor}</span>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" className="rounded-[10px]" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button className="rounded-[10px]" onClick={handleSave} disabled={!formName.trim() || !formCategory.trim()}>
                {editingType ? 'Guardar' : 'Crear'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}
