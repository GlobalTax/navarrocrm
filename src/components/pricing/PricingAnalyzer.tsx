import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Loader2, TrendingUp, AlertTriangle, Globe, DollarSign } from 'lucide-react'
import { supabase } from '@/integrations/supabase/client'
import { useApp } from '@/contexts/AppContext'
import { toast } from 'sonner'
import { formatCurrency } from '@/lib/utils/formatting'

interface PricingPlan {
  name: string
  price: number
  currency: string
  billing_cycle: string
  features: string[]
  is_popular?: boolean
}

interface AnalysisResult {
  provider_name: string
  provider_website: string
  pricing_model: string
  plans: PricingPlan[]
  last_updated: string
}

export const PricingAnalyzer = () => {
  const { user } = useApp()
  const [url, setUrl] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null)
  const [progress, setProgress] = useState(0)

  const analyzePricing = async () => {
    if (!url.trim()) {
      toast.error('Por favor, introduce una URL válida')
      return
    }

    if (!user?.org_id) {
      toast.error('Usuario no autenticado')
      return
    }

    setIsAnalyzing(true)
    setProgress(10)

    try {
      // Simular progreso
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 20, 90))
      }, 1000)

      // Llamar a la edge function para análisis
      const { data, error } = await supabase.functions.invoke('analyze-pricing', {
        body: { 
          website_url: url,
          org_id: user.org_id 
        }
      })

      clearInterval(progressInterval)
      setProgress(100)

      if (error) throw error

      setAnalysisResult(data.analysis)
      toast.success('Análisis completado exitosamente')
    } catch (error) {
      console.error('Error analyzing pricing:', error)
      toast.error('Error al analizar los precios. Verifique la URL y intente de nuevo.')
    } finally {
      setIsAnalyzing(false)
      setProgress(0)
    }
  }

  const getPricingModelColor = (model: string) => {
    switch (model) {
      case 'tier-based': return 'bg-blue-500/10 text-blue-700 border-blue-200'
      case 'usage-based': return 'bg-green-500/10 text-green-700 border-green-200'
      case 'freemium': return 'bg-purple-500/10 text-purple-700 border-purple-200'
      case 'flat-rate': return 'bg-orange-500/10 text-orange-700 border-orange-200'
      default: return 'bg-gray-500/10 text-gray-700 border-gray-200'
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Analizador de Precios SaaS
          </CardTitle>
          <CardDescription>
            Analiza automáticamente las páginas de precios de proveedores SaaS para obtener información detallada sobre sus modelos de pricing
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="https://ejemplo.com/pricing"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="flex-1"
            />
            <Button 
              onClick={analyzePricing}
              disabled={isAnalyzing || !url.trim()}
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Analizando...
                </>
              ) : (
                'Analizar'
              )}
            </Button>
          </div>

          {isAnalyzing && (
            <div className="space-y-2">
              <Progress value={progress} className="w-full" />
              <p className="text-sm text-muted-foreground text-center">
                Analizando estructura de precios...
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {analysisResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Resultados del Análisis: {analysisResult.provider_name}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge className={getPricingModelColor(analysisResult.pricing_model)}>
                {analysisResult.pricing_model}
              </Badge>
              <span className="text-sm text-muted-foreground">
                Actualizado: {new Date(analysisResult.last_updated).toLocaleDateString()}
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {analysisResult.plans.map((plan, index) => (
                <Card key={index} className={`relative ${plan.is_popular ? 'ring-2 ring-primary' : ''}`}>
                  {plan.is_popular && (
                    <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-primary">
                      Más Popular
                    </Badge>
                  )}
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">{plan.name}</CardTitle>
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-bold">
                        {formatCurrency(plan.price, plan.currency)}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        /{plan.billing_cycle}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-2">
                    <ul className="space-y-1 text-sm">
                      {plan.features.slice(0, 5).map((feature, idx) => (
                        <li key={idx} className="flex items-center gap-2">
                          <div className="h-1 w-1 bg-primary rounded-full" />
                          {feature}
                        </li>
                      ))}
                      {plan.features.length > 5 && (
                        <li className="text-muted-foreground">
                          +{plan.features.length - 5} más...
                        </li>
                      )}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sugerencias de URLs populares */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            URLs Populares para Analizar
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 md:grid-cols-2">
            {[
              { name: 'Cursor AI', url: 'https://cursor.com/pricing' },
              { name: 'Nylas', url: 'https://nylas.com/pricing' },
              { name: 'Resend', url: 'https://resend.com/pricing' },
              { name: 'Gemini Advanced', url: 'https://one.google.com/about/plans' },
              { name: 'Notion', url: 'https://notion.so/pricing' },
              { name: 'Figma', url: 'https://figma.com/pricing' }
            ].map((suggestion) => (
              <Button
                key={suggestion.name}
                variant="outline"
                className="justify-start h-auto p-3"
                onClick={() => setUrl(suggestion.url)}
              >
                <div className="text-left">
                  <div className="font-medium">{suggestion.name}</div>
                  <div className="text-xs text-muted-foreground truncate">
                    {suggestion.url}
                  </div>
                </div>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}