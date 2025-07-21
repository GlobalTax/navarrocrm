
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, Euro } from 'lucide-react'

const RecurringFees = () => {
  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Cuotas Recurrentes</h1>
          <p className="text-gray-600 mt-1">Gestiona pagos periódicos y retainers</p>
        </div>
        <Button className="border-0.5 border-black rounded-[10px]">
          <Plus className="h-4 w-4 mr-2" />
          Nueva Cuota
        </Button>
      </div>

      <Card className="border-0.5 border-black rounded-[10px] shadow-sm">
        <CardHeader className="text-center py-12">
          <div className="mx-auto mb-4 p-3 bg-yellow-100 rounded-full w-fit">
            <Euro className="h-8 w-8 text-yellow-600" />
          </div>
          <CardTitle className="text-xl mb-2">Cuotas Recurrentes</CardTitle>
          <CardDescription className="max-w-md mx-auto">
            Gestiona pagos recurrentes, retainers y suscripciones de servicios.
            Funcionalidad en desarrollo.
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  )
}

export default RecurringFees
