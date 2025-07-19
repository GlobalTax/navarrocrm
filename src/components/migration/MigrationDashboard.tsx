import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Database, Users, Building2, Calendar, TrendingUp, 
  AlertCircle, CheckCircle, Clock, RefreshCw,
  Download, Filter, Search
} from 'lucide-react'
import { supabase } from '@/integrations/supabase/client'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

interface MigrationStats {
  totalContacts: number
  hubspotContacts: number
  duplicatesResolved: number
  lastMigration: string | null
  migrationSources: Array<{
    source: string
    count: number
    lastImport: string
  }>
  qualityMetrics: {
    completeProfiles: number
    missingEmails: number
    missingPhones: number
    duplicateEmails: number
  }
}

export function MigrationDashboard() {
  const [stats, setStats] = useState<MigrationStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadMigrationStats()
  }, [])

  const loadMigrationStats = async () => {
    try {
      setIsLoading(true)
      setError(null)

      // Obtener estadísticas básicas
      const { data: contacts, error: contactsError } = await supabase
        .from('contacts')
        .select('id, name, email, phone, tags, created_at, updated_at')

      if (contactsError) throw contactsError

      // Procesar estadísticas
      const totalContacts = contacts?.length || 0
      const hubspotContacts = contacts?.filter(c => 
        c.tags && c.tags.includes('migrado_hubspot')
      ).length || 0

      // Métricas de calidad
      const completeProfiles = contacts?.filter(c => 
        c.name && c.email && c.phone
      ).length || 0

      const missingEmails = contacts?.filter(c => !c.email).length || 0
      const missingPhones = contacts?.filter(c => !c.phone).length || 0

      // Detectar emails duplicados
      const emailCounts = new Map()
      contacts?.forEach(c => {
        if (c.email) {
          emailCounts.set(c.email, (emailCounts.get(c.email) || 0) + 1)
        }
      })
      const duplicateEmails = Array.from(emailCounts.values()).filter(count => count > 1).length

      // Encontrar última migración
      const hubspotContactsSorted = contacts
        ?.filter(c => c.tags && c.tags.includes('migrado_hubspot'))
        ?.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      
      const lastMigration = hubspotContactsSorted?.[0]?.created_at || null

      // Fuentes de migración (simulado por ahora)
      const migrationSources: Array<{
        source: string
        count: number
        lastImport: string
      }> = []

      const migrationStats: MigrationStats = {
        totalContacts,
        hubspotContacts,
        duplicatesResolved: 0, // Se actualizará cuando implementemos resolución
        lastMigration,
        migrationSources,
        qualityMetrics: {
          completeProfiles,
          missingEmails,
          missingPhones,
          duplicateEmails
        }
      }

      setStats(migrationStats)

    } catch (err) {
      console.error('Error cargando estadísticas de migración:', err)
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="border-0.5 border-gray-200">
              <CardContent className="pt-6">
                <div className="animate-pulse">
                  <div className="h-8 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <Alert className="border-0.5 border-red-200 bg-red-50">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Error cargando datos de migración: {error}
        </AlertDescription>
      </Alert>
    )
  }

  if (!stats) {
    return (
      <Alert className="border-0.5 border-gray-200">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          No se pudieron cargar las estadísticas de migración
        </AlertDescription>
      </Alert>
    )
  }

  const qualityScore = Math.round(
    (stats.qualityMetrics.completeProfiles / Math.max(stats.totalContacts, 1)) * 100
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Dashboard de Migración</h2>
          <p className="text-muted-foreground">
            Gestiona y monitorea las migraciones de datos de CRM externos
          </p>
        </div>
        <Button 
          variant="outline" 
          onClick={loadMigrationStats}
          className="border-0.5 border-black rounded-[10px]"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Actualizar
        </Button>
      </div>

      {/* Estadísticas principales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-0.5 border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold text-blue-900">{stats.totalContacts}</p>
                <p className="text-sm font-medium text-blue-700">Total Contactos</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0.5 border-orange-200 bg-orange-50">
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Database className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold text-orange-900">0</p>
                <p className="text-sm font-medium text-orange-700">Desde Quantum</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0.5 border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold text-green-900">{qualityScore}%</p>
                <p className="text-sm font-medium text-green-700">Calidad Datos</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0.5 border-purple-200 bg-purple-50">
          <CardContent className="pt-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold text-purple-900">{stats.duplicatesResolved}</p>
                <p className="text-sm font-medium text-purple-700">Duplicados Resueltos</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Fuentes de migración */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Fuentes de Migración
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats.migrationSources.map((source, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border-0.5 border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-orange-600 rounded-full"></div>
                  <div>
                    <p className="font-medium">{source.source}</p>
                    <p className="text-sm text-muted-foreground">
                      {source.count} contactos importados
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">
                    {source.lastImport ? format(new Date(source.lastImport), 'dd MMM yyyy', { locale: es }) : 'Nunca'}
                  </p>
                  <p className="text-xs text-muted-foreground">Última importación</p>
                </div>
              </div>
            ))}
            
            {stats.migrationSources.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Database className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No hay migraciones registradas</p>
                <p className="text-sm">Comienza importando datos desde HubSpot</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Métricas de calidad */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Calidad de Datos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Perfiles Completos</span>
                <span>{stats.qualityMetrics.completeProfiles}/{stats.totalContacts}</span>
              </div>
              <Progress value={qualityScore} className="h-2" />
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Sin email:</span>
                <Badge variant={stats.qualityMetrics.missingEmails > 0 ? "destructive" : "secondary"}>
                  {stats.qualityMetrics.missingEmails}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Sin teléfono:</span>
                <Badge variant={stats.qualityMetrics.missingPhones > 0 ? "outline" : "secondary"}>
                  {stats.qualityMetrics.missingPhones}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Emails duplicados:</span>
                <Badge variant={stats.qualityMetrics.duplicateEmails > 0 ? "destructive" : "secondary"}>
                  {stats.qualityMetrics.duplicateEmails}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Historial Reciente
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats.lastMigration ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border-0.5 border-green-200">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="font-medium text-green-900">Última migración HubSpot</p>
                    <p className="text-sm text-green-700">
                      {format(new Date(stats.lastMigration), 'dd MMMM yyyy, HH:mm', { locale: es })}
                    </p>
                  </div>
                </div>
                
              </div>
            ) : (
              <div className="text-center py-8">
                <Clock className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p className="text-muted-foreground">No hay migraciones registradas</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recomendaciones */}
      {(stats.qualityMetrics.missingEmails > 0 || stats.qualityMetrics.duplicateEmails > 0) && (
        <Alert className="border-0.5 border-amber-200 bg-amber-50">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <p className="font-medium mb-2">Acciones recomendadas:</p>
            <ul className="text-sm space-y-1">
              {stats.qualityMetrics.missingEmails > 0 && (
                <li>• Completar emails faltantes en {stats.qualityMetrics.missingEmails} contactos</li>
              )}
              {stats.qualityMetrics.duplicateEmails > 0 && (
                <li>• Revisar y fusionar {stats.qualityMetrics.duplicateEmails} emails duplicados</li>
              )}
              {qualityScore < 80 && (
                <li>• Mejorar la calidad general de datos (actualmente {qualityScore}%)</li>
              )}
            </ul>
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}