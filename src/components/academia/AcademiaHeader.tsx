
import React from 'react'
import { GraduationCap, BookOpen, Award, Users } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

export function AcademiaHeader() {
  const stats = [
    { icon: BookOpen, label: 'Tutoriales', value: '24', color: 'text-blue-600' },
    { icon: Award, label: 'Certificaciones', value: '8', color: 'text-green-600' },
    { icon: Users, label: 'Usuarios activos', value: '156', color: 'text-purple-600' },
    { icon: GraduationCap, label: 'Completados', value: '89%', color: 'text-orange-600' }
  ]

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="flex items-center justify-center mb-4">
          <GraduationCap className="h-12 w-12 text-blue-600 mr-3" />
          <h1 className="text-4xl font-bold text-gray-900">Academia CRM</h1>
        </div>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Centro de aprendizaje completo para dominar todas las funcionalidades del sistema. 
          Desde conceptos básicos hasta características avanzadas de IA y automatización.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-4">
              <div className="flex items-center">
                <stat.icon className={`h-8 w-8 ${stat.color} mr-3`} />
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-sm text-gray-600">{stat.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
