import React, { useState } from 'react'
import { Plus, Edit, Trash2, Globe, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { useSubscriptionTemplates } from '@/hooks/useSubscriptionTemplates'
import { SubscriptionTemplateForm } from './SubscriptionTemplateForm'
import { TEMPLATE_CATEGORIES, type SubscriptionTemplate } from '@/types/subscription-templates'

export function SubscriptionTemplateManager() {
  const { templates, isLoading, deleteTemplate } = useSubscriptionTemplates()
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<SubscriptionTemplate | null>(null)
  const [deletingTemplate, setDeletingTemplate] = useState<SubscriptionTemplate | null>(null)

  const handleDelete = async () => {
    if (deletingTemplate) {
      await deleteTemplate.mutateAsync(deletingTemplate.id)
      setDeletingTemplate(null)
    }
  }

  const getCategoryColor = (category: string) => {
    const colors = {
      SOFTWARE: 'bg-blue-100 text-blue-800',
      IA: 'bg-purple-100 text-purple-800',
      MARKETING: 'bg-pink-100 text-pink-800',
      SERVICIOS_LEGALES: 'bg-yellow-100 text-yellow-800',
      INFRAESTRUCTURA: 'bg-green-100 text-green-800',
      DISENO: 'bg-orange-100 text-orange-800',
      COMUNICACION: 'bg-cyan-100 text-cyan-800',
      OTROS: 'bg-gray-100 text-gray-800'
    }
    return colors[category as keyof typeof colors] || colors.OTROS
  }

  const popularTemplates = templates.filter(t => t.usage_count > 0).sort((a, b) => b.usage_count - a.usage_count)
  const otherTemplates = templates.filter(t => t.usage_count === 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Gestión de Plantillas</h2>
          <p className="text-muted-foreground">
            Administra las plantillas de productos y servicios frecuentes
          </p>
        </div>
        
        <Dialog open={showCreateForm} onOpenChange={setShowCreateForm}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Nueva Plantilla
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Crear Nueva Plantilla</DialogTitle>
            </DialogHeader>
            <SubscriptionTemplateForm 
              onSuccess={() => setShowCreateForm(false)}
              onCancel={() => setShowCreateForm(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Plantillas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{templates.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Plantillas Populares</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{popularTemplates.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Usos Totales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {templates.reduce((sum, t) => sum + t.usage_count, 0)}
            </div>
          </CardContent>
        </Card>
      </div>

      {isLoading ? (
        <div className="text-center py-8">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Cargando plantillas...</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Plantillas populares */}
          {popularTemplates.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-500" />
                Plantillas Populares
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {popularTemplates.map((template) => (
                  <TemplateCard
                    key={template.id}
                    template={template}
                    onEdit={setEditingTemplate}
                    onDelete={setDeletingTemplate}
                    getCategoryColor={getCategoryColor}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Otras plantillas */}
          {otherTemplates.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-3">
                {popularTemplates.length > 0 ? 'Otras Plantillas' : 'Plantillas Disponibles'}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {otherTemplates.map((template) => (
                  <TemplateCard
                    key={template.id}
                    template={template}
                    onEdit={setEditingTemplate}
                    onDelete={setDeletingTemplate}
                    getCategoryColor={getCategoryColor}
                  />
                ))}
              </div>
            </div>
          )}

          {templates.length === 0 && (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">
                    No tienes plantillas creadas aún. Crea tu primera plantilla para agilizar la creación de suscripciones.
                  </p>
                  <Button onClick={() => setShowCreateForm(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Crear Primera Plantilla
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Dialog para editar */}
      <Dialog open={!!editingTemplate} onOpenChange={(open) => !open && setEditingTemplate(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar Plantilla</DialogTitle>
          </DialogHeader>
          {editingTemplate && (
            <SubscriptionTemplateForm 
              template={editingTemplate}
              onSuccess={() => setEditingTemplate(null)}
              onCancel={() => setEditingTemplate(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog para confirmar eliminación */}
      <AlertDialog open={!!deletingTemplate} onOpenChange={(open) => !open && setDeletingTemplate(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente la plantilla "{deletingTemplate?.name}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

interface TemplateCardProps {
  template: SubscriptionTemplate
  onEdit: (template: SubscriptionTemplate) => void
  onDelete: (template: SubscriptionTemplate) => void
  getCategoryColor: (category: string) => string
}

function TemplateCard({ template, onEdit, onDelete, getCategoryColor }: TemplateCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-base">{template.name}</CardTitle>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(template)}
              className="h-8 w-8 p-0"
            >
              <Edit className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(template)}
              className="h-8 w-8 p-0 text-destructive hover:text-destructive"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={getCategoryColor(template.category)}>
            {TEMPLATE_CATEGORIES.find(c => c.value === template.category)?.label}
          </Badge>
          {template.provider_website && (
            <Globe className="w-4 h-4 text-muted-foreground" />
          )}
          {template.usage_count > 0 && (
            <Badge variant="secondary" className="text-xs">
              {template.usage_count} usos
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Precio:</span>
            <span className="font-semibold">
              €{template.default_price.toFixed(2)}/{template.default_billing_cycle === 'MONTHLY' ? 'mes' : 'año'}
            </span>
          </div>
          {template.default_payment_method && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Pago:</span>
              <span className="text-sm">{template.default_payment_method}</span>
            </div>
          )}
          {template.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">{template.description}</p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}