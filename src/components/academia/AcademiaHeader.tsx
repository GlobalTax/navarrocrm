
import React from 'react'
import { Card, CardContent } from '@/components/ui/card'

export function AcademiaHeader() {
  const stats = [
    { label: 'Tutoriales', value: '24' },
    { label: 'Certificaciones', value: '8' },
    { label: 'Usuarios activos', value: '156' },
    { label: 'Completados', value: '89%' }
  ]

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-3 md:p-4">
              <div className="text-center">
                <p className="text-lg md:text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-xs md:text-sm text-gray-600">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
