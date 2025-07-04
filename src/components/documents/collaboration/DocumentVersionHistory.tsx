import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Clock, User, RotateCcw, GitCompare, FileText } from 'lucide-react'
import { DocumentVersion, useDocumentCollaboration } from '@/hooks/useDocumentCollaboration'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'

interface DocumentVersionHistoryProps {
  documentId: string
  onCompareVersions?: (version1: DocumentVersion, version2: DocumentVersion) => void
  onRestoreVersion?: (versionId: string) => void
}

export const DocumentVersionHistory = ({
  documentId,
  onCompareVersions,
  onRestoreVersion
}: DocumentVersionHistoryProps) => {
  const { versions, restoreVersion } = useDocumentCollaboration(documentId)
  const [selectedVersions, setSelectedVersions] = useState<string[]>([])

  const handleVersionSelect = (versionId: string) => {
    setSelectedVersions(prev => {
      if (prev.includes(versionId)) {
        return prev.filter(id => id !== versionId)
      }
      if (prev.length >= 2) {
        return [prev[1], versionId]
      }
      return [...prev, versionId]
    })
  }

  const handleCompare = () => {
    if (selectedVersions.length === 2 && onCompareVersions) {
      const version1 = versions.find(v => v.id === selectedVersions[0])
      const version2 = versions.find(v => v.id === selectedVersions[1])
      if (version1 && version2) {
        onCompareVersions(version1, version2)
      }
    }
  }

  const handleRestore = (versionId: string) => {
    if (onRestoreVersion) {
      onRestoreVersion(versionId)
    } else {
      restoreVersion.mutate(versionId)
    }
  }

  const getVersionStatusColor = (version: DocumentVersion) => {
    if (version.version_number === Math.max(...versions.map(v => v.version_number))) {
      return 'bg-success/10 text-success-foreground border-success/20'
    }
    return 'bg-muted/50 text-muted-foreground border-muted'
  }

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            Historial de Versiones
          </CardTitle>
          <div className="flex gap-2">
            {selectedVersions.length === 2 && (
              <Button 
                size="sm" 
                variant="outline" 
                onClick={handleCompare}
                className="gap-2"
              >
                <GitCompare className="h-4 w-4" />
                Comparar
              </Button>
            )}
          </div>
        </div>
        {selectedVersions.length > 0 && (
          <p className="text-sm text-muted-foreground">
            {selectedVersions.length === 1 
              ? 'Selecciona otra versión para comparar'
              : `${selectedVersions.length} versiones seleccionadas`
            }
          </p>
        )}
      </CardHeader>
      
      <CardContent className="p-0">
        <ScrollArea className="h-96">
          <div className="space-y-3 p-4">
            {versions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No hay versiones disponibles</p>
              </div>
            ) : (
              versions.map((version, index) => (
                <div key={version.id} className="space-y-3">
                  <div 
                    className={`p-4 rounded-lg border cursor-pointer transition-all hover:shadow-sm ${
                      selectedVersions.includes(version.id) 
                        ? 'bg-primary/5 border-primary/30' 
                        : 'bg-background hover:bg-muted/30'
                    }`}
                    onClick={() => handleVersionSelect(version.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge 
                            variant="outline" 
                            className={getVersionStatusColor(version)}
                          >
                            Versión {version.version_number}
                          </Badge>
                          
                          {version.version_number === Math.max(...versions.map(v => v.version_number)) && (
                            <Badge variant="default" className="text-xs">
                              Actual
                            </Badge>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                          <User className="h-3 w-3" />
                          <span>Usuario</span>
                          <span>•</span>
                          <span>
                            {formatDistanceToNow(new Date(version.created_at), { 
                              addSuffix: true, 
                              locale: es 
                            })}
                          </span>
                        </div>
                        
                        {version.changes_summary && (
                          <p className="text-sm text-foreground/80">
                            {version.changes_summary}
                          </p>
                        )}
                      </div>
                      
                      <div className="flex flex-col gap-1 ml-4">
                        {version.version_number !== Math.max(...versions.map(v => v.version_number)) && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleRestore(version.id)
                            }}
                            disabled={restoreVersion.isPending}
                            className="gap-1 text-xs"
                          >
                            <RotateCcw className="h-3 w-3" />
                            Restaurar
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {index < versions.length - 1 && (
                    <Separator className="my-2" />
                  )}
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}