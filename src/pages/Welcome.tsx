
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Building2, Users, FileText, Clock, BarChart3, Workflow } from 'lucide-react'

const Welcome = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Bienvenido a LegalFlow CRM
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            El CRM líder para asesorías multidisciplinares. Gestiona expedientes, 
            controla tiempos, genera propuestas y mantén conectado a tu equipo.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <Card className="bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-600" />
                Gestión de Clientes
              </CardTitle>
              <CardDescription>
                Ficha 360º de cada cliente con historial completo
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-green-600" />
                Expedientes
              </CardTitle>
              <CardDescription>
                Organiza y gestiona todos tus casos legales
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-orange-600" />
                Control de Tiempo
              </CardTitle>
              <CardDescription>
                Registra horas facturables automáticamente
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-purple-600" />
                Propuestas
              </CardTitle>
              <CardDescription>
                Genera presupuestos profesionales rápidamente
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-red-600" />
                Analytics
              </CardTitle>
              <CardDescription>
                Insights inteligentes para optimizar tu despacho
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Workflow className="h-5 w-5 text-indigo-600" />
                Workflows
              </CardTitle>
              <CardDescription>
                Automatiza procesos y mejora la eficiencia
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <Card className="bg-white/90 backdrop-blur-sm max-w-md mx-auto">
            <CardHeader>
              <CardTitle>¿Listo para empezar?</CardTitle>
              <CardDescription>
                Accede al sistema para gestionar tu asesoría de forma más eficiente
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                className="w-full" 
                onClick={() => window.location.href = '/dashboard'}
              >
                Ir al Dashboard
              </Button>
              <p className="text-sm text-gray-500">
                Sistema en desarrollo - Acceso directo disponible
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default Welcome
