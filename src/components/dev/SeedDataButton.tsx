
import { Button } from '@/components/ui/button'
import { Database, Loader2, CheckCircle, AlertCircle } from 'lucide-react'
import { useState } from 'react'
import { seedLegalFirmData } from '@/utils/seedData'
import { toast } from 'sonner'

export const SeedDataButton = () => {
  const [isSeeding, setIsSeeding] = useState(false)
  const [lastResult, setLastResult] = useState<{ success: boolean; message?: string } | null>(null)

  const handleSeedData = async () => {
    setIsSeeding(true)
    setLastResult(null)
    
    try {
      console.log('💾 Iniciando proceso de seed data...')
      const result = await seedLegalFirmData()
      
      setLastResult(result)
      
      if (result.success) {
        const message = result.message || '✅ Datos ficticios creados exitosamente!'
        toast.success(message)
        console.log('✅ Seed data completado:', result)
        
        // Only reload if new data was actually created
        if (!result.message?.includes('ya existentes')) {
          setTimeout(() => window.location.reload(), 1500)
        }
      } else {
        const errorMsg = `❌ Error al crear datos ficticios: ${result.error || 'Error desconocido'}`
        toast.error(errorMsg)
        console.error('❌ Seed data falló:', result)
      }
    } catch (error) {
      console.error('❌ Error inesperado en seed data:', error)
      const errorMsg = error instanceof Error ? error.message : 'Error inesperado'
      toast.error(`❌ Error inesperado: ${errorMsg}`)
      setLastResult({ success: false, message: errorMsg })
    } finally {
      setIsSeeding(false)
    }
  }

  const getButtonIcon = () => {
    if (isSeeding) {
      return <Loader2 className="h-4 w-4 animate-spin" />
    }
    if (lastResult?.success) {
      return <CheckCircle className="h-4 w-4 text-green-600" />
    }
    if (lastResult && !lastResult.success) {
      return <AlertCircle className="h-4 w-4 text-red-600" />
    }
    return <Database className="h-4 w-4" />
  }

  const getButtonClass = () => {
    if (lastResult?.success) {
      return "flex items-center space-x-2 bg-green-600 hover:bg-green-700"
    }
    if (lastResult && !lastResult.success) {
      return "flex items-center space-x-2 bg-red-600 hover:bg-red-700"
    }
    return "flex items-center space-x-2 bg-green-600 hover:bg-green-700"
  }

  const getButtonText = () => {
    if (isSeeding) {
      return 'Creando datos...'
    }
    if (lastResult?.success && lastResult.message?.includes('ya existentes')) {
      return 'Datos ya existen'
    }
    if (lastResult?.success) {
      return 'Datos creados ✓'
    }
    if (lastResult && !lastResult.success) {
      return 'Error en datos'
    }
    return 'Poblar con datos ficticios'
  }

  return (
    <div className="space-y-2">
      <Button 
        onClick={handleSeedData} 
        disabled={isSeeding}
        className={getButtonClass()}
      >
        {getButtonIcon()}
        <span>{getButtonText()}</span>
      </Button>
      
      {lastResult && !lastResult.success && (
        <p className="text-xs text-red-600 max-w-xs">
          {lastResult.message || 'Error al crear datos ficticios'}
        </p>
      )}
    </div>
  )
}
