
import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function CategoriesLoadingState() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base md:text-lg">Categorías</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="animate-pulse space-y-2">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-12 bg-gray-200 rounded"></div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
