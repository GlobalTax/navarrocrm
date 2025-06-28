
import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function CategoriesEmptyState() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base md:text-lg">Categorías</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-600">No hay categorías disponibles</p>
      </CardContent>
    </Card>
  )
}
