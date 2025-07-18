import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { 
  FileText, 
  Bot, 
  TrendingUp, 
  Zap,
  Star,
  Clock,
  Target
} from 'lucide-react'

interface DocumentStatsProps {
  stats: {
    totalTemplates: number
    aiTemplates: number
    documentsThisMonth: number
    favoriteTemplates: number
  }
}

export const DocumentStats = ({ stats }: DocumentStatsProps) => {
  const aiUsagePercentage = stats.totalTemplates > 0 
    ? Math.round((stats.aiTemplates / stats.totalTemplates) * 100) 
    : 0

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          Estadísticas
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Uso de IA */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Bot className="h-4 w-4 text-purple-600" />
              <span className="font-medium">Plantillas con IA</span>
            </div>
            <span className="text-muted-foreground">{aiUsagePercentage}%</span>
          </div>
          <Progress value={aiUsagePercentage} className="h-2" />
          <p className="text-xs text-muted-foreground">
            {stats.aiTemplates} de {stats.totalTemplates} plantillas usan IA
          </p>
        </div>

        {/* Favoritas */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 text-amber-600" />
              <span className="font-medium">Favoritas</span>
            </div>
            <span className="text-muted-foreground">{stats.favoriteTemplates}</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-amber-400 to-amber-600 rounded-full transition-all duration-300"
              style={{ 
                width: stats.totalTemplates > 0 
                  ? `${Math.min((stats.favoriteTemplates / stats.totalTemplates) * 100, 100)}%` 
                  : '0%' 
              }}
            />
          </div>
        </div>

        {/* Productividad este mes */}
        <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border border-green-200">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="h-4 w-4 text-green-600" />
            <span className="font-medium text-green-800">Este Mes</span>
          </div>
          <div className="text-2xl font-bold text-green-800">
            {stats.documentsThisMonth}
          </div>
          <p className="text-sm text-green-600">documentos generados</p>
        </div>

        {/* Objetivos */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-primary" />
            <span className="font-medium text-sm">Objetivos del Mes</span>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm">
              <span>Documentos generados</span>
              <span className="text-muted-foreground">{stats.documentsThisMonth}/20</span>
            </div>
            <Progress value={(stats.documentsThisMonth / 20) * 100} className="h-1" />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm">
              <span>Plantillas creadas</span>
              <span className="text-muted-foreground">{stats.totalTemplates}/10</span>
            </div>
            <Progress value={(stats.totalTemplates / 10) * 100} className="h-1" />
          </div>
        </div>

        {/* Tiempo promedio */}
        <div className="p-3 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">Tiempo promedio</span>
          </div>
          <div className="text-lg font-semibold text-foreground mt-1">
            2.5 min
          </div>
          <p className="text-xs text-muted-foreground">
            por documento generado
          </p>
        </div>
      </CardContent>
    </Card>
  )
}