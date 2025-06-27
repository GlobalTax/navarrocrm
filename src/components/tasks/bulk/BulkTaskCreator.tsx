
import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { TaskTemplateManager } from './TaskTemplateManager'
import { CSVTaskImporter } from './CSVTaskImporter'
import { TaskWizard } from './TaskWizard'
import { BulkOperationsList } from './BulkOperationsList'
import { 
  FileSpreadsheet, 
  Wand2, 
  PlusCircle, 
  History,
  Users,
  Calendar,
  Target
} from 'lucide-react'

export const BulkTaskCreator = () => {
  const [activeTab, setActiveTab] = useState('wizard')

  const features = [
    {
      icon: Wand2,
      title: 'Asistente Paso a Paso',
      description: 'Crea múltiples tareas siguiendo un proceso guiado'
    },
    {
      icon: FileSpreadsheet,
      title: 'Importar desde CSV',
      description: 'Sube un archivo CSV con todas tus tareas'
    },
    {
      icon: PlusCircle,
      title: 'Plantillas Personalizadas',
      description: 'Guarda configuraciones para reutilizar'
    },
    {
      icon: Users,
      title: 'Asignación Masiva',
      description: 'Asigna tareas a múltiples usuarios automáticamente'
    }
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Creación Masiva de Tareas</h2>
          <p className="text-gray-600">
            Herramientas avanzadas para crear y gestionar múltiples tareas de forma eficiente
          </p>
        </div>
        <Badge variant="secondary" className="flex items-center gap-2">
          <Target className="h-4 w-4" />
          Fase 1: Creación Masiva
        </Badge>
      </div>

      {/* Features Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {features.map((feature, index) => (
          <Card key={index} className="hover:shadow-sm transition-shadow">
            <CardContent className="p-4 text-center">
              <feature.icon className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <h3 className="font-medium text-sm mb-1">{feature.title}</h3>
              <p className="text-xs text-gray-500">{feature.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Interface */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="wizard" className="flex items-center gap-2">
            <Wand2 className="h-4 w-4" />
            Asistente
          </TabsTrigger>
          <TabsTrigger value="csv" className="flex items-center gap-2">
            <FileSpreadsheet className="h-4 w-4" />
            Importar CSV
          </TabsTrigger>
          <TabsTrigger value="templates" className="flex items-center gap-2">
            <PlusCircle className="h-4 w-4" />
            Plantillas
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <History className="h-4 w-4" />
            Historial
          </TabsTrigger>
        </TabsList>

        <TabsContent value="wizard">
          <TaskWizard />
        </TabsContent>

        <TabsContent value="csv">
          <CSVTaskImporter />
        </TabsContent>

        <TabsContent value="templates">
          <TaskTemplateManager />
        </TabsContent>

        <TabsContent value="history">
          <BulkOperationsList />
        </TabsContent>
      </Tabs>
    </div>
  )
}
