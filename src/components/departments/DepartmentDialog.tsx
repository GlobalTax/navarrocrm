import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useTeams, Department } from '@/hooks/useTeams'
import { useDepartments } from '@/hooks/useDepartments'
import { useApp } from '@/contexts/AppContext'

interface DepartmentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  department?: Department | null
  mode: 'create' | 'edit'
}

const PREDEFINED_COLORS = [
  '#6366f1', '#8b5cf6', '#ec4899', '#ef4444', '#f97316', 
  '#f59e0b', '#eab308', '#84cc16', '#22c55e', '#10b981',
  '#06b6d4', '#0ea5e9', '#3b82f6', '#6366f1', '#8b5cf6'
]

export const DepartmentDialog = ({ 
  open, 
  onOpenChange, 
  department, 
  mode 
}: DepartmentDialogProps) => {
  const { user } = useApp()
  const { createDepartment } = useTeams()
  const { updateDepartment } = useDepartments()
  const [loading, setLoading] = useState(false)
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: '#6366f1'
  })

  useEffect(() => {
    if (department && mode === 'edit') {
      setFormData({
        name: department.name,
        description: department.description || '',
        color: department.color || '#6366f1'
      })
    } else {
      setFormData({
        name: '',
        description: '',
        color: '#6366f1'
      })
    }
  }, [department, mode, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user?.org_id) return

    setLoading(true)
    try {
      if (mode === 'create') {
        await createDepartment({
          ...formData,
          org_id: user.org_id,
          is_active: true
        })
      } else if (department) {
        await updateDepartment({
          id: department.id,
          ...formData
        })
      }
      onOpenChange(false)
    } catch (error) {
      console.error('Error saving department:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white border-0.5 border-black rounded-[10px] shadow-lg">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Crear Departamento' : 'Editar Departamento'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre del departamento *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ej: Recursos Humanos"
              required
              className="border-0.5 border-black rounded-[10px]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Descripción del departamento..."
              rows={3}
              className="border-0.5 border-black rounded-[10px]"
            />
          </div>

          <div className="space-y-2">
            <Label>Color del departamento</Label>
            <div className="flex flex-wrap gap-2 p-3 border-0.5 border-black rounded-[10px] bg-gray-50">
              {PREDEFINED_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  className={`w-8 h-8 rounded-full border-2 transition-all ${
                    formData.color === color ? 'border-black scale-110' : 'border-gray-300'
                  }`}
                  style={{ backgroundColor: color }}
                  onClick={() => setFormData({ ...formData, color })}
                />
              ))}
            </div>
            <div className="flex items-center space-x-2 mt-2">
              <Label htmlFor="custom-color" className="text-sm">O color personalizado:</Label>
              <input
                id="custom-color"
                type="color"
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                className="w-10 h-8 border-0.5 border-black rounded-[10px] cursor-pointer"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="border-0.5 border-black rounded-[10px]"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading || !formData.name.trim()}
              className="bg-primary text-white border-0.5 border-black rounded-[10px] hover-lift"
            >
              {loading ? 'Guardando...' : mode === 'create' ? 'Crear' : 'Actualizar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}