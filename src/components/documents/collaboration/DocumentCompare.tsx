import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { GitCompare, FileText, Settings, ArrowLeft, ArrowRight } from 'lucide-react'
import { DocumentVersion } from '@/hooks/useDocumentCollaboration'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'

interface DocumentCompareProps {
  version1: DocumentVersion
  version2: DocumentVersion
  onClose?: () => void
}

export const DocumentCompare = ({ 
  version1, 
  version2, 
  onClose 
}: DocumentCompareProps) => {
  const [compareMode, setCompareMode] = useState<'side-by-side' | 'unified'>('side-by-side')

  // Función simple para detectar diferencias
  const getTextDifferences = (text1: string, text2: string) => {
    const lines1 = text1.split('\n')
    const lines2 = text2.split('\n')
    const maxLines = Math.max(lines1.length, lines2.length)
    
    const differences = []
    for (let i = 0; i < maxLines; i++) {
      const line1 = lines1[i] || ''
      const line2 = lines2[i] || ''
      
      if (line1 !== line2) {
        differences.push({
          lineNumber: i + 1,
          line1,
          line2,
          type: !line1 ? 'added' : !line2 ? 'removed' : 'modified'
        })
      } else {
        differences.push({
          lineNumber: i + 1,
          line1,
          line2,
          type: 'unchanged'
        })
      }
    }
    
    return differences
  }

  const getDifferenceClass = (type: string, side?: 'left' | 'right') => {
    switch (type) {
      case 'added':
        return side === 'right' ? 'bg-success/20 border-l-4 border-success' : 'bg-muted/30'
      case 'removed':
        return side === 'left' ? 'bg-destructive/20 border-l-4 border-destructive' : 'bg-muted/30'
      case 'modified':
        return 'bg-warning/20 border-l-4 border-warning'
      default:
        return 'bg-background'
    }
  }

  const getVariablesDifferences = () => {
    const vars1 = version1.variables_data || {}
    const vars2 = version2.variables_data || {}
    const allKeys = new Set([...Object.keys(vars1), ...Object.keys(vars2)])
    
    return Array.from(allKeys).map(key => ({
      key,
      value1: vars1[key],
      value2: vars2[key],
      type: !vars1[key] ? 'added' : !vars2[key] ? 'removed' : 
            vars1[key] !== vars2[key] ? 'modified' : 'unchanged'
    }))
  }

  const textDifferences = getTextDifferences(version1.content, version2.content)
  const variablesDifferences = getVariablesDifferences()

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <GitCompare className="h-5 w-5 text-primary" />
            Comparar Versiones
          </CardTitle>
          {onClose && (
            <Button variant="outline" size="sm" onClick={onClose}>
              Cerrar
            </Button>
          )}
        </div>
        
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-destructive/20 border-destructive/30">
              Versión {version1.version_number}
            </Badge>
            <span className="text-muted-foreground">
              {formatDistanceToNow(new Date(version1.created_at), { locale: es })}
            </span>
          </div>
          
          <ArrowRight className="h-4 w-4 text-muted-foreground" />
          
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-success/20 border-success/30">
              Versión {version2.version_number}
            </Badge>
            <span className="text-muted-foreground">
              {formatDistanceToNow(new Date(version2.created_at), { locale: es })}
            </span>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <Tabs defaultValue="content" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="content" className="gap-2">
              <FileText className="h-4 w-4" />
              Contenido
            </TabsTrigger>
            <TabsTrigger value="variables" className="gap-2">
              <Settings className="h-4 w-4" />
              Variables
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="content" className="space-y-4">
            <div className="flex justify-end">
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">Vista:</span>
                <Button
                  variant={compareMode === 'side-by-side' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setCompareMode('side-by-side')}
                >
                  Lado a Lado
                </Button>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Versión {version1.version_number}
                </h4>
                <ScrollArea className="h-96 border rounded-lg">
                  <div className="p-4 space-y-1">
                    {textDifferences.map((diff, index) => (
                      <div
                        key={index}
                        className={`px-2 py-1 text-sm font-mono ${getDifferenceClass(diff.type, 'left')}`}
                      >
                        <span className="text-muted-foreground text-xs mr-4">
                          {diff.lineNumber}
                        </span>
                        {diff.line1}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
              
              <div>
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <ArrowRight className="h-4 w-4" />
                  Versión {version2.version_number}
                </h4>
                <ScrollArea className="h-96 border rounded-lg">
                  <div className="p-4 space-y-1">
                    {textDifferences.map((diff, index) => (
                      <div
                        key={index}
                        className={`px-2 py-1 text-sm font-mono ${getDifferenceClass(diff.type, 'right')}`}
                      >
                        <span className="text-muted-foreground text-xs mr-4">
                          {diff.lineNumber}
                        </span>
                        {diff.line2}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="variables" className="space-y-4">
            <ScrollArea className="h-96">
              <div className="space-y-2">
                {variablesDifferences.map((diff, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg border ${
                      diff.type === 'unchanged' ? 'bg-background' : 
                      diff.type === 'added' ? 'bg-success/20 border-success/30' :
                      diff.type === 'removed' ? 'bg-destructive/20 border-destructive/30' :
                      'bg-warning/20 border-warning/30'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-sm">{diff.key}</span>
                      <Badge 
                        variant="outline" 
                        className={
                          diff.type === 'added' ? 'bg-success/20 border-success/30' :
                          diff.type === 'removed' ? 'bg-destructive/20 border-destructive/30' :
                          diff.type === 'modified' ? 'bg-warning/20 border-warning/30' :
                          'bg-muted/20'
                        }
                      >
                        {diff.type === 'added' ? 'Agregado' :
                         diff.type === 'removed' ? 'Eliminado' :
                         diff.type === 'modified' ? 'Modificado' :
                         'Sin cambios'}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Versión {version1.version_number}:</span>
                        <div className="font-mono bg-muted/30 p-2 rounded mt-1">
                          {diff.value1 || <span className="text-muted-foreground italic">vacío</span>}
                        </div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Versión {version2.version_number}:</span>
                        <div className="font-mono bg-muted/30 p-2 rounded mt-1">
                          {diff.value2 || <span className="text-muted-foreground italic">vacío</span>}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}