import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle, Building, Mail, Calendar } from 'lucide-react'

export default function EmployeeOnboardingSuccess() {
  const navigate = useNavigate()

  useEffect(() => {
    // Redirigir después de 10 segundos
    const timer = setTimeout(() => {
      window.close() // Cerrar ventana si es posible
    }, 10000)

    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <Building className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-xl font-semibold">Onboarding Completado</h1>
              <p className="text-sm text-muted-foreground">
                ¡Bienvenido/a al equipo!
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        <Card>
          <CardContent className="p-8 text-center">
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-chart-2/10 rounded-full flex items-center justify-center">
                <CheckCircle className="h-10 w-10 text-chart-2" />
              </div>
            </div>

            <h2 className="text-2xl font-bold mb-4">
              ¡Onboarding Completado Exitosamente!
            </h2>

            <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
              Gracias por completar el proceso de onboarding. Tus datos han sido registrados 
              correctamente y el departamento de recursos humanos revisará tu información.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="flex flex-col items-center p-4 bg-muted/30 rounded-lg">
                <Mail className="h-8 w-8 text-primary mb-2" />
                <h3 className="font-medium mb-1">Confirmación por Email</h3>
                <p className="text-sm text-muted-foreground text-center">
                  Recibirás un email de confirmación en las próximas horas
                </p>
              </div>

              <div className="flex flex-col items-center p-4 bg-muted/30 rounded-lg">
                <Calendar className="h-8 w-8 text-primary mb-2" />
                <h3 className="font-medium mb-1">Próximos Pasos</h3>
                <p className="text-sm text-muted-foreground text-center">
                  Te contactaremos para coordinar tu primer día de trabajo
                </p>
              </div>

              <div className="flex flex-col items-center p-4 bg-muted/30 rounded-lg">
                <Building className="h-8 w-8 text-primary mb-2" />
                <h3 className="font-medium mb-1">Recursos Humanos</h3>
                <p className="text-sm text-muted-foreground text-center">
                  Nuestro equipo revisará tu documentación en breve
                </p>
              </div>
            </div>

            <div className="bg-muted/30 p-6 rounded-lg mb-6">
              <h3 className="font-medium mb-2">¿Tienes alguna pregunta?</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Si necesitas ayuda o tienes alguna consulta, no dudes en contactarnos:
              </p>
              <div className="flex flex-col sm:flex-row gap-2 justify-center">
                <a 
                  href="mailto:rrhh@empresa.com" 
                  className="text-primary hover:underline text-sm"
                >
                  rrhh@empresa.com
                </a>
                <span className="hidden sm:inline text-muted-foreground">•</span>
                <a 
                  href="tel:+34900000000" 
                  className="text-primary hover:underline text-sm"
                >
                  +34 900 000 000
                </a>
              </div>
            </div>

            <Button 
              onClick={() => window.close()}
              variant="outline"
              className="mx-auto"
            >
              Cerrar Ventana
            </Button>

            <p className="text-xs text-muted-foreground mt-4">
              Esta ventana se cerrará automáticamente en unos segundos
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}