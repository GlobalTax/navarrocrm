
import React from 'react'
import { Play, Clock, Users, Star, ChevronRight } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useIsMobile } from '@/hooks/use-mobile'

interface AcademiaOverviewProps {
  selectedCategory: string | null
}

export function AcademiaOverview({ selectedCategory }: AcademiaOverviewProps) {
  const isMobile = useIsMobile()

  const featuredCourses = [
    {
      id: 'getting-started',
      title: 'Primeros pasos en el CRM',
      description: 'Aprende los conceptos básicos para empezar a usar el sistema de manera efectiva.',
      duration: '45 min',
      lessons: 6,
      difficulty: 'Principiante',
      rating: 4.8,
      students: 234,
      thumbnail: '🚀'
    },
    {
      id: 'advanced-workflows',
      title: 'Workflows Avanzados',
      description: 'Automatiza procesos complejos y mejora la eficiencia de tu despacho.',
      duration: '2h 15min',
      lessons: 8,
      difficulty: 'Avanzado',
      rating: 4.9,
      students: 89,
      thumbnail: '⚡'
    },
    {
      id: 'ai-integration',
      title: 'Integración con IA',
      description: 'Descubre cómo utilizar las funcionalidades de inteligencia artificial.',
      duration: '1h 30min',
      lessons: 5,
      difficulty: 'Intermedio',
      rating: 4.7,
      students: 156,
      thumbnail: '🤖'
    }
  ]

  const quickStart = [
    { title: 'Configurar tu primera cuenta', time: '5 min' },
    { title: 'Crear tu primer cliente', time: '3 min' },
    { title: 'Abrir un expediente', time: '4 min' },
    { title: 'Programar una cita', time: '2 min' }
  ]

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Welcome Section */}
      <div className="text-center py-6 md:py-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg px-4">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3 md:mb-4">
          ¡Bienvenido a la Academia!
        </h2>
        <p className="text-base md:text-lg text-gray-600 mb-4 md:mb-6 max-w-2xl mx-auto">
          Domina todas las funcionalidades del CRM con nuestros tutoriales interactivos, 
          guías paso a paso y casos prácticos.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
          <Button size={isMobile ? "default" : "lg"} className="w-full sm:w-auto">
            <Play className="h-4 w-4 md:h-5 md:w-5 mr-2" />
            Comenzar tour guiado
          </Button>
          <Button variant="outline" size={isMobile ? "default" : "lg"} className="w-full sm:w-auto">
            Ver todos los cursos
          </Button>
        </div>
      </div>

      {/* Quick Start */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-lg md:text-xl">
            <span className="text-xl md:text-2xl mr-2">⚡</span>
            Inicio rápido (15 minutos)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-3 md:gap-4">
            {quickStart.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm mr-3 flex-shrink-0">
                    {index + 1}
                  </div>
                  <span className="font-medium text-sm md:text-base">{item.title}</span>
                </div>
                <div className="flex items-center text-sm text-gray-600 ml-2">
                  <Clock className="h-4 w-4 mr-1" />
                  {item.time}
                  <ChevronRight className="h-4 w-4 ml-2" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Featured Courses */}
      <div>
        <h3 className="text-xl md:text-2xl font-bold mb-4 md:mb-6 px-4 md:px-0">Cursos destacados</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {featuredCourses.map((course) => (
            <Card key={course.id} className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-4 md:p-6">
                <div className="text-3xl md:text-4xl mb-3 md:mb-4 text-center">{course.thumbnail}</div>
                <h4 className="font-bold text-base md:text-lg mb-2">{course.title}</h4>
                <p className="text-gray-600 mb-3 md:mb-4 text-sm">{course.description}</p>
                
                <div className="flex items-center justify-between mb-3 md:mb-4">
                  <Badge variant="outline" className="text-xs">{course.difficulty}</Badge>
                  <div className="flex items-center text-sm text-gray-600">
                    <Star className="h-4 w-4 text-yellow-500 mr-1" />
                    {course.rating}
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-sm text-gray-600 mb-3 md:mb-4">
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    {course.duration}
                  </div>
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-1" />
                    {course.students}
                  </div>
                </div>
                
                <Button className="w-full" size={isMobile ? "sm" : "default"}>
                  <Play className="h-4 w-4 mr-2" />
                  Comenzar curso
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
