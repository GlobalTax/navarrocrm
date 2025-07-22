
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, CheckSquare } from 'lucide-react'
import { MainLayout } from '@/components/layout/MainLayout'
import { StandardPageContainer } from '@/components/layout/StandardPageContainer'

const Tasks = () => {
  return (
    <MainLayout>
      <StandardPageContainer>
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Tareas</h1>
            <p className="text-gray-600 mt-1">Gestiona tareas y seguimiento de trabajo</p>
          </div>
          <Button className="border-0.5 border-black rounded-[10px]">
            <Plus className="h-4 w-4 mr-2" />
            Nueva Tarea
          </Button>
        </div>

        <Card className="border-0.5 border-black rounded-[10px] shadow-sm">
          <CardHeader className="text-center py-12">
            <div className="mx-auto mb-4 p-3 bg-purple-100 rounded-full w-fit">
              <CheckSquare className="h-8 w-8 text-purple-600" />
            </div>
            <CardTitle className="text-xl mb-2">Gestión de Tareas</CardTitle>
            <CardDescription className="max-w-md mx-auto">
              Organiza y hace seguimiento de todas las tareas del despacho.
              Funcionalidad en desarrollo.
            </CardDescription>
          </CardHeader>
        </Card>
      </StandardPageContainer>
    </MainLayout>
  )
}

export default Tasks
