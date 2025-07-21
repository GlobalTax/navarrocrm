
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, Clock } from 'lucide-react'

const TimeTracking = () => {
  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Time Tracking</h1>
          <p className="text-gray-600 mt-1">Registra y controla el tiempo dedicado</p>
        </div>
        <Button className="border-0.5 border-black rounded-[10px]">
          <Plus className="h-4 w-4 mr-2" />
          Registrar Tiempo
        </Button>
      </div>

      <Card className="border-0.5 border-black rounded-[10px] shadow-sm">
        <CardHeader className="text-center py-12">
          <div className="mx-auto mb-4 p-3 bg-blue-100 rounded-full w-fit">
            <Clock className="h-8 w-8 text-blue-600" />
          </div>
          <CardTitle className="text-xl mb-2">Control de Tiempo</CardTitle>
          <CardDescription className="max-w-md mx-auto">
            Registra el tiempo dedicado a cada caso y cliente para facturación precisa.
            Funcionalidad en desarrollo.
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  )
}

export default TimeTracking
