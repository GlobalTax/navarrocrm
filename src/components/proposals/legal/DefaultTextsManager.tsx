
import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { useDefaultProposalTexts } from '@/hooks/useDefaultProposalTexts'
import { Settings, Plus, Trash2, Edit } from 'lucide-react'

const practiceAreas = [
  { value: 'fiscal', label: 'Fiscal' },
  { value: 'laboral', label: 'Laboral' },
  { value: 'mercantil', label: 'Mercantil' },
  { value: 'civil', label: 'Civil' },
  { value: 'penal', label: 'Penal' }
]

export const DefaultTextsManager: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    practice_area: '',
    introduction_text: '',
    terms_text: ''
  })

  const {
    defaultTexts,
    isLoading,
    createDefaultText,
    updateDefaultText,
    deleteDefaultText,
    isCreating,
    isUpdating
  } = useDefaultProposalTexts()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (editingId) {
      updateDefaultText({ id: editingId, data: formData })
    } else {
      createDefaultText(formData)
    }
    
    resetForm()
  }

  const resetForm = () => {
    setFormData({
      practice_area: '',
      introduction_text: '',
      terms_text: ''
    })
    setEditingId(null)
  }

  const startEdit = (text: any) => {
    setFormData({
      practice_area: text.practice_area,
      introduction_text: text.introduction_text,
      terms_text: text.terms_text
    })
    setEditingId(text.id)
  }

  const handleDelete = (id: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar estos textos por defecto?')) {
      deleteDefaultText(id)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Settings className="h-4 w-4 mr-2" />
          Gestionar Textos por Defecto
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Gestión de Textos por Defecto</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Formulario */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                {editingId ? 'Editar Textos' : 'Añadir Nuevos Textos'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="practice_area">Área de Práctica</Label>
                  <Select
                    value={formData.practice_area}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, practice_area: value }))}
                    disabled={!!editingId}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un área" />
                    </SelectTrigger>
                    <SelectContent>
                      {practiceAreas.map(area => (
                        <SelectItem key={area.value} value={area.value}>
                          {area.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="introduction_text">Texto de Introducción</Label>
                  <Textarea
                    id="introduction_text"
                    value={formData.introduction_text}
                    onChange={(e) => setFormData(prev => ({ ...prev, introduction_text: e.target.value }))}
                    rows={6}
                    placeholder="Escriba aquí el texto de introducción por defecto..."
                  />
                </div>

                <div>
                  <Label htmlFor="terms_text">Términos y Condiciones</Label>
                  <Textarea
                    id="terms_text"
                    value={formData.terms_text}
                    onChange={(e) => setFormData(prev => ({ ...prev, terms_text: e.target.value }))}
                    rows={8}
                    placeholder="Escriba aquí los términos y condiciones por defecto..."
                  />
                </div>

                <div className="flex gap-2">
                  <Button 
                    type="submit" 
                    disabled={isCreating || isUpdating || !formData.practice_area || !formData.introduction_text || !formData.terms_text}
                  >
                    {editingId ? 'Actualizar' : 'Crear'}
                  </Button>
                  {editingId && (
                    <Button type="button" variant="outline" onClick={resetForm}>
                      Cancelar
                    </Button>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Lista de textos existentes */}
          <Card>
            <CardHeader>
              <CardTitle>Textos Configurados</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <p>Cargando...</p>
              ) : defaultTexts.length === 0 ? (
                <p className="text-gray-500">No hay textos por defecto configurados</p>
              ) : (
                <div className="space-y-3">
                  {defaultTexts.map(text => (
                    <div key={text.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <h4 className="font-medium">
                          {practiceAreas.find(a => a.value === text.practice_area)?.label || text.practice_area}
                        </h4>
                        <p className="text-sm text-gray-500">
                          Introducción: {text.introduction_text.substring(0, 100)}...
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => startEdit(text)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(text.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
}
