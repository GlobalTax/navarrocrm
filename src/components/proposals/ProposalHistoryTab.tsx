import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { useApp } from '@/contexts/AppContext'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { 
  History, FileText, Send, CheckCircle, Copy, Pencil, Trash2, 
  ArrowRightLeft, Clock 
} from 'lucide-react'
import { format, formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'

interface ProposalHistoryTabProps {
  proposalId: string
}

interface AuditEntry {
  id: string
  proposal_id: string
  org_id: string
  user_id: string
  action_type: string
  old_value: Record<string, unknown> | null
  new_value: Record<string, unknown> | null
  details: string | null
  created_at: string
}

const ACTION_CONFIG: Record<string, { icon: React.ElementType; label: string; color: string }> = {
  created: { icon: FileText, label: 'Creada', color: 'bg-primary/10 text-primary' },
  updated: { icon: Pencil, label: 'Actualizada', color: 'bg-warning/10 text-warning' },
  sent: { icon: Send, label: 'Enviada', color: 'bg-blue-100 text-blue-700' },
  accepted: { icon: CheckCircle, label: 'Aceptada', color: 'bg-green-100 text-green-700' },
  duplicated: { icon: Copy, label: 'Duplicada', color: 'bg-purple-100 text-purple-700' },
  status_changed: { icon: ArrowRightLeft, label: 'Estado cambiado', color: 'bg-orange-100 text-orange-700' },
  deleted: { icon: Trash2, label: 'Eliminada', color: 'bg-destructive/10 text-destructive' },
}

const getActionConfig = (actionType: string) => {
  return ACTION_CONFIG[actionType] || { icon: Clock, label: actionType, color: 'bg-muted text-muted-foreground' }
}

export const ProposalHistoryTab = ({ proposalId }: ProposalHistoryTabProps) => {
  const { user } = useApp()

  const { data: history = [], isLoading } = useQuery({
    queryKey: ['proposal-history', proposalId],
    queryFn: async () => {
      if (!user?.org_id) return []

      const { data, error } = await supabase
        .from('proposal_audit_log')
        .select('*')
        .eq('proposal_id', proposalId)
        .order('created_at', { ascending: false })

      if (error) throw error
      return (data || []) as AuditEntry[]
    },
    enabled: !!proposalId && !!user?.org_id,
  })

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="flex gap-4">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-3 w-32" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (history.length === 0) {
    return (
      <div className="bg-card p-12 rounded-lg border shadow-sm text-center">
        <History className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <div className="text-lg font-medium mb-2 text-card-foreground">Sin historial</div>
        <p className="text-sm text-muted-foreground">
          Aún no se han registrado acciones para esta propuesta.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <History className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold text-card-foreground">Historial de Actividad</h3>
        <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
          {history.length} evento{history.length !== 1 ? 's' : ''}
        </Badge>
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Línea vertical */}
        <div className="absolute left-5 top-0 bottom-0 w-px bg-border" />

        <div className="space-y-6">
          {history.map((entry) => {
            const config = getActionConfig(entry.action_type)
            const Icon = config.icon
            const createdAt = new Date(entry.created_at)

            return (
              <div key={entry.id} className="relative flex gap-4 pl-0">
                {/* Icono del timeline */}
                <div className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-background ${config.color}`}>
                  <Icon className="h-4 w-4" />
                </div>

                {/* Contenido */}
                <div className="flex-1 bg-card rounded-lg border shadow-sm p-4 -mt-1">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={config.color}>
                        {config.label}
                      </Badge>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(createdAt, { addSuffix: true, locale: es })}
                    </span>
                  </div>

                  {entry.details && (
                    <p className="text-sm text-card-foreground mt-2">{entry.details}</p>
                  )}

                  <div className="text-xs text-muted-foreground mt-2">
                    {format(createdAt, "d 'de' MMMM yyyy, HH:mm", { locale: es })}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
