
import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { AcademyCategory } from '@/types/academy'

interface CategoriesSectionProps {
  categories: AcademyCategory[]
  onEdit: (category: AcademyCategory) => void
  onDelete: (categoryId: string) => void
  isLoading?: boolean
}

export function CategoriesSection({
  categories,
  onEdit,
  onDelete,
  isLoading = false
}: CategoriesSectionProps) {
  if (isLoading) {
    return (
      <Card className="border-0.5 border-black rounded-[10px]">
        <CardHeader>
          <CardTitle>Gestión de Categorías</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const handleDelete = (categoryId: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar esta categoría? Esta acción no se puede deshacer.')) {
      onDelete(categoryId)
    }
  }

  return (
    <Card className="border-0.5 border-black rounded-[10px]">
      <CardHeader>
        <CardTitle>Gestión de Categorías</CardTitle>
      </CardHeader>
      <CardContent>
        {categories && categories.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((category) => (
              <Card key={category.id} className="border-0.5 border-black rounded-[10px]">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div 
                      className="w-4 h-4 rounded-full" 
                      style={{ backgroundColor: category.color }}
                    />
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit(category)}
                        className="text-blue-600 hover:text-blue-700 p-1 h-auto"
                      >
                        Editar
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(category.id)}
                        className="text-red-600 hover:text-red-700 p-1 h-auto"
                      >
                        Eliminar
                      </Button>
                    </div>
                  </div>
                  <h3 className="font-semibold">{category.name}</h3>
                  {category.description && (
                    <p className="text-sm text-gray-600 mt-1">{category.description}</p>
                  )}
                  <div className="mt-2 flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      Orden: {category.sort_order}
                    </Badge>
                    <Badge 
                      variant={category.is_active ? "default" : "secondary"}
                      className="text-xs"
                    >
                      {category.is_active ? 'Activa' : 'Inactiva'}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <h3 className="text-lg font-semibold mb-2">No hay categorías creadas</h3>
            <p className="text-gray-600 mb-4">
              Crea categorías para organizar mejor tus cursos
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
