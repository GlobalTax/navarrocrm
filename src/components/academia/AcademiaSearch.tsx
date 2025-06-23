
import React from 'react'
import { Search, Filter } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

interface AcademiaSearchProps {
  searchTerm: string
  onSearchChange: (term: string) => void
}

export function AcademiaSearch({ searchTerm, onSearchChange }: AcademiaSearchProps) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="space-y-3">
          <h3 className="font-semibold text-gray-900">Buscar contenido</h3>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar tutoriales, guías..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="outline" size="sm" className="w-full">
            <Filter className="h-4 w-4 mr-2" />
            Filtros avanzados
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
