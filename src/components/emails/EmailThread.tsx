import { useParams, useNavigate } from 'react-router-dom'
import { StandardPageHeader } from '@/components/layout/StandardPageHeader'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Reply, ReplyAll, Forward, Archive } from 'lucide-react'

export function EmailThread() {
  const { threadId } = useParams<{ threadId: string }>()
  const navigate = useNavigate()

  // TODO: Cargar datos del thread desde la API

  return (
    <div className="space-y-6">
      <StandardPageHeader
        title="Conversación de Email"
        description={`Thread ID: ${threadId}`}
        actions={
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(-1)}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Volver
            </Button>
            <Button variant="outline" size="sm" className="gap-2">
              <Reply className="h-4 w-4" />
              Responder
            </Button>
            <Button variant="outline" size="sm" className="gap-2">
              <ReplyAll className="h-4 w-4" />
              Responder a todos
            </Button>
            <Button variant="outline" size="sm" className="gap-2">
              <Forward className="h-4 w-4" />
              Reenviar
            </Button>
            <Button variant="outline" size="sm" className="gap-2">
              <Archive className="h-4 w-4" />
              Archivar
            </Button>
          </div>
        }
      />

      <Card className="border-0.5 border-black rounded-[10px]">
        <CardContent className="p-6">
          <div className="text-center py-12 text-muted-foreground">
            <h3 className="text-lg font-medium mb-2">Conversación no encontrada</h3>
            <p className="text-sm">
              Esta funcionalidad se completará una vez que se implementen las APIs de email
            </p>
            <Badge variant="outline" className="mt-4">
              Thread ID: {threadId}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}