
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
    name: ''
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
    
    if (!orgData.name.trim()) {
      toast({
        title: "Error",
        description: "Por favor, introduce el nombre de la organización",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      console.log('Creando organización:', orgData.name)
      
      // Verificar si ya existe una organización con ese nombre
      const { data: existingOrg, error: checkError } = await supabase
        .from('organizations')
        .select('id')
        .eq('name', orgData.name)
        .single()

      if (checkError && checkError.code !== 'PGRST116') {
        // PGRST116 es "not found", cualquier otro error es problemático
        console.error('Error verificando organización existente:', checkError)
        throw checkError
      }

      if (existingOrg) {
        toast({
          title: "Error",
          description: "Ya existe una organización con ese nombre. Por favor, elige otro nombre.",
          variant: "destructive",
        })
        return
      }
      
      // Crear la organización
      const { data: orgResult, error: orgError } = await supabase
        .from('organizations')
        .insert({
          name: orgData.name.trim()
        })
        .select()
        .single()

      if (orgError) {
        console.error('Error creando organización:', orgError)
        throw orgError
      }

      console.log('Organización creada exitosamente:', orgResult)
      
      toast({
        title: "Organización creada",
        description: `${orgData.name} ha sido creada exitosamente`,
      })
      
      setStep(2)
    } catch (error: any) {
      console.error('Error en handleCreateOrg:', error)
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
    
    if (!userData.email.trim() || !userData.password.trim()) {
      toast({
        title: "Error",
        description: "Por favor, completa todos los campos obligatorios",
        variant: "destructive",
      })
      return
    }

    if (userData.password.length < 6) {
      toast({
        title: "Error",
        description: "La contraseña debe tener al menos 6 caracteres",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      console.log('Iniciando creación de usuario:', userData.email)

      // Obtener la organización creada
      const { data: org, error: orgError } = await supabase
        .from('organizations')
        .select('id')
        .eq('name', orgData.name)
        .single()

      if (orgError) {
        console.error('Error obteniendo organización:', orgError)
        throw new Error('No se pudo encontrar la organización. Por favor, vuelve al paso anterior.')
      }

      console.log('Organización encontrada:', org)

      // Registrar usuario en Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: userData.email.trim(),
        password: userData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`
        }
      })

      if (authError) {
        console.error('Error en auth.signUp:', authError)
        throw authError
      }

      console.log('Usuario de auth creado:', authData.user?.id)

      if (authData.user) {
        // Crear perfil de usuario
        const { error: profileError } = await supabase
          .from('users')
          .insert({
            id: authData.user.id,
            email: userData.email.trim(),
            role: userData.role,
            org_id: org.id
          })

        if (profileError) {
          console.error('Error creando perfil:', profileError)
          throw profileError
        }

        console.log('Perfil de usuario creado exitosamente')
        
        toast({
          title: "Configuración completada",
          description: "Sistema configurado exitosamente. Ya puedes iniciar sesión.",
        })

        // Redirigir al login
        navigate('/login')
      } else {
        throw new Error('No se pudo crear el usuario')
      }
    } catch (error: any) {
      console.error('Error en handleCreateUser:', error)
      let errorMessage = "No se pudo crear el usuario"
      
      if (error.message?.includes('User already registered')) {
        errorMessage = "Ya existe un usuario con este email"
      } else if (error.message?.includes('Password should be at least')) {
        errorMessage = "La contraseña debe tener al menos 6 caracteres"
      } else if (error.message) {
        errorMessage = error.message
      }
      
      toast({
        title: "Error",
        description: errorMessage,
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
                  placeholder="Ej: Mi Asesoría Legal"
                  maxLength={100}
                />
                <p className="text-xs text-gray-500">
                  Este nombre debe ser único y representará tu organización en el sistema.
                </p>
              </div>
              
              <Button type="submit" className="w-full" disabled={loading || !orgData.name.trim()}>
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

              <div className="bg-blue-50 p-3 rounded-md text-sm text-blue-800">
                <p><strong>Organización:</strong> {orgData.name}</p>
              </div>
              
              <Button 
                type="submit" 
                className="w-full" 
                disabled={loading || !userData.email.trim() || !userData.password.trim()}
              >
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
