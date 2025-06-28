
import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { BookOpen } from 'lucide-react'

interface EmptyStateProps {
  selectedCategory: string | null
  onClearCategory: () => void
}

export function EmptyState({ selectedCategory, onClearCategory }: EmptyStateProps) {
  return (
    <Card className="border-0.5 border-black rounded-[10px]">
      <CardContent className="text-center py-12">
        <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-400" />
        <h3 className="text-lg font-semibold mb-2">No hay cursos disponibles</h3>
        <p className="text-gray-600 mb-4">
          {selectedCategory 
            ? 'No se encontraron cursos en esta categoría.' 
            : 'Aún no hay cursos creados en la academia.'}
        </p>
        {selectedCategory && (
          <Button variant="outline" onClick={onClearCategory}>
            Ver todos los cursos
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
