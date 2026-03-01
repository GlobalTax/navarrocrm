import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useClassificationReviews } from '@/hooks/useClassificationReviews'
import { 
  Search, CheckCircle, XCircle, AlertTriangle, RefreshCw, Building, User, Sparkles
} from 'lucide-react'

export const ClassificationReviewPanel = () => {
  const {
    reviews,
    isLoadingReviews,
    statusFilter,
    setStatusFilter,
    detectMisclassified,
    isDetecting,
    detectedContacts,
    createReviews,
    isCreatingReviews,
    approveReviews,
    isApproving,
    rejectReviews,
    isRejecting,
  } = useClassificationReviews()

  const [selectedIds, setSelectedIds] = useState<string[]>([])

  const handleDetectAndCreate = async () => {
    const detected = await detectMisclassified()
    if (detected && detected.length > 0) {
      await createReviews(detected)
    } else {
      // No se encontraron contactos mal clasificados
    }
  }

  const handleApprove = async () => {
    if (selectedIds.length === 0) return
    await approveReviews(selectedIds)
    setSelectedIds([])
  }

  const handleReject = async () => {
    if (selectedIds.length === 0) return
    await rejectReviews(selectedIds)
    setSelectedIds([])
  }

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  const toggleSelectAll = () => {
    if (selectedIds.length === reviews.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(reviews.map(r => r.id))
    }
  }

  const getConfidenceBadge = (confidence: number) => {
    if (confidence >= 0.90) return <Badge className="bg-green-100 text-green-800 border-[0.5px] border-green-300 rounded-[10px]">Alta ({(confidence * 100).toFixed(0)}%)</Badge>
    if (confidence >= 0.80) return <Badge className="bg-yellow-100 text-yellow-800 border-[0.5px] border-yellow-300 rounded-[10px]">Media ({(confidence * 100).toFixed(0)}%)</Badge>
    return <Badge className="bg-orange-100 text-orange-800 border-[0.5px] border-orange-300 rounded-[10px]">Baja ({(confidence * 100).toFixed(0)}%)</Badge>
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending': return <Badge variant="outline" className="rounded-[10px] border-[0.5px]">Pendiente</Badge>
      case 'approved': return <Badge className="bg-green-100 text-green-800 rounded-[10px] border-[0.5px] border-green-300">Aprobada</Badge>
      case 'rejected': return <Badge className="bg-red-100 text-red-800 rounded-[10px] border-[0.5px] border-red-300">Rechazada</Badge>
      case 'auto_applied': return <Badge className="bg-blue-100 text-blue-800 rounded-[10px] border-[0.5px] border-blue-300">Auto-aplicada</Badge>
      default: return <Badge variant="outline" className="rounded-[10px]">{status}</Badge>
    }
  }

  const getPatternLabel = (pattern: string) => {
    switch (pattern) {
      case 'suffix_sl': return 'Sufijo S.L./S.A.'
      case 'suffix_intl': return 'Sufijo internacional'
      case 'keyword_org': return 'Palabra clave organización'
      case 'keyword_business': return 'Palabra clave negocio'
      case 'nif_empresa': return 'NIF de empresa'
      case 'suffix': return 'Sufijo empresa'
      case 'keyword': return 'Palabra clave'
      default: return pattern
    }
  }

  return (
    <Card className="border-[0.5px] border-black rounded-[10px]">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Sparkles className="w-5 h-5" />
            Clasificación Inteligente de Contactos
          </CardTitle>
          <Button 
            onClick={handleDetectAndCreate}
            disabled={isDetecting || isCreatingReviews}
            className="rounded-[10px] border-[0.5px] border-black"
          >
            {isDetecting || isCreatingReviews ? (
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Search className="w-4 h-4 mr-2" />
            )}
            Detectar mal clasificados
          </Button>
        </div>

        <div className="flex items-center gap-4 mt-4">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[200px] rounded-[10px] border-[0.5px] border-black">
              <SelectValue placeholder="Filtrar por estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="pending">Pendientes</SelectItem>
              <SelectItem value="approved">Aprobadas</SelectItem>
              <SelectItem value="rejected">Rechazadas</SelectItem>
              <SelectItem value="auto_applied">Auto-aplicadas</SelectItem>
            </SelectContent>
          </Select>

          {selectedIds.length > 0 && statusFilter === 'pending' && (
            <div className="flex items-center gap-2">
              <Button 
                size="sm" 
                onClick={handleApprove}
                disabled={isApproving}
                className="rounded-[10px] border-[0.5px] border-black bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="w-4 h-4 mr-1" />
                Aprobar ({selectedIds.length})
              </Button>
              <Button 
                size="sm" 
                variant="outline"
                onClick={handleReject}
                disabled={isRejecting}
                className="rounded-[10px] border-[0.5px] border-black"
              >
                <XCircle className="w-4 h-4 mr-1" />
                Rechazar ({selectedIds.length})
              </Button>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent>
        {isLoadingReviews ? (
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <AlertTriangle className="w-10 h-10 mx-auto mb-3 opacity-50" />
            <p>No hay revisiones de clasificación {statusFilter !== 'all' && `con estado "${statusFilter}"`}</p>
            <p className="text-sm mt-1">Pulsa "Detectar mal clasificados" para analizar los contactos</p>
          </div>
        ) : (
          <>
            {statusFilter === 'pending' && reviews.length > 0 && (
              <div className="flex items-center gap-2 mb-3 pb-3 border-b border-border">
                <Checkbox 
                  checked={selectedIds.length === reviews.length && reviews.length > 0}
                  onCheckedChange={toggleSelectAll}
                />
                <span className="text-sm text-muted-foreground">Seleccionar todos ({reviews.length})</span>
              </div>
            )}
            <ScrollArea className="h-[400px]">
              <div className="space-y-2">
                {reviews.map(review => {
                  const patterns = (review.reason as any)?.matched_patterns || []
                  return (
                    <div 
                      key={review.id} 
                      className="flex items-center gap-3 p-3 rounded-[10px] border-[0.5px] border-black/20 hover:shadow-sm transition-all duration-200 hover:-translate-y-[1px]"
                    >
                      {statusFilter === 'pending' && (
                        <Checkbox
                          checked={selectedIds.includes(review.id)}
                          onCheckedChange={() => toggleSelect(review.id)}
                        />
                      )}
                      
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">→</span>
                        <Building className="w-4 h-4 text-primary" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">
                          {/* We show contact_id since we don't join name here */}
                          ID: {review.contact_id.slice(0, 8)}...
                        </p>
                        <div className="flex items-center gap-1 mt-1 flex-wrap">
                          {patterns.map((p: string, i: number) => (
                            <Badge key={i} variant="outline" className="text-xs rounded-[10px] border-[0.5px]">
                              {getPatternLabel(p)}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {getConfidenceBadge(review.confidence)}
                        {getStatusBadge(review.status)}
                      </div>
                    </div>
                  )
                })}
              </div>
            </ScrollArea>
          </>
        )}
      </CardContent>
    </Card>
  )
}
