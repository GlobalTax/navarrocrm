
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Settings } from 'lucide-react'

const Integrations = () => {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Integraciones</h1>
      <Card className="border-0.5 border-black rounded-[10px] shadow-sm">
        <CardHeader className="text-center py-12">
          <Settings className="h-8 w-8 text-green-600 mx-auto mb-4" />
          <CardTitle>Configuración de Integraciones</CardTitle>
          <CardDescription>Conecta con servicios externos y APIs. En desarrollo.</CardDescription>
        </CardHeader>
      </Card>
    </div>
  )
}

export default Integrations
