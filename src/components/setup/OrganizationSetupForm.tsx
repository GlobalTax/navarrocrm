
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { supabase } from '@/integrations/supabase/client'
import { useToast } from '@/hooks/use-toast'

interface OrganizationSetupFormProps {
  onSuccess: (orgName: string) => void
}

export const OrganizationSetupForm = ({ onSuccess }: OrganizationSetupFormProps) => {
  const [loading, setLoading] = useState(false)
  const [orgName, setOrgName] = useState('')
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!orgName.trim()) {
      toast({
        title: "Error",
        description: "Por favor, introduce el nombre de la organización",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      console.log('Creando organización:', orgName)
      
      // Crear la organización directamente (sin verificar duplicados por ahora)
      const { data: orgResult, error: orgError } = await supabase
        .from('organizations')
        .insert({
          name: orgName.trim()
        })
        .select()
        .single()

      if (orgError) {
        console.error('Error creando organización:', orgError)
        
        // Manejar error de nombre duplicado
        if (orgError.message?.includes('duplicate') || orgError.code === '23505') {
          toast({
            title: "Error",
            description: "Ya existe una organización con ese nombre. Por favor, elige otro nombre.",
            variant: "destructive",
          })
          return
        }
        
        throw new Error(`Error al crear organización: ${orgError.message}`)
      }

      console.log('Organización creada exitosamente:', orgResult)
      
      toast({
        title: "Organización creada",
        description: `${orgName} ha sido creada exitosamente`,
      })
      
      onSuccess(orgName)
    } catch (error: any) {
      console.error('Error en handleSubmit:', error)
      toast({
        title: "Error",
        description: error.message || "No se pudo crear la organización",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="orgName">Nombre de la Organización</Label>
        <Input
          id="orgName"
          type="text"
          value={orgName}
          onChange={(e) => setOrgName(e.target.value)}
          required
          placeholder="Ej: Mi Asesoría Legal"
          maxLength={100}
        />
        <p className="text-xs text-gray-500">
          Este nombre identificará tu organización en el sistema.
        </p>
      </div>
      
      <Button type="submit" className="w-full" disabled={loading || !orgName.trim()}>
        {loading ? 'Creando organización...' : 'Crear Organización'}
      </Button>
    </form>
  )
}
