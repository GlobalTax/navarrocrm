import { useState, useEffect } from 'react'
import { Filter } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { PracticeArea } from '@/hooks/usePracticeAreas'
import { User } from '@/hooks/useUsers'
import { useDebounce } from '@/hooks/useDebounce'

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
  const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm)
  const debouncedSearchTerm = useDebounce(localSearchTerm, 300)

  useEffect(() => {
    setSearchTerm(debouncedSearchTerm)
  }, [debouncedSearchTerm, setSearchTerm])

  return (
    <Card className="mb-6">
      <CardContent className="pt-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="h-4 w-4" />
          <span className="font-medium">Filtros</span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <Input
              placeholder="Buscar expedientes..."
              value={localSearchTerm}
              onChange={(e) => setLocalSearchTerm(e.target.value)}
            />
          </div>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los estados</SelectItem>
              <SelectItem value="active">Activo</SelectItem>
              <SelectItem value="pending">Pendiente</SelectItem>
              <SelectItem value="closed">Cerrado</SelectItem>
              <SelectItem value="archived">Archivado</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={practiceAreaFilter} onValueChange={setPracticeAreaFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Área de práctica" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las áreas</SelectItem>
              {practiceAreas.map((area) => (
                <SelectItem key={area.id} value={area.id}>
                  {area.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={solicitorFilter} onValueChange={setSolicitorFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Responsable" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los responsables</SelectItem>
              {users.map((user) => (
                <SelectItem key={user.id} value={user.id}>
                  {user.email}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  )
}