
import React from 'react'
import { Play, BookOpen, CheckCircle, Clock, FileText, Video } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { useIsMobile } from '@/hooks/use-mobile'

interface AcademiaTopicContentProps {
  topic: string
}

export function AcademiaTopicContent({ topic }: AcademiaTopicContentProps) {
  const isMobile = useIsMobile()

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
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <Card>
        <CardHeader className="pb-3 md:pb-4">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
            <div className="flex-1">
              <CardTitle className="text-xl md:text-2xl mb-2">{content.title}</CardTitle>
              <p className="text-gray-600 text-sm md:text-base">{content.description}</p>
            </div>
            <Badge variant="outline" className="self-start">
              {content.lessons.length} lecciones
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-3 md:space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Progreso del curso</span>
                <span>{content.progress}%</span>
              </div>
              <Progress value={content.progress} className="h-2" />
            </div>
            <Button size={isMobile ? "default" : "lg"} className="w-full md:w-auto">
              <Play className="h-4 w-4 md:h-5 md:w-5 mr-2" />
              Continuar aprendiendo
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Lessons List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg md:text-xl">Contenido del curso</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 md:space-y-3">
            {content.lessons.map((lesson) => {
              const Icon = getTypeIcon(lesson.type)
              return (
                <div
                  key={lesson.id}
                  className="flex items-start md:items-center justify-between p-3 md:p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
                >
                  <div className="flex items-start md:items-center flex-1 min-w-0">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 flex-shrink-0 ${
                      lesson.completed ? 'bg-academia-success-soft text-academia-success' : 'bg-muted text-muted-foreground'
                    }`}>
                      {lesson.completed ? (
                        <CheckCircle className="h-4 w-4" />
                      ) : (
                        <Icon className="h-4 w-4" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="font-medium text-sm md:text-base mb-1">{lesson.title}</h4>
                      <p className="text-xs md:text-sm text-gray-600 line-clamp-2">{lesson.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center text-xs md:text-sm text-gray-600 ml-2 flex-shrink-0">
                    <Clock className="h-3 w-3 md:h-4 md:w-4 mr-1" />
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
          <CardTitle className="text-lg md:text-xl">Recursos adicionales</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-3 md:gap-4">
            <div className="p-3 md:p-4 border rounded-lg">
              <h4 className="font-medium mb-2 text-sm md:text-base">📄 Documentación completa</h4>
              <p className="text-xs md:text-sm text-gray-600 mb-3">
                Guía de referencia detallada con todas las funcionalidades
              </p>
              <Button variant="outline" size="sm" className="w-full md:w-auto">Ver documentación</Button>
            </div>
            <div className="p-3 md:p-4 border rounded-lg">
              <h4 className="font-medium mb-2 text-sm md:text-base">💬 Foro de preguntas</h4>
              <p className="text-xs md:text-sm text-gray-600 mb-3">
                Resuelve dudas con otros usuarios y expertos
              </p>
              <Button variant="outline" size="sm" className="w-full md:w-auto">Ir al foro</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
