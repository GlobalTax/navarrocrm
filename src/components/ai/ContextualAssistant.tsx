
import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useLocation } from 'react-router-dom'
import { 
  Bot, 
  FileText, 
  Users, 
  Calendar, 
  Clock, 
  DollarSign,
  Lightbulb,
  Zap
} from 'lucide-react'

interface ContextualSuggestion {
  id: string
  title: string
  description: string
  action: string
  icon: React.ReactNode
  priority: 'high' | 'medium' | 'low'
}

export const ContextualAssistant = () => {
  const location = useLocation()
  const [suggestions, setSuggestions] = useState<ContextualSuggestion[]>([])

  useEffect(() => {
    generateContextualSuggestions()
  }, [location.pathname])

  const generateContextualSuggestions = () => {
    const path = location.pathname
    let newSuggestions: ContextualSuggestion[] = []

    switch (true) {
      case path.includes('/clients'):
        newSuggestions = [
          {
            id: 'client-follow-up',
            title: 'Seguimiento Automático',
            description: 'Configurar recordatorios para contactar clientes inactivos',
            action: 'setup-client-follow-up',
            icon: <Users className="h-4 w-4" />,
            priority: 'high'
          },
          {
            id: 'client-segmentation',
            title: 'Segmentación Inteligente',
            description: 'Agrupar clientes por rentabilidad y potencial',
            action: 'segment-clients',
            icon: <Lightbulb className="h-4 w-4" />,
            priority: 'medium'
          },
          {
            id: 'export-client-data',
            title: 'Análisis de Datos',
            description: 'Exportar datos para análisis avanzado',
            action: 'export-client-analytics',
            icon: <FileText className="h-4 w-4" />,
            priority: 'low'
          }
        ]
        break

      case path.includes('/cases'):
        newSuggestions = [
          {
            id: 'case-templates',
            title: 'Plantillas Inteligentes',
            description: 'Crear plantillas basadas en casos exitosos',
            action: 'create-case-templates',
            icon: <FileText className="h-4 w-4" />,
            priority: 'high'
          },
          {
            id: 'deadline-alerts',
            title: 'Alertas de Plazos',
            description: 'Configurar avisos automáticos para deadlines legales',
            action: 'setup-deadline-alerts',
            icon: <Clock className="h-4 w-4" />,
            priority: 'high'
          },
          {
            id: 'case-automation',
            title: 'Automatización de Flujos',
            description: 'Automatizar creación de tareas según tipo de caso',
            action: 'setup-case-automation',
            icon: <Zap className="h-4 w-4" />,
            priority: 'medium'
          }
        ]
        break

      case path.includes('/proposals'):
        newSuggestions = [
          {
            id: 'pricing-optimization',
            title: 'Optimización de Precios',
            description: 'Analizar precios competitivos y sugerir ajustes',
            action: 'optimize-pricing',
            icon: <DollarSign className="h-4 w-4" />,
            priority: 'high'
          },
          {
            id: 'proposal-templates',
            title: 'Plantillas Ganadoras',
            description: 'Crear plantillas basadas en propuestas exitosas',
            action: 'create-winning-templates',
            icon: <FileText className="h-4 w-4" />,
            priority: 'medium'
          },
          {
            id: 'follow-up-automation',
            title: 'Seguimiento Automático',
            description: 'Automatizar recordatorios para propuestas pendientes',
            action: 'setup-proposal-follow-up',
            icon: <Calendar className="h-4 w-4" />,
            priority: 'medium'
          }
        ]
        break

      case path.includes('/tasks'):
        newSuggestions = [
          {
            id: 'task-automation',
            title: 'Creación Automática',
            description: 'Configurar tareas automáticas por tipo de caso',
            action: 'setup-task-automation',
            icon: <Zap className="h-4 w-4" />,
            priority: 'high'
          },
          {
            id: 'workload-balance',
            title: 'Balance de Carga',
            description: 'Optimizar distribución de tareas entre el equipo',
            action: 'balance-workload',
            icon: <Users className="h-4 w-4" />,
            priority: 'medium'
          }
        ]
        break

      default:
        newSuggestions = [
          {
            id: 'dashboard-insights',
            title: 'Insights Personalizados',
            description: 'Configurar métricas clave para tu despacho',
            action: 'setup-custom-insights',
            icon: <Lightbulb className="h-4 w-4" />,
            priority: 'medium'
          }
        ]
    }

    setSuggestions(newSuggestions)
  }

  const handleSuggestionAction = (action: string) => {
    // Implementation would handle specific actions
    console.log('Executing action:', action)
    
    // For demo purposes, show different messages based on action
    const actionMessages: Record<string, string> = {
      'setup-client-follow-up': 'Configurando sistema de seguimiento de clientes...',
      'segment-clients': 'Iniciando segmentación inteligente de clientes...',
      'create-case-templates': 'Analizando casos exitosos para crear plantillas...',
      'setup-deadline-alerts': 'Configurando alertas de plazos legales...',
      'optimize-pricing': 'Analizando precios del mercado...',
      'setup-task-automation': 'Configurando automatización de tareas...'
    }

    const message = actionMessages[action] || 'Procesando sugerencia...'
    // Here you would integrate with your toast system or show a loading state
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive'
      case 'medium': return 'default'
      case 'low': return 'secondary'
      default: return 'default'
    }
  }

  if (suggestions.length === 0) {
    return null
  }

  return (
    <Card className="border-blue-200 bg-blue-50/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-blue-800">
          <Bot className="h-5 w-5" />
          Asistente Contextual
        </CardTitle>
        <CardDescription className="text-blue-600">
          Sugerencias inteligentes para esta página
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {suggestions.map((suggestion) => (
          <div
            key={suggestion.id}
            className="flex items-start justify-between p-3 bg-white rounded-lg border"
          >
            <div className="flex items-start gap-3">
              <div className="mt-0.5 text-blue-600">
                {suggestion.icon}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold text-sm">{suggestion.title}</h4>
                  <Badge variant={getPriorityColor(suggestion.priority)} className="text-xs">
                    {suggestion.priority}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600">{suggestion.description}</p>
              </div>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleSuggestionAction(suggestion.action)}
              className="ml-4"
            >
              Aplicar
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
