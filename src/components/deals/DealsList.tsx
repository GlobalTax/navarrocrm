
import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export const DealsList = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Lista de Deals</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-12 text-muted-foreground">
          Vista de lista de deals en desarrollo.
          <br />
          Por ahora utiliza la vista de Pipeline.
        </div>
      </CardContent>
    </Card>
  )
}
