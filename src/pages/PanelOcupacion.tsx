
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Grid3X3 } from 'lucide-react'

const PanelOcupacion = () => {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Panel de Ocupación</h1>
      <Card className="border-0.5 border-black rounded-[10px] shadow-sm">
        <CardHeader className="text-center py-12">
          <Grid3X3 className="h-8 w-8 text-orange-600 mx-auto mb-4" />
          <CardTitle>Panel de Ocupación</CardTitle>
          <CardDescription>Vista general de la ocupación del despacho. En desarrollo.</CardDescription>
        </CardHeader>
      </Card>
    </div>
  )
}

export default PanelOcupacion
