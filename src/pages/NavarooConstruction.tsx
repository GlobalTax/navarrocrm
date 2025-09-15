import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Mail, Phone, MapPin, Calendar, Wrench, Sparkles, ArrowRight } from 'lucide-react'

export default function NavarooConstruction() {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  })

  // Fecha de lanzamiento estimada (puedes cambiar esta fecha)
  const launchDate = new Date('2025-10-01T00:00:00')

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime()
      const distance = launchDate.getTime() - now

      if (distance > 0) {
        setTimeLeft({
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000)
        })
      }
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/10 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full space-y-8">
        {/* Header con logo/título */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-primary/10 rounded-2xl border border-primary/20 mb-6">
            <Wrench className="w-10 h-10 text-primary" />
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">
            NAVAROO
          </h1>
          
          <div className="flex items-center justify-center gap-2">
            <Badge variant="secondary" className="px-4 py-1">
              <Sparkles className="w-4 h-4 mr-1" />
              Próximamente
            </Badge>
          </div>

          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Estamos construyendo algo extraordinario. Una plataforma revolucionaria que transformará 
            la forma de gestionar tu negocio.
          </p>
        </div>

        {/* Contador regresivo */}
        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardContent className="p-8">
            <div className="text-center space-y-6">
              <h2 className="text-2xl font-semibold flex items-center justify-center gap-2">
                <Calendar className="w-6 h-6 text-primary" />
                Lanzamiento estimado
              </h2>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'Días', value: timeLeft.days },
                  { label: 'Horas', value: timeLeft.hours },
                  { label: 'Minutos', value: timeLeft.minutes },
                  { label: 'Segundos', value: timeLeft.seconds }
                ].map((item, index) => (
                  <div key={index} className="text-center">
                    <div className="bg-primary/10 rounded-xl p-4 border border-primary/20">
                      <div className="text-3xl font-bold text-primary">
                        {item.value.toString().padStart(2, '0')}
                      </div>
                      <div className="text-sm text-muted-foreground font-medium">
                        {item.label}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Características destacadas */}
        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              title: 'CRM Inteligente',
              description: 'Gestión avanzada de clientes con IA integrada',
              icon: '🤖'
            },
            {
              title: 'Automatización Total',
              description: 'Workflows que se adaptan a tu forma de trabajar',
              icon: '⚡'
            },
            {
              title: 'Analytics Poderoso',
              description: 'Insights que impulsan decisiones inteligentes',
              icon: '📊'
            }
          ].map((feature, index) => (
            <Card key={index} className="bg-card/30 backdrop-blur-sm border-border/30 hover:bg-card/50 transition-all duration-300">
              <CardContent className="p-6 text-center space-y-3">
                <div className="text-3xl">{feature.icon}</div>
                <h3 className="font-semibold text-lg">{feature.title}</h3>
                <p className="text-muted-foreground text-sm">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Información de contacto */}
        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardContent className="p-8">
            <div className="text-center space-y-6">
              <h3 className="text-2xl font-semibold">¿Tienes questions?</h3>
              <p className="text-muted-foreground">
                Nuestro equipo está aquí para ayudarte. Contáctanos y te mantendremos informado.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button variant="default" size="lg" className="group">
                  <Mail className="w-4 h-4 mr-2" />
                  info@navaroo.com
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
                
                <Button variant="outline" size="lg">
                  <Phone className="w-4 h-4 mr-2" />
                  +34 XXX XXX XXX
                </Button>
              </div>

              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <MapPin className="w-4 h-4" />
                <span>Madrid, España</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-sm text-muted-foreground">
          <p>© 2025 Navaroo. Todos los derechos reservados.</p>
          <p className="mt-1">Construido con 💜 por el equipo de Navaroo</p>
        </div>
      </div>
    </div>
  )
}