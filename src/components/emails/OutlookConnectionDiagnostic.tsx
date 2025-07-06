import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  CheckCircle, 
  XCircle, 
  Loader2,
  Bug,
  RefreshCw
} from 'lucide-react'
import { OutlookAuthService, ConnectionDiagnostic } from '@/services/outlookAuthService'
import { toast } from 'sonner'

interface OutlookConnectionDiagnosticProps {
  isOpen: boolean
  onClose: () => void
}

export function OutlookConnectionDiagnostic({ isOpen, onClose }: OutlookConnectionDiagnosticProps) {
  const [diagnostics, setDiagnostics] = useState<ConnectionDiagnostic[]>([])
  const [isRunning, setIsRunning] = useState(false)

  const runDiagnostic = async () => {
    setIsRunning(true)
    setDiagnostics([])
    
    try {
      const results = await OutlookAuthService.runConnectionDiagnostic()
      setDiagnostics(results)
      
      const allPassed = results.every(r => r.success)
      if (allPassed) {
        toast.success('Todos los diagnósticos pasaron correctamente')
      } else {
        toast.warning('Se encontraron problemas en el diagnóstico')
      }
    } catch (error) {
      console.error('Error ejecutando diagnósticos:', error)
      toast.error('Error ejecutando diagnósticos')
    } finally {
      setIsRunning(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-2xl mx-4 border-0.5 border-black rounded-[10px]">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Bug className="h-5 w-5" />
              Diagnóstico de Conexión Outlook
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              ×
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button
              onClick={runDiagnostic}
              disabled={isRunning}
              className="gap-2"
            >
              {isRunning ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              {isRunning ? 'Ejecutando...' : 'Ejecutar Diagnóstico'}
            </Button>
          </div>

          {diagnostics.length > 0 && (
            <ScrollArea className="h-64">
              <div className="space-y-3">
                {diagnostics.map((diagnostic, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg"
                  >
                    <div className="flex-shrink-0 mt-0.5">
                      {diagnostic.success ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-600" />
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-sm">{diagnostic.step}</h4>
                        <Badge
                          variant={diagnostic.success ? 'default' : 'destructive'}
                          className="text-xs"
                        >
                          {diagnostic.success ? 'OK' : 'FALLO'}
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-muted-foreground mb-2">
                        {diagnostic.message}
                      </p>
                      
                      {diagnostic.data && (
                        <div className="text-xs font-mono bg-gray-50 p-2 rounded border">
                          <pre className="whitespace-pre-wrap">
                            {JSON.stringify(diagnostic.data, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}

          {diagnostics.length === 0 && !isRunning && (
            <div className="text-center py-8 text-muted-foreground">
              <Bug className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Ejecute el diagnóstico para analizar la conexión con Outlook</p>
            </div>
          )}

          {isRunning && (
            <div className="text-center py-8">
              <Loader2 className="h-8 w-8 mx-auto mb-4 animate-spin text-primary" />
              <p className="text-muted-foreground">Ejecutando diagnósticos...</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}