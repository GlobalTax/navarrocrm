
import { Filter } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { PracticeArea } from '@/hooks/usePracticeAreas'
import { User } from '@/hooks/useUsers'

interface CasesFiltersProps {
  searchTerm: string
  setSearchTerm: (value: string) => void
  statusFilter: string
  setStatusFilter: (value: string) => void
  practiceAreaFilter: string
  setPracticeAreaFilter: (value: string) => void
  solicitorFilter: string
  setSolicitorFilter: (value: string) => void
  practiceAreas: PracticeArea[]
  users: User[]
}

export function CasesFilters({
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  practiceAreaFilter,
  setPracticeAreaFilter,
  solicitorFilter,
  setSolicitorFilter,
  practiceAreas,
  users
}: CasesFiltersProps) {
  return (
    <Card className="mb-6">
      <CardContent className="pt-6">
        <div className="flex flex-col space-y-4 md:flex-row md:items-center md:space-y-0 md:space-x-4">
          <div className="flex-1">
            <Input
              placeholder="Buscar expedientes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="active">Activos</SelectItem>
                <SelectItem value="open">Abierto</SelectItem>
                <SelectItem value="on_hold">En espera</SelectItem>
                <SelectItem value="closed">Cerrado</SelectItem>
                <SelectItem value="archived">Archivados</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={practiceAreaFilter} onValueChange={setPracticeAreaFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Área de práctica" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las áreas</SelectItem>
                {practiceAreas.map((area) => (
                  <SelectItem key={area.id} value={area.name}>{area.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={solicitorFilter} onValueChange={setSolicitorFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Abogado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los abogados</SelectItem>
                {users.map((user) => (
                  <SelectItem key={user.id} value={user.id}>{user.email}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Más filtros
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
