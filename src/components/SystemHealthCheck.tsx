
import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/auth'
import { supabase } from '@/integrations/supabase/client'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react'

interface HealthCheck {
  name: string
  status: 'checking' | 'success' | 'error'
  message?: string
}

export const SystemHealthCheck = () => {
  const { user, session } = useAuth()
  const [checks, setChecks] = useState<HealthCheck[]>([
    { name: 'Autenticación', status: 'checking' },
    { name: 'Base de Datos', status: 'checking' },
    { name: 'Organizaciones', status: 'checking' },
    { name: 'Contactos', status: 'checking' }
  ])

  useEffect(() => {
    const runHealthChecks = async () => {
      // Check 1: Authentication
      setChecks(prev => prev.map(check => 
        check.name === 'Autenticación' 
          ? { ...check, status: user && session ? 'success' : 'error', message: user ? 'Usuario autenticado' : 'Sin autenticación' }
          : check
      ))

      if (!user?.org_id) return

      // Check 2: Database connection
      try {
        const { error } = await supabase.from('organizations').select('id').limit(1)
        setChecks(prev => prev.map(check => 
          check.name === 'Base de Datos' 
            ? { ...check, status: error ? 'error' : 'success', message: error ? error.message : 'Conexión OK' }
            : check
        ))
      } catch (error) {
        setChecks(prev => prev.map(check => 
          check.name === 'Base de Datos' 
            ? { ...check, status: 'error', message: 'Error de conexión' }
            : check
        ))
      }

      // Check 3: Organizations table
      try {
        const { data, error } = await supabase
          .from('organizations')
          .select('id')
          .eq('id', user.org_id)
          .single()
        
        setChecks(prev => prev.map(check => 
          check.name === 'Organizaciones' 
            ? { ...check, status: data ? 'success' : 'error', message: data ? 'Organización encontrada' : 'Organización no encontrada' }
            : check
        ))
      } catch (error) {
        setChecks(prev => prev.map(check => 
          check.name === 'Organizaciones' 
            ? { ...check, status: 'error', message: 'Error consultando organización' }
            : check
        ))
      }

      // Check 4: Contacts table access
      try {
        const { data, error } = await supabase
          .from('contacts')
          .select('id')
          .eq('org_id', user.org_id)
          .limit(1)
        
        setChecks(prev => prev.map(check => 
          check.name === 'Contactos' 
            ? { ...check, status: error ? 'error' : 'success', message: error ? error.message : 'Acceso a contactos OK' }
            : check
        ))
      } catch (error) {
        setChecks(prev => prev.map(check => 
          check.name === 'Contactos' 
            ? { ...check, status: 'error', message: 'Error accediendo contactos' }
            : check
        ))
      }
    }

    if (user) {
      runHealthChecks()
    }
  }, [user, session])

  const getIcon = (status: HealthCheck['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-600" />
      default:
        return <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
    }
  }

  const allSuccess = checks.every(check => check.status === 'success')
  const hasErrors = checks.some(check => check.status === 'error')

  if (!user) return null

  return (
    <Alert className={`mb-4 ${allSuccess ? 'border-green-200 bg-green-50' : hasErrors ? 'border-red-200 bg-red-50' : 'border-blue-200 bg-blue-50'}`}>
      <AlertDescription>
        <div className="space-y-2">
          <h4 className="font-medium text-sm">Estado del Sistema</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {checks.map((check) => (
              <div key={check.name} className="flex items-center gap-2 text-sm">
                {getIcon(check.status)}
                <span className="font-medium">{check.name}:</span>
                <span className={check.status === 'success' ? 'text-green-700' : check.status === 'error' ? 'text-red-700' : 'text-blue-700'}>
                  {check.message || check.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </AlertDescription>
    </Alert>
  )
}
