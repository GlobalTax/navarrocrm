
import React from 'react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Shield, CheckCircle, AlertTriangle, ExternalLink } from 'lucide-react'
import { useApp } from '@/contexts/AppContext'
import { REAL_SECURITY_ISSUES, RESOLVED_CRITICAL_ISSUES } from '@/components/security/SecurityIssuesData'

export const DashboardSecurityAlert = () => {
  const { user } = useApp()

  // Solo mostrar para usuarios con roles administrativos
  if (!user || !['partner', 'admin'].includes(user.role || '')) {
    return null
  }

  const pendingWarnings = REAL_SECURITY_ISSUES.length
  const resolvedCritical = RESOLVED_CRITICAL_ISSUES.length

  const handleOpenSecurityPanel = () => {
    // Navegar al panel de seguridad si existe una ruta específica
    window.location.href = '/security'
  }

  const handleOpenSupabase = () => {
    window.open('https://supabase.com/dashboard/project/jzbbbwfnzpwxmuhpbdya/auth', '_blank')
  }

  return (
    <Alert className="border-green-200 bg-green-50 mb-6">
      <Shield className="h-4 w-4 text-green-600" />
      <AlertTitle className="text-green-800">Estado de Seguridad Actualizado</AlertTitle>
      <AlertDescription className="text-green-700">
        <div className="mt-2 space-y-2">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <span className="font-medium">Se han corregido {resolvedCritical} vulnerabilidades críticas de SQL injection</span>
          </div>
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-yellow-600" />
            <span>Quedan {pendingWarnings} configuraciones de seguridad por revisar (warnings)</span>
          </div>
          <div className="flex gap-2 mt-3">
            <Button variant="outline" size="sm" onClick={handleOpenSupabase}>
              <ExternalLink className="w-3 h-3 mr-1" />
              Configurar Autenticación
            </Button>
          </div>
          <div className="text-xs text-green-600 mt-2">
            Datos actualizados según linter de Supabase - 26 Jun 2025
          </div>
        </div>
      </AlertDescription>
    </Alert>
  )
}
