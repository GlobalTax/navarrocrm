
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { supabase } from '@/integrations/supabase/client'
import { useToast } from '@/hooks/use-toast'

export default function Setup() {
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState(1)
  const [orgData, setOrgData] = useState({
    name: 'WebCapital'
  })
  const [userData, setUserData] = useState({
    email: '',
    password: '',
    role: 'partner' as const
  })
  
  const navigate = useNavigate()
  const { toast } = useToast()

  const handleCreateOrg = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Crear la organización
      const { data: orgResult, error: orgError } = await supabase
        .from('organizations')
        .insert({
          name: orgData.name
        })
        .select()
        .single()

      if (orgError) throw orgError

      console.log('Organización creada:', orgResult)
      
      toast({
        title: "Organización creada",
        description: `${orgData.name} ha sido creada exitosamente`,
      })
      
      setStep(2)
    } catch (error: any) {
      console.error('Error creando organización:', error)
      toast({
        title: "Error",
        description: error.message || "No se pudo crear la organización",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Obtener la organización creada
      const { data: org, error: orgError } = await supabase
        .from('organizations')
        .select('id')
        .eq('name', orgData.name)
        .single()

      if (orgError) throw orgError

      // Registrar usuario en Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`
        }
      })

      if (authError) throw authError

      if (authData.user) {
        // Crear perfil de usuario
        const { error: profileError } = await supabase
          .from('users')
          .insert({
            id: authData.user.id,
            email: userData.email,
            role: userData.role,
            org_id: org.id
          })

        if (profileError) throw profileError

        console.log('Usuario creado y vinculado a organización')
        
        toast({
          title: "Configuración completada",
          description: "Sistema configurado exitosamente. Ya puedes iniciar sesión.",
        })

        // Redirigir al login
        navigate('/login')
      }
    } catch (error: any) {
      console.error('Error creando usuario:', error)
      toast({
        title: "Error",
        description: error.message || "No se pudo crear el usuario",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Configuración Inicial</CardTitle>
          <CardDescription>
            {step === 1 ? 'Configura tu organización' : 'Crea el usuario administrador'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === 1 ? (
            <form onSubmit={handleCreateOrg} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="orgName">Nombre de la Organización</Label>
                <Input
                  id="orgName"
                  type="text"
                  value={orgData.name}
                  onChange={(e) => setOrgData({ ...orgData, name: e.target.value })}
                  required
                  placeholder="Nombre de tu asesoría"
                />
              </div>
              
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Creando organización...' : 'Crear Organización'}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email del Administrador</Label>
                <Input
                  id="email"
                  type="email"
                  value={userData.email}
                  onChange={(e) => setUserData({ ...userData, email: e.target.value })}
                  required
                  placeholder="admin@tuempresa.com"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <Input
                  id="password"
                  type="password"
                  value={userData.password}
                  onChange={(e) => setUserData({ ...userData, password: e.target.value })}
                  required
                  placeholder="Mínimo 6 caracteres"
                  minLength={6}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Rol</Label>
                <Select value={userData.role} onValueChange={(value: any) => setUserData({ ...userData, role: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="partner">Partner (Administrador)</SelectItem>
                    <SelectItem value="area_manager">Gerente de Área</SelectItem>
                    <SelectItem value="senior">Senior</SelectItem>
                    <SelectItem value="junior">Junior</SelectItem>
                    <SelectItem value="finance">Finanzas</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Creando usuario...' : 'Crear Usuario'}
              </Button>
              
              <Button 
                type="button" 
                variant="ghost" 
                className="w-full" 
                onClick={() => setStep(1)}
                disabled={loading}
              >
                Volver
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
