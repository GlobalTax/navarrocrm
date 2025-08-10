
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, Circle, ArrowRight } from 'lucide-react'
import { useApp } from '@/contexts/AppContext'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { Link } from 'react-router-dom'

interface SetupStep {
  id: string
  title: string
  description: string
  completed: boolean
  action?: {
    label: string
    href?: string
    onClick?: () => void
  }
}

export const QuickSetupGuide = () => {
  const { user } = useApp()

  const { data: setupStatus } = useQuery({
    queryKey: ['setup-status', user?.org_id, user?.id],
    queryFn: async () => {
      if (!user?.org_id) return null

      // Check organization configuration
      const { data: orgConfig } = await supabase
        .from('organization_integrations')
        .select('*')
        .eq('org_id', user.org_id)
        .eq('integration_type', 'outlook')
        .maybeSingle()

      // Check user tokens
      const { data: userTokens } = await supabase
        .from('user_outlook_tokens')
        .select('*')
        .eq('user_id', user.id)
        .eq('org_id', user.org_id)
        .eq('is_active', true)

      return {
        orgConfigured: !!(orgConfig?.outlook_client_id && orgConfig?.outlook_tenant_id),
        integrationEnabled: orgConfig?.is_enabled || false,
        userConnected: (userTokens?.length || 0) > 0,
        validToken: userTokens?.[0] ? new Date(userTokens[0].token_expires_at) > new Date() : false
      }
    },
    enabled: !!user?.org_id && !!user?.id
  })

  const steps: SetupStep[] = [
    {
      id: 'azure-config',
      title: 'Configurar Azure AD',
      description: 'Configura las credenciales de Azure AD en el panel de administración',
      completed: setupStatus?.orgConfigured || false,
      action: {
        label: 'Ir a Configuración',
        href: '/integrations'
      }
    },
    {
      id: 'enable-integration',
      title: 'Habilitar Integración',
      description: 'Activa la integración de Outlook para tu organización',
      completed: setupStatus?.integrationEnabled || false,
      action: {
        label: 'Habilitar',
        href: '/integrations'
      }
    },
    {
      id: 'user-connection',
      title: 'Conectar Cuenta',
      description: 'Conecta tu cuenta personal de Outlook',
      completed: setupStatus?.userConnected || false,
      action: {
        label: 'Conectar',
        href: '/integrations'
      }
    },
    {
      id: 'test-sync',
      title: 'Probar Sincronización',
      description: 'Crea un evento de calendario para probar la sincronización',
      completed: setupStatus?.validToken || false,
      action: {
        label: 'Ir a Calendario',
        href: '/calendar'
      }
    }
  ]

  const completedSteps = steps.filter(step => step.completed).length
  const progress = (completedSteps / steps.length) * 100

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Guía de Configuración Rápida</CardTitle>
          <Badge variant={completedSteps === steps.length ? 'default' : 'secondary'}>
            {completedSteps}/{steps.length} completado
          </Badge>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center gap-4 p-3 rounded-lg border">
              <div className="flex-shrink-0">
                {step.completed ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <Circle className="h-5 w-5 text-gray-400" />
                )}
              </div>
              
              <div className="flex-1">
                <h4 className={`font-medium ${step.completed ? 'text-green-700' : 'text-gray-900'}`}>
                  {step.title}
                </h4>
                <p className="text-sm text-gray-600">{step.description}</p>
              </div>
              
              {step.action && !step.completed && (
                <Button size="sm" variant="outline" asChild>
                  <Link to={step.action.href} className="flex items-center gap-2">
                    {step.action.label}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              )}
            </div>
          ))}
        </div>
        
        {completedSteps === steps.length && (
          <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center gap-2 text-green-700">
              <CheckCircle className="h-5 w-5" />
              <span className="font-medium">¡Configuración completada!</span>
            </div>
            <p className="text-sm text-green-600 mt-1">
              Tu integración con Outlook está lista. Puedes crear eventos y enviar invitaciones automáticamente.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
