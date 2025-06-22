
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertTriangle } from 'lucide-react'

export const TestRecommendations = () => {
  return (
    <div className="space-y-3">
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          <strong>Configuración Inicial:</strong> Asegúrate de que las credenciales de Azure AD estén configuradas en el panel de administración.
        </AlertDescription>
      </Alert>
      
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          <strong>Autenticación:</strong> Los usuarios deben autenticarse con Outlook desde la página de configuración personal.
        </AlertDescription>
      </Alert>
      
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          <strong>Edge Functions:</strong> Despliega las funciones de Supabase para habilitar la sincronización automática.
        </AlertDescription>
      </Alert>
    </div>
  )
}
