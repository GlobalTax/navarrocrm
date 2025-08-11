import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'

export interface PublicDeedRow {
  id: string
  title: string
  deed_type: string
  status: string | null
  signing_date?: string | null
  contact_id: string
}

interface Props {
  deeds: PublicDeedRow[]
  getContactName: (id: string) => string | undefined
  onRefresh: () => void
  onUpdateStatus: (id: string, status: string) => void
}

export default function DeedsTable({ deeds, getContactName, onRefresh, onUpdateStatus }: Props) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="text-left border-b">
            <th className="py-2 pr-4">Título</th>
            <th className="py-2 pr-4">Tipo</th>
            <th className="py-2 pr-4">Estado</th>
            <th className="py-2 pr-4">Fecha firma</th>
            <th className="py-2 pr-4">Cliente</th>
          </tr>
        </thead>
        <tbody>
          {deeds.map((d) => (
            <tr key={d.id} className="border-b hover:bg-muted/50 transition-colors">
              <td className="py-2 pr-4">{d.title}</td>
              <td className="py-2 pr-4 capitalize">{d.deed_type.replace(/_/g, ' ')}</td>
              <td className="py-2 pr-4">
                <Select value={d.status ?? 'draft'} onValueChange={(v) => onUpdateStatus(d.id, v)}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Borrador</SelectItem>
                    <SelectItem value="pending_signature">Pendiente firma</SelectItem>
                    <SelectItem value="signed">Firmada</SelectItem>
                    <SelectItem value="in_registry">En registro</SelectItem>
                    <SelectItem value="completed">Completada</SelectItem>
                  </SelectContent>
                </Select>
              </td>
              <td className="py-2 pr-4">{d.signing_date ? new Date(d.signing_date).toLocaleDateString('es-ES') : '-'}</td>
              <td className="py-2 pr-4">{getContactName(d.contact_id) || d.contact_id}</td>
            </tr>
          ))}
          {deeds.length === 0 && (
            <tr>
              <td className="py-6 text-muted-foreground" colSpan={5}>No hay escrituras aún.</td>
            </tr>
          )}
        </tbody>
      </table>
      <div className="mt-3">
        <Button variant="outline" onClick={onRefresh}>Refrescar</Button>
      </div>
    </div>
  )
}
