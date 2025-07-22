
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar as CalendarIcon } from 'lucide-react'
import { MainLayout } from '@/components/layout/MainLayout'
import { StandardPageContainer } from '@/components/layout/StandardPageContainer'

const Calendar = () => {
  return (
    <MainLayout>
      <StandardPageContainer>
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Calendario</h1>
          <p className="text-gray-600 mt-1">Gestiona citas y eventos</p>
        </div>

        <Card className="border-0.5 border-black rounded-[10px] shadow-sm">
          <CardHeader className="text-center py-12">
            <div className="mx-auto mb-4 p-3 bg-indigo-100 rounded-full w-fit">
              <CalendarIcon className="h-8 w-8 text-indigo-600" />
            </div>
            <CardTitle className="text-xl mb-2">Calendario del Despacho</CardTitle>
            <CardDescription className="max-w-md mx-auto">
              Organiza citas, reuniones y eventos importantes.
              Funcionalidad en desarrollo.
            </CardDescription>
          </CardHeader>
        </Card>
      </StandardPageContainer>
    </MainLayout>
  )
}

export default Calendar
