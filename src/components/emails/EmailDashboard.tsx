import { Suspense } from 'react'
import { StandardPageContainer } from '@/components/layout/StandardPageContainer'
import { StandardPageHeader } from '@/components/layout/StandardPageHeader'
import { useEmailMetrics } from '@/hooks/useEmailMetrics'
import { EmailConnectionStatus } from '@/components/emails/EmailConnectionStatus'
import { EmailMetricsCards } from '@/components/emails/EmailMetricsCards'
import { RecentEmailsList } from '@/components/emails/RecentEmailsList'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Mail, PenTool, Send, Settings } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '@/contexts/AppContext'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle } from 'lucide-react'

export function EmailDashboard() {
  const navigate = useNavigate()
  const { user, session, authLoading } = useApp()
  
  console.log('📧 [EmailDashboard] Estado de autenticación:', {
    authLoading,
    hasUser: !!user,
    hasSession: !!session,
    userId: user?.id,
    orgId: user?.org_id
  })
  
  // Mientras se está cargando la autenticación
  if (authLoading) {
    return (
      <StandardPageContainer>
        <div className="space-y-6">
          <StandardPageHeader
            title="Dashboard de Emails"
            description="Cargando..."
          />
          <div className="space-y-4">
            <Skeleton className="h-20 w-full" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
          </div>
        </div>
      </StandardPageContainer>
    )
  }
  
  // Si no hay sesión válida, redirigir al login
  if (!session || !user) {
    console.log('⚠️ [EmailDashboard] Sesión no válida, redirigiendo al login')
    navigate('/login', { 
      replace: true,
      state: { from: { pathname: '/emails/dashboard' } }
    })
    return null
  }
  
  // Verificar si el usuario tiene datos completos
  if (!user.id || !user.org_id) {
    return (
      <StandardPageContainer>
        <div className="space-y-6">
          <StandardPageHeader
            title="Dashboard de Emails"
            description="Completando configuración del usuario..."
          />
          <Alert className="border-0.5 border-black rounded-[10px]">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Los datos del usuario están incompletos. Por favor, contacte al administrador.
            </AlertDescription>
          </Alert>
        </div>
      </StandardPageContainer>
    )
  }

  return <EmailDashboardContent />
}

function EmailDashboardContent() {
  const navigate = useNavigate()
  
  // Hook para métricas de email con manejo de errores
  let emailMetrics
  
  try {
    emailMetrics = useEmailMetrics()
  } catch (error) {
    console.error('Error en useEmailMetrics:', error)
    emailMetrics = {
      metrics: null,
      isLoading: false,
      error: error as Error
    }
  }

  return (
    <StandardPageContainer>
      <div className="space-y-6">
        <div className="mb-8">
          <StandardPageHeader
            title="Dashboard de Emails"
            description="Gestión y análisis de comunicaciones por email con Nylas"
          />
        </div>

        {/* Estado de conexión */}
        <div className="grid grid-cols-1 gap-6 mb-8">
          <EmailConnectionStatus />
        </div>

        {/* Navegación rápida */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Button 
            variant="outline" 
            className="h-20 flex flex-col space-y-2 hover:bg-gray-50 border-0.5 border-black rounded-[10px]"
            onClick={() => navigate('/emails/inbox')}
          >
            <Mail className="h-6 w-6" />
            <span>Bandeja de Entrada</span>
          </Button>
          
          <Button 
            variant="outline" 
            className="h-20 flex flex-col space-y-2 hover:bg-gray-50 border-0.5 border-black rounded-[10px]"
            onClick={() => navigate('/emails/compose')}
          >
            <PenTool className="h-6 w-6" />
            <span>Nuevo Email</span>
          </Button>
          
          <Button 
            variant="outline" 
            className="h-20 flex flex-col space-y-2 hover:bg-gray-50 border-0.5 border-black rounded-[10px]"
            onClick={() => navigate('/emails/sent')}
          >
            <Send className="h-6 w-6" />
            <span>Enviados</span>
          </Button>
          
          <Button 
            variant="outline" 
            className="h-20 flex flex-col space-y-2 hover:bg-gray-50 border-0.5 border-black rounded-[10px]"
            onClick={() => navigate('/emails/settings')}
          >
            <Settings className="h-6 w-6" />
            <span>Configuración</span>
          </Button>
        </div>

        {/* Métricas y lista de emails recientes */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <EmailMetricsCards 
              metrics={emailMetrics.metrics} 
              isLoading={emailMetrics.isLoading}
            />
          </div>
          <div className="lg:col-span-2">
            <RecentEmailsList />
          </div>
        </div>
      </div>
    </StandardPageContainer>
  )
}