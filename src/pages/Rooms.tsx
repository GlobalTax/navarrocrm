
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Monitor } from 'lucide-react'

const Rooms = () => {
  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Salas</h1>
        <p className="text-gray-600 mt-1">Reserva y gestiona salas de reuniones</p>
      </div>

      <Card className="border-0.5 border-black rounded-[10px] shadow-sm">
        <CardHeader className="text-center py-12">
          <div className="mx-auto mb-4 p-3 bg-teal-100 rounded-full w-fit">
            <Monitor className="h-8 w-8 text-teal-600" />
          </div>
          <CardTitle className="text-xl mb-2">Gestión de Salas</CardTitle>
          <CardDescription className="max-w-md mx-auto">
            Reserva salas de reuniones y espacios de trabajo.
            Funcionalidad en desarrollo.
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  )
}

export default Rooms
