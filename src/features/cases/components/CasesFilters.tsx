import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Search, Filter } from 'lucide-react'
import { useDebounce } from '@/hooks/useDebounce'
import { PracticeArea } from '@/hooks/usePracticeAreas'
import { User } from '@/hooks/useUsers'

interface CasesFiltersProps {
  searchTerm: string
  setSearchTerm: (term: string) => void
  statusFilter: string
  setStatusFilter: (status: string) => void
  practiceAreaFilter: string
  setPracticeAreaFilter: (area: string) => void
  solicitorFilter: string
  setSolicitorFilter: (solicitor: string) => void
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
  const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm)
  const debouncedSearchTerm = useDebounce(localSearchTerm, 300)

  useEffect(() => {
    setSearchTerm(debouncedSearchTerm)
  }, [debouncedSearchTerm, setSearchTerm])

  return (
    <Card className="mb-6">
      <CardContent className="pt-6">
        <div className="flex flex-col space-y-4 md:flex-row md:items-center md:space-y-0 md:space-x-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar expedientes..."
                value={localSearchTerm}
                onChange={(e) => setLocalSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Filtrar por estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los estados</SelectItem>
              <SelectItem value="open">Abierto</SelectItem>
              <SelectItem value="closed">Cerrado</SelectItem>
              <SelectItem value="on_hold">En espera</SelectItem>
            </SelectContent>
          </Select>

          <Select value={practiceAreaFilter} onValueChange={setPracticeAreaFilter}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Área práctica" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las áreas</SelectItem>
              {practiceAreas.map((area) => (
                <SelectItem key={area.id} value={area.name}>
                  {area.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={solicitorFilter} onValueChange={setSolicitorFilter}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Asesor" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los asesores</SelectItem>
              {users.map((user) => (
                <SelectItem key={user.id} value={user.id}>
                  {user.full_name || user.email}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button variant="outline" size="default">
            <Filter className="h-4 w-4 mr-2" />
            Más filtros
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}