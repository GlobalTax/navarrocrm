import { useMemo } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card } from '@/components/ui/card'
import { toast } from 'sonner'

export interface KanbanDeedCard {
  id: string
  title: string
  contact_id: string
  deed_type: string
  status: string | null
}

const STATUSES = [
  'NOTARIO_FIRMADA',
  'IMPUESTOS_PENDIENTES',
  'IMPUESTOS_ACREDITADOS',
  'EN_REGISTRO',
  'EN_CALIFICACION',
  'DEFECTOS',
  'SUBSANACION',
  'INSCRITA',
  'BORME_PUBLICADO',
  'CIERRE_EXPEDIENTE',
] as const

const statusIndex = Object.fromEntries(STATUSES.map((s, i) => [s, i])) as Record<string, number>

interface Props {
  deeds: KanbanDeedCard[]
  getContactName: (id: string) => string | undefined
  onUpdateStatus: (id: string, status: string) => void
  onSelect: (id: string) => void
}

export default function DeedsKanban({ deeds, getContactName, onUpdateStatus, onSelect }: Props) {
  const grouped = useMemo(() => {
    const m: Record<string, KanbanDeedCard[]> = {}
    STATUSES.forEach(s => (m[s] = []))
    deeds.forEach(d => {
      const key = (d.status ?? 'NOTARIO_FIRMADA') as string
      if (!m[key]) m[key] = []
      m[key].push(d)
    })
    return m
  }, [deeds])

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, newStatus: string) => {
    e.preventDefault()
    const id = e.dataTransfer.getData('text/plain')
    const deed = deeds.find(d => d.id === id)
    if (!deed) return

    // Bloqueo: no permitir ir a EN_CALIFICACION si aún no se han acreditado tributos (UI guardrail)
    if (newStatus === 'EN_CALIFICACION') {
      const curIdx = statusIndex[deed.status ?? 'NOTARIO_FIRMADA'] ?? 0
      const minIdx = statusIndex['IMPUESTOS_ACREDITADOS']
      if (curIdx < minIdx) {
        toast.error('Primero acredita ITP/AJD y plusvalía (Tributos) antes de pasar a calificación')
        return
      }
    }

    onUpdateStatus(id, newStatus)
  }

  return (
    <div className="overflow-x-auto">
      <div className="flex gap-4 min-w-[960px]">
        {STATUSES.map((col) => (
          <div
            key={col}
            className="w-72 flex-shrink-0"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => handleDrop(e, col)}
          >
            <div className="mb-2 font-medium">{col.replace(/_/g, ' ')}</div>
            <Card className="p-2 border rounded-[10px] min-h-[260px] max-h-[500px] overflow-y-auto">
              {(grouped[col] || []).map((d) => (
                <article
                  key={d.id}
                  className="border rounded-[10px] p-3 mb-2 bg-card hover:shadow-lg transition-transform duration-200 ease-out"
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData('text/plain', d.id)
                  }}
                  onClick={() => onSelect(d.id)}
                  role="button"
                >
                  <h4 className="font-semibold text-sm leading-tight mb-1">{d.title}</h4>
                  <div className="text-xs text-muted-foreground mb-2">{getContactName(d.contact_id) || d.contact_id}</div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] px-2 py-1 border rounded-[10px]">{d.deed_type}</span>
                    <Select value={d.status ?? ''} onValueChange={(v) => onUpdateStatus(d.id, v)}>
                      <SelectTrigger className="h-8 w-[42%] rounded-[10px]">
                        <SelectValue placeholder="Mover a" />
                      </SelectTrigger>
                      <SelectContent className="z-50 bg-popover">
                        {STATUSES.map((s) => (
                          <SelectItem key={s} value={s}>{s.replace(/_/g, ' ')}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </article>
              ))}
              {(!grouped[col] || grouped[col].length === 0) && (
                <div className="text-xs text-muted-foreground p-2">Sin elementos</div>
              )}
            </Card>
          </div>
        ))}
      </div>
    </div>
  )
}
