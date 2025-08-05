
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

interface CasesBulkActionsProps {
  selectedCases: string[]
}

export function CasesBulkActions({ selectedCases }: CasesBulkActionsProps) {
  if (selectedCases.length === 0) return null

  return (
    <Card className="mb-4">
      <CardContent className="py-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            {selectedCases.length} expediente(s) seleccionado(s)
          </span>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">Cambiar estado</Button>
            <Button variant="outline" size="sm">Asignar asesor</Button>
            <Button variant="outline" size="sm">Exportar seleccionados</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
