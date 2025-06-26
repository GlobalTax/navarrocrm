
import React from 'react'
import { Button } from '@/components/ui/button'
import { ExternalLink, Settings, Database, Shield } from 'lucide-react'
import { toast } from 'sonner'

interface SecurityActionButtonsProps {
  issueType: string
  title: string
  remediationUrl?: string
}

export const SecurityActionButtons: React.FC<SecurityActionButtonsProps> = ({ 
  issueType, 
  title, 
  remediationUrl 
}) => {
  const handleSupabaseDashboard = () => {
    window.open('https://supabase.com/dashboard/project/jzbbbwfnzpwxmuhpbdya/auth', '_blank')
    toast.info('Abriendo Dashboard de Supabase - Configuración de Auth')
  }

  const handleDatabaseDashboard = () => {
    window.open('https://supabase.com/dashboard/project/jzbbbwfnzpwxmuhpbdya/editor', '_blank')
    toast.info('Abriendo Editor SQL de Supabase')
  }

  const handleRemediationDocs = () => {
    if (remediationUrl) {
      window.open(remediationUrl, '_blank')
      toast.info('Abriendo documentación de corrección')
    }
  }

  // Botones específicos según el tipo de problema
  if (issueType.includes('auth_')) {
    return (
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={handleSupabaseDashboard}>
          <Settings className="w-3 h-3 mr-1" />
          Configurar Auth
        </Button>
        {remediationUrl && (
          <Button variant="outline" size="sm" onClick={handleRemediationDocs}>
            <ExternalLink className="w-3 h-3 mr-1" />
            Documentación
          </Button>
        )}
      </div>
    )
  }

  if (issueType.includes('materialized_view') || issueType.includes('foreign_table')) {
    return (
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={handleDatabaseDashboard}>
          <Database className="w-3 h-3 mr-1" />
          Editor SQL
        </Button>
        {remediationUrl && (
          <Button variant="outline" size="sm" onClick={handleRemediationDocs}>
            <ExternalLink className="w-3 h-3 mr-1" />
            Documentación
          </Button>
        )}
      </div>
    )
  }

  // Botón genérico para otros casos
  return (
    <div className="flex gap-2">
      {remediationUrl && (
        <Button variant="outline" size="sm" onClick={handleRemediationDocs}>
          <ExternalLink className="w-3 h-3 mr-1" />
          Ver Documentación
        </Button>
      )}
    </div>
  )
}
