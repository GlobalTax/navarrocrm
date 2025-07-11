import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CheckCircle, Eye, Users, TrendingUp, AlertTriangle } from 'lucide-react'
import { ValidationError } from '@/components/bulk-upload/BaseBulkUploadDialog'
import { HubSpotValidationData } from '@/components/bulk-upload/hooks/useBulkUploadValidators'

interface HubSpotPreviewStepProps {
  validatedData: HubSpotValidationData[]
  validationErrors: ValidationError[]
  duplicatesFound: Array<{ email: string; count: number }>
  estimatedImportTime: number
}

export function HubSpotPreviewStep({
  validatedData,
  validationErrors,
  duplicatesFound,
  estimatedImportTime
}: HubSpotPreviewStepProps) {
  const hasErrors = validationErrors.length > 0
  const hasDuplicates = duplicatesFound.length > 0
  const canProceed = !hasErrors

  const getDataStats = () => {
    const totalContacts = validatedData.length
    const withEmail = validatedData.filter(d => d.email).length
    const withPhone = validatedData.filter(d => d.phone).length
    const companies = validatedData.filter(d => d.company).length
    
    return {
      totalContacts,
      withEmail,
      withPhone,
      companies,
      emailPercentage: totalContacts > 0 ? Math.round((withEmail / totalContacts) * 100) : 0,
      phonePercentage: totalContacts > 0 ? Math.round((withPhone / totalContacts) * 100) : 0
    }
  }

  const stats = getDataStats()

  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${seconds} segundos`
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}m ${remainingSeconds}s`
  }

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <Card className={`border-0.5 rounded-[10px] ${canProceed ? 'border-green-300 bg-green-50' : 'border-amber-300 bg-amber-50'}`}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {canProceed ? (
              <CheckCircle className="h-5 w-5 text-green-600" />
            ) : (
              <AlertTriangle className="h-5 w-5 text-amber-600" />
            )}
            Vista Previa de Importación
            <Badge variant={canProceed ? "default" : "destructive"} className="ml-2">
              {canProceed ? 'Listo para importar' : 'Requiere atención'}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-green-600">{stats.totalContacts}</p>
              <p className="text-sm text-muted-foreground">Contactos totales</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-600">{stats.withEmail}</p>
              <p className="text-sm text-muted-foreground">Con email ({stats.emailPercentage}%)</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-purple-600">{stats.withPhone}</p>
              <p className="text-sm text-muted-foreground">Con teléfono ({stats.phonePercentage}%)</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-amber-600">{stats.companies}</p>
              <p className="text-sm text-muted-foreground">Empresas</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Quality Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Quality Score */}
        <Card className="border-0.5 border-black rounded-[10px]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <TrendingUp className="h-4 w-4" />
              Calidad de Datos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Completitud de emails</span>
                <div className="flex items-center gap-2">
                  <div className="w-20 h-2 bg-gray-200 rounded-full">
                    <div 
                      className="h-2 bg-green-500 rounded-full" 
                      style={{ width: `${stats.emailPercentage}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium">{stats.emailPercentage}%</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm">Completitud de teléfonos</span>
                <div className="flex items-center gap-2">
                  <div className="w-20 h-2 bg-gray-200 rounded-full">
                    <div 
                      className="h-2 bg-blue-500 rounded-full" 
                      style={{ width: `${stats.phonePercentage}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium">{stats.phonePercentage}%</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm">Empresas identificadas</span>
                <Badge variant="outline">
                  {Math.round((stats.companies / stats.totalContacts) * 100)}%
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Import Estimation */}
        <Card className="border-0.5 border-black rounded-[10px]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <Eye className="h-4 w-4" />
              Estimación de Importación
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Tiempo estimado</span>
                <Badge variant="outline">
                  {formatTime(estimatedImportTime)}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm">Lotes de procesamiento</span>
                <Badge variant="outline">
                  {Math.ceil(stats.totalContacts / 10)}
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm">Memoria estimada</span>
                <Badge variant="outline">
                  {Math.round((stats.totalContacts * 2) / 1024)} MB
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Validation Errors */}
      {hasErrors && (
        <Card className="border-0.5 border-red-300 rounded-[10px]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-700">
              <AlertTriangle className="h-5 w-5" />
              Errores de Validación ({validationErrors.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="max-h-48 overflow-y-auto space-y-2">
              {validationErrors.slice(0, 10).map((error, index) => (
                <div key={index} className="text-sm p-3 bg-red-50 rounded-[10px] border border-red-200">
                  <p className="font-medium text-red-700">
                    Fila {error.row}, campo {error.field}: {error.message}
                  </p>
                  {error.suggestion && (
                    <p className="text-red-600 mt-1">💡 {error.suggestion}</p>
                  )}
                </div>
              ))}
              {validationErrors.length > 10 && (
                <p className="text-sm text-center text-red-600 py-2">
                  ... y {validationErrors.length - 10} errores más
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Duplicates Warning */}
      {hasDuplicates && (
        <Alert className="border-0.5 border-amber-300 rounded-[10px] bg-amber-50">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-2">
              <p className="font-medium">Posibles duplicados detectados:</p>
              <div className="max-h-32 overflow-y-auto">
                {duplicatesFound.slice(0, 5).map((duplicate, index) => (
                  <p key={index} className="text-sm">
                    📧 {duplicate.email} - {duplicate.count} coincidencias
                  </p>
                ))}
                {duplicatesFound.length > 5 && (
                  <p className="text-sm">... y {duplicatesFound.length - 5} emails más</p>
                )}
              </div>
              <p className="text-xs text-amber-700 mt-2">
                Los duplicados serán manejados según la configuración seleccionada.
              </p>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Sample Data Preview */}
      <Card className="border-0.5 border-black rounded-[10px]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Muestra de Datos a Importar
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="max-h-64 overflow-y-auto space-y-3">
            {validatedData.slice(0, 5).map((contact, index) => (
              <div key={index} className="p-3 border border-gray-200 rounded-[10px]">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="font-medium">{contact.name}</p>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {contact.email && (
                        <Badge variant="outline" className="text-xs">📧 {contact.email}</Badge>
                      )}
                      {contact.phone && (
                        <Badge variant="outline" className="text-xs">📱 {contact.phone}</Badge>
                      )}
                      {contact.company && (
                        <Badge variant="outline" className="text-xs">🏢 {contact.company}</Badge>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant="secondary" className="text-xs">
                      {contact.lifecycle_stage}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
            {validatedData.length > 5 && (
              <p className="text-sm text-center text-muted-foreground py-2">
                ... y {validatedData.length - 5} contactos más
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}