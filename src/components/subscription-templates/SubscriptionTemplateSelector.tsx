import React, { useState } from 'react'
import { Search, Star, Globe, Filter } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useSubscriptionTemplates } from '@/hooks/useSubscriptionTemplates'
import { TEMPLATE_CATEGORIES, type SubscriptionTemplate } from '@/types/subscription-templates'

interface SubscriptionTemplateSelectorProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelectTemplate: (template: SubscriptionTemplate) => void
}

export function SubscriptionTemplateSelector({
  open,
  onOpenChange,
  onSelectTemplate
}: SubscriptionTemplateSelectorProps) {
  const { templates, isLoading, incrementUsage } = useSubscriptionTemplates()
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.description?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = categoryFilter === 'all' || template.category === categoryFilter
    return matchesSearch && matchesCategory
  })

  const popularTemplates = filteredTemplates.filter(t => t.usage_count > 0).sort((a, b) => b.usage_count - a.usage_count)
  const otherTemplates = filteredTemplates.filter(t => t.usage_count === 0)

  const handleSelectTemplate = (template: SubscriptionTemplate) => {
    incrementUsage.mutate(template.id)
    onSelectTemplate(template)
    onOpenChange(false)
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Seleccionar Plantilla de Suscripción</DialogTitle>
        </DialogHeader>

        {/* Filtros */}
        <div className="flex gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Buscar plantillas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Todas las categorías" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las categorías</SelectItem>
                {TEMPLATE_CATEGORIES.map((category) => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {popularTemplates.map((template) => (
                    <TemplateCard
                      key={template.id}
                      template={template}
                      onSelect={handleSelectTemplate}
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {otherTemplates.map((template) => (
                    <TemplateCard
                      key={template.id}
                      template={template}
                      onSelect={handleSelectTemplate}
                      getCategoryColor={getCategoryColor}
                    />
                  ))}
                </div>
              </div>
            )}

            {filteredTemplates.length === 0 && (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No se encontraron plantillas con los filtros seleccionados.</p>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

interface TemplateCardProps {
  template: SubscriptionTemplate
  onSelect: (template: SubscriptionTemplate) => void
  getCategoryColor: (category: string) => string
}

function TemplateCard({ template, onSelect, getCategoryColor }: TemplateCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => onSelect(template)}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-base">{template.name}</CardTitle>
          {template.usage_count > 0 && (
            <Badge variant="secondary" className="text-xs">
              {template.usage_count} usos
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Badge className={getCategoryColor(template.category)}>
            {TEMPLATE_CATEGORIES.find(c => c.value === template.category)?.label}
          </Badge>
          {template.provider_website && (
            <Globe className="w-4 h-4 text-muted-foreground" />
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
        <Button className="w-full mt-3" size="sm">
          Usar Plantilla
        </Button>
      </CardContent>
    </Card>
  )
}