
import { Button } from '@/components/ui/button'
import { Database, Loader2 } from 'lucide-react'
import { useState } from 'react'
import { seedLegalFirmData } from '@/utils/seedData'
import { toast } from 'sonner'

export const SeedDataButton = () => {
  const [isSeeding, setIsSeeding] = useState(false)

  const handleSeedData = async () => {
    setIsSeeding(true)
    try {
      const result = await seedLegalFirmData()
      if (result.success) {
        toast.success('✅ Datos ficticios creados exitosamente!')
        // Refrescar la página para mostrar los nuevos datos
        setTimeout(() => window.location.reload(), 1000)
      } else {
        toast.error('❌ Error al crear datos ficticios')
        console.error(result.error)
      }
    } catch (error) {
      toast.error('❌ Error inesperado')
      console.error(error)
    } finally {
      setIsSeeding(false)
    }
  }

  return (
    <Button 
      onClick={handleSeedData} 
      disabled={isSeeding}
      className="flex items-center space-x-2 bg-green-600 hover:bg-green-700"
    >
      {isSeeding ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Database className="h-4 w-4" />
      )}
      <span>
        {isSeeding ? 'Creando datos...' : 'Poblar con datos ficticios'}
      </span>
    </Button>
  )
}
