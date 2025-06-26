
import React from 'react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Shield, AlertTriangle, ExternalLink } from 'lucide-react'
import { useApp } from '@/contexts/AppContext'

export const DashboardSecurityAlert = () => {
  const { user } = useApp()

  // Solo mostrar para usuarios con roles administrativos
  if (!user || !['partner', 'admin'].includes(user.role || '')) {
    return null
  }

  const handleOpenSecurityPanel = () => {
    // Navegar al panel de seguridad si existe una ruta específica
    window.location.href = '/security'
  }

  const handleOpenSupabase = () => {
    window.open('https://supabase.com/dashboard/project/jzbbbwfnzpwxmuhpbdya/auth', '_blank')
  }

  return (
    <Alert className="border-amber-200 bg-amber-50 mb-6">
      <Shield className="h-4 w-4 text-amber-600" />
      <AlertTitle className="text-amber-800">Correcciones de Seguridad Aplicadas</AlertTitle>
      <AlertDescription className="text-amber-700">
        <div className="mt-2 space-y-2">
          <p>✅ Se han corregido 5 vulnerabilidades críticas de SQL injection</p>
          <p>⚠️ Quedan 5 configuraciones de seguridad pendientes por revisar</p>
          <div className="flex gap-2 mt-3">
            <Button variant="outline" size="sm" onClick={handleOpenSupabase}>
              <ExternalLink className="w-3 h-3 mr-1" />
              Configurar Autenticación
            </Button>
          </div>
        </div>
      </AlertDescription>
    </Alert>
  )
}
