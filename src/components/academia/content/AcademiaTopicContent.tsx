
import React from 'react'
import { Play, BookOpen, CheckCircle, Clock, FileText, Video } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'

interface AcademiaTopicContentProps {
  topic: string
}

export function AcademiaTopicContent({ topic }: AcademiaTopicContentProps) {
  // Ejemplo de contenido para clientes
  const topicContent = {
    clientes: {
      title: 'Gestión de Clientes',
      description: 'Aprende a gestionar eficientemente la información de tus clientes, desde el alta inicial hasta el seguimiento continuo.',
      progress: 60,
      lessons: [
        {
          id: 1,
          title: 'Crear nuevo cliente',
          type: 'video',
          duration: '8 min',
          completed: true,
          description: 'Proceso completo para dar de alta un cliente en el sistema'
        },
        {
          id: 2,
          title: 'Búsqueda y filtrado',
          type: 'interactive',
          duration: '5 min',
          completed: true,
          description: 'Técnicas avanzadas de búsqueda y organización'
        },
        {
          id: 3,
          title: 'Gestión de documentos',
          type: 'guide',
          duration: '12 min',
          completed: false,
          description: 'Subir, organizar y gestionar documentos del cliente'
        },
        {
          id: 4,
          title: 'Notas y seguimiento',
          type: 'video',
          duration: '6 min',
          completed: false,
          description: 'Sistema de notas y timeline de actividades'
        },
        {
          id: 5,
          title: 'Importación masiva',
          type: 'guide',
          duration: '15 min',
          completed: false,
          description: 'Importar múltiples clientes desde Excel/CSV'
        }
      ]
    }
  }

  const content = topicContent[topic as keyof typeof topicContent] || {
    title: 'Contenido en desarrollo',
    description: 'Este contenido estará disponible próximamente.',
    progress: 0,
    lessons: []
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return Video
      case 'guide': return FileText
      case 'interactive': return Play
      default: return BookOpen
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl mb-2">{content.title}</CardTitle>
              <p className="text-gray-600">{content.description}</p>
            </div>
            <Badge variant="outline" className="ml-4">
              {content.lessons.length} lecciones
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Progreso del curso</span>
                <span>{content.progress}%</span>
              </div>
              <Progress value={content.progress} className="h-2" />
            </div>
            <Button size="lg">
              <Play className="h-5 w-5 mr-2" />
              Continuar aprendiendo
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Lessons List */}
      <Card>
        <CardHeader>
          <CardTitle>Contenido del curso</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {content.lessons.map((lesson) => {
              const Icon = getTypeIcon(lesson.type)
              return (
                <div
                  key={lesson.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
                >
                  <div className="flex items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                      lesson.completed ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {lesson.completed ? (
                        <CheckCircle className="h-4 w-4" />
                      ) : (
                        <Icon className="h-4 w-4" />
                      )}
                    </div>
                    <div>
                      <h4 className="font-medium">{lesson.title}</h4>
                      <p className="text-sm text-gray-600">{lesson.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Clock className="h-4 w-4 mr-1" />
                    {lesson.duration}
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Additional Resources */}
      <Card>
        <CardHeader>
          <CardTitle>Recursos adicionales</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">📄 Documentación completa</h4>
              <p className="text-sm text-gray-600 mb-3">
                Guía de referencia detallada con todas las funcionalidades
              </p>
              <Button variant="outline" size="sm">Ver documentación</Button>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">💬 Foro de preguntas</h4>
              <p className="text-sm text-gray-600 mb-3">
                Resuelve dudas con otros usuarios y expertos
              </p>
              <Button variant="outline" size="sm">Ir al foro</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
