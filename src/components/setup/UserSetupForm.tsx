
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { supabase } from '@/integrations/supabase/client'
import { useToast } from '@/hooks/use-toast'

interface UserSetupFormProps {
  orgName: string
  onBack: () => void
}

export const UserSetupForm = ({ orgName, onBack }: UserSetupFormProps) => {
  const [loading, setLoading] = useState(false)
  const [userData, setUserData] = useState({
    email: '',
    password: '',
    role: 'partner' as const
  })
  
  const navigate = useNavigate()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
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

      // Obtener la organización creada usando una consulta simple
      const { data: orgData, error: orgError } = await supabase
        .from('organizations')
        .select('id')
        .eq('name', orgName)
        .single()

      if (orgError) {
        console.error('Error obteniendo organización:', orgError)
        throw new Error('No se pudo encontrar la organización. Por favor, vuelve al paso anterior.')
      }

      if (!orgData) {
        throw new Error('Organización no encontrada')
      }

      console.log('Organización encontrada:', orgData)

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

      if (authData.user && orgData.id) {
        // Crear perfil de usuario
        const { error: profileError } = await supabase
          .from('users')
          .insert({
            id: authData.user.id,
            email: userData.email.trim(),
            role: userData.role,
            org_id: orgData.id
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
      console.error('Error en handleSubmit:', error)
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
    <form onSubmit={handleSubmit} className="space-y-4">
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
        <p><strong>Organización:</strong> {orgName}</p>
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
        onClick={onBack}
        disabled={loading}
      >
        Volver
      </Button>
    </form>
  )
}
