
import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  BookOpen, Clock, CheckCircle, Play, FileText, 
  Users, Target, Brain, Settings, ChevronRight,
  Trophy, Star
} from 'lucide-react'
import { useAcademyCategories, useAcademyCourses, useUserProgress } from '@/hooks/useAcademy'

export function RealAcademiaContent() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null)
  
  const { data: categories, isLoading: categoriesLoading } = useAcademyCategories()
  const { data: courses, isLoading: coursesLoading } = useAcademyCourses(selectedCategory || undefined)
  const { data: userProgress } = useUserProgress()

  const mockCoursesData = [
    {
      id: 'gestion-clientes',
      title: 'Gestión Completa de Clientes',
      description: 'Domina el arte de gestionar clientes desde el primer contacto hasta la fidelización',
      level: 'beginner' as const,
      lessons: 8,
      duration: 120,
      progress: 65,
      category: 'Gestión Básica',
      icon: '👥',
      objectives: [
        'Crear y gestionar fichas de cliente',
        'Organizar información de contacto',
        'Implementar seguimiento efectivo',
        'Automatizar comunicaciones'
      ],
      content: `
# Gestión Completa de Clientes

## Introducción

La gestión efectiva de clientes es el corazón de cualquier despacho exitoso. En este curso aprenderás las mejores prácticas para convertir prospectos en clientes fieles y maximizar el valor de cada relación comercial.

## ¿Por qué es importante?

- **Incrementa la retención**: Clientes bien gestionados permanecen más tiempo
- **Mejora la rentabilidad**: Reduce costos de adquisición de nuevos clientes  
- **Optimiza el servicio**: Información organizada permite mejor atención
- **Facilita el crecimiento**: Base sólida para expansión del negocio

## Lo que aprenderás

Al completar este curso serás capaz de:

✅ Crear fichas de cliente completas y organizadas
✅ Implementar sistemas de seguimiento automático
✅ Gestionar comunicaciones multi-canal efectivas
✅ Analizar el valor y potencial de cada cliente
✅ Desarrollar estrategias de fidelización personalizadas

---

*Duración estimada: 2 horas | Nivel: Principiante*
      `
    },
    {
      id: 'propuestas-ganadoras',
      title: 'Propuestas Comerciales Ganadoras',
      description: 'Aprende a crear propuestas que conviertan prospectos en clientes',
      level: 'intermediate' as const,
      lessons: 6,
      duration: 90,
      progress: 30,
      category: 'Funcionalidades Comerciales',
      icon: '📄',
      objectives: [
        'Estructurar propuestas efectivas',
        'Calcular precios competitivos',
        'Automatizar seguimiento',
        'Cerrar más ventas'
      ],
      content: `
# Propuestas Comerciales Ganadoras

## El Arte de la Propuesta Perfecta

Una propuesta bien estructurada es la diferencia entre ganar y perder un cliente potencial. En este curso aprenderás las técnicas probadas para crear propuestas que destaquen y convenzan.

## Elementos Clave de una Propuesta Exitosa

### 1. Comprensión del Cliente
- Análisis de necesidades específicas
- Identificación de puntos de dolor
- Personalización del mensaje

### 2. Estructura Profesional
- **Resumen ejecutivo**: Captura atención inmediata
- **Diagnóstico**: Demuestra comprensión del problema
- **Solución**: Presenta tu propuesta de valor única
- **Implementación**: Plan claro y realista
- **Inversión**: Justificación del precio

### 3. Diferenciación Competitiva
- Propuesta de valor única
- Casos de éxito relevantes
- Garantías y compromisos

## Herramientas del CRM para Propuestas

Aprenderás a utilizar:
- Templates personalizables
- Calculadora de precios automática
- Sistema de seguimiento integrado
- Analytics de propuestas

---

*Duración estimada: 1.5 horas | Nivel: Intermedio*
      `
    },
    {
      id: 'workflows-automatizacion',
      title: 'Workflows y Automatización',
      description: 'Automatiza procesos repetitivos y optimiza tu productividad',
      level: 'advanced' as const,
      lessons: 10,
      duration: 180,
      progress: 0,
      category: 'Automatización y IA',
      icon: '⚡',
      objectives: [
        'Diseñar workflows eficientes',
        'Automatizar tareas repetitivas',
        'Integrar sistemas externos',
        'Optimizar productividad'
      ],
      content: `
# Workflows y Automatización Avanzada

## La Revolución de la Automatización

En la era digital, la automatización no es un lujo, es una necesidad. Este curso te enseñará a transformar tu despacho en una máquina eficiente que trabaja 24/7.

## Conceptos Fundamentales

### ¿Qué es un Workflow?
Un workflow es una secuencia automatizada de acciones que se ejecutan basadas en triggers o condiciones específicas.

### Beneficios Clave
- **Ahorro de tiempo**: Hasta 60% reducción en tareas administrativas
- **Consistencia**: Procesos estandarizados sin errores humanos
- **Escalabilidad**: Crecimiento sin incremento proporcional de personal
- **Satisfacción**: Más tiempo para trabajo de alto valor

## Tipos de Workflows Esenciales

### 1. Onboarding de Clientes
- Envío automático de documentos de bienvenida
- Programación de citas iniciales
- Asignación de responsables

### 2. Seguimiento de Propuestas
- Recordatorios automáticos post-envío
- Escalado por falta de respuesta
- Notificaciones de vencimiento

### 3. Gestión de Tareas
- Asignación automática por especialización
- Escalado por demoras
- Reporting automático de avances

## Implementación Práctica

Cada lección incluye:
- Ejemplos reales de workflows
- Configuración paso a paso
- Mejores prácticas del sector
- Casos de estudio exitosos

---

*Duración estimada: 3 horas | Nivel: Avanzado*
      `
    }
  ]

  const getCategoryIcon = (name: string) => {
    switch (name) {
      case 'Gestión Básica': return Users
      case 'Funcionalidades Comerciales': return FileText
      case 'Automatización y IA': return Brain
      case 'Administración': return Settings
      default: return BookOpen
    }
  }

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'bg-green-100 text-green-800 border-green-200'
      case 'intermediate': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'advanced': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getLevelText = (level: string) => {
    switch (level) {
      case 'beginner': return 'Principiante'
      case 'intermediate': return 'Intermedio'
      case 'advanced': return 'Avanzado'
      default: return 'Sin definir'
    }
  }

  if (selectedCourse) {
    const course = mockCoursesData.find(c => c.id === selectedCourse)
    if (!course) return null

    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4 mb-6">
          <Button 
            variant="outline" 
            onClick={() => setSelectedCourse(null)}
            size="sm"
          >
            ← Volver a cursos
          </Button>
          <div className="text-sm text-gray-600">
            {course.category} / {course.title}
          </div>
        </div>

        <Card className="border-0.5 border-black rounded-[10px]">
          <CardHeader className="pb-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="text-4xl">{course.icon}</div>
                <div>
                  <CardTitle className="text-2xl mb-2">{course.title}</CardTitle>
                  <p className="text-gray-600 mb-4">{course.description}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <BookOpen className="h-4 w-4" />
                      {course.lessons} lecciones
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {course.duration} min
                    </div>
                    <Badge className={getLevelColor(course.level)}>
                      {getLevelText(course.level)}
                    </Badge>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-600 mb-1">Progreso</div>
                <div className="text-2xl font-bold mb-2">{course.progress}%</div>
                <Progress value={course.progress} className="w-32" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="content" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="content">Contenido</TabsTrigger>
                <TabsTrigger value="objectives">Objetivos</TabsTrigger>
                <TabsTrigger value="progress">Mi Progreso</TabsTrigger>
              </TabsList>
              
              <TabsContent value="content" className="mt-6">
                <div className="prose max-w-none">
                  <div 
                    className="text-gray-800 leading-relaxed"
                    dangerouslySetInnerHTML={{ 
                      __html: course.content.replace(/\n/g, '<br>').replace(/#{1,3}/g, '') 
                    }}
                  />
                </div>
                <div className="mt-8 flex gap-4">
                  <Button size="lg" className="bg-black hover:bg-gray-800">
                    <Play className="h-5 w-5 mr-2" />
                    Comenzar Curso
                  </Button>
                  <Button variant="outline" size="lg">
                    <BookOpen className="h-5 w-5 mr-2" />
                    Marcar como Completado
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="objectives" className="mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {course.objectives.map((objective, index) => (
                    <Card key={index} className="p-4">
                      <div className="flex items-start gap-3">
                        <Target className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <h4 className="font-medium mb-1">Objetivo {index + 1}</h4>
                          <p className="text-sm text-gray-600">{objective}</p>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="progress" className="mt-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card className="p-6 text-center">
                    <Trophy className="h-8 w-8 text-yellow-600 mx-auto mb-4" />
                    <div className="text-2xl font-bold mb-2">{course.progress}%</div>
                    <div className="text-sm text-gray-600">Completado</div>
                  </Card>
                  <Card className="p-6 text-center">
                    <Clock className="h-8 w-8 text-blue-600 mx-auto mb-4" />
                    <div className="text-2xl font-bold mb-2">{Math.round(course.duration * course.progress / 100)} min</div>
                    <div className="text-sm text-gray-600">Tiempo invertido</div>
                  </Card>
                  <Card className="p-6 text-center">
                    <Star className="h-8 w-8 text-green-600 mx-auto mb-4" />
                    <div className="text-2xl font-bold mb-2">{Math.round(course.lessons * course.progress / 100)}</div>
                    <div className="text-sm text-gray-600">Lecciones completadas</div>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <Card className="border-0.5 border-black rounded-[10px] bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardContent className="p-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              🎓 Academia CRM Profesional
            </h1>
            <p className="text-lg text-gray-600 mb-6 max-w-2xl mx-auto">
              Domina todas las funcionalidades del CRM con cursos escritos por expertos, 
              ejercicios prácticos y certificaciones oficiales.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">24</div>
                <div className="text-sm text-gray-600">Cursos</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">8</div>
                <div className="text-sm text-gray-600">Certificaciones</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">156</div>
                <div className="text-sm text-gray-600">Estudiantes</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">89%</div>
                <div className="text-sm text-gray-600">Satisfacción</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {mockCoursesData.map((course) => (
          <Card 
            key={course.id} 
            className="border-0.5 border-black rounded-[10px] hover:shadow-lg transition-all duration-200 hover:-translate-y-1 cursor-pointer"
            onClick={() => setSelectedCourse(course.id)}
          >
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between mb-4">
                <div className="text-3xl">{course.icon}</div>
                <Badge className={getLevelColor(course.level)}>
                  {getLevelText(course.level)}
                </Badge>
              </div>
              <CardTitle className="line-clamp-2">{course.title}</CardTitle>
              <p className="text-sm text-gray-600 line-clamp-3">{course.description}</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <BookOpen className="h-4 w-4" />
                    {course.lessons} lecciones
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {course.duration} min
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Progreso</span>
                    <span className="font-medium">{course.progress}%</span>
                  </div>
                  <Progress value={course.progress} className="h-2" />
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-xs text-gray-500">{course.category}</div>
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <Card className="border-0.5 border-black rounded-[10px]">
        <CardHeader>
          <CardTitle>Acciones Rápidas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="h-auto p-4 flex-col">
              <Trophy className="h-6 w-6 mb-2" />
              <div className="font-medium">Ver Certificados</div>
              <div className="text-xs text-gray-600">Descarga tus logros</div>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex-col">
              <Target className="h-6 w-6 mb-2" />
              <div className="font-medium">Mi Progreso</div>
              <div className="text-xs text-gray-600">Seguimiento detallado</div>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex-col">
              <BookOpen className="h-6 w-6 mb-2" />
              <div className="font-medium">Biblioteca</div>
              <div className="text-xs text-gray-600">Recursos adicionales</div>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
