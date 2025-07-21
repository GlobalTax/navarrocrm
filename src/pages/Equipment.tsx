
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Package } from 'lucide-react'

const Equipment = () => {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Equipos</h1>
      <Card className="border-0.5 border-black rounded-[10px] shadow-sm">
        <CardHeader className="text-center py-12">
          <Package className="h-8 w-8 text-gray-600 mx-auto mb-4" />
          <CardTitle>Gestión de Equipos</CardTitle>
          <CardDescription>Inventario y gestión de equipos del despacho. En desarrollo.</CardDescription>
        </CardHeader>
      </Card>
    </div>
  )
}

export default Equipment
