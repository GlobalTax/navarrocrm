
import { useState } from 'react'
import { CaseTable } from './CaseTable'
import { CasesGrid } from './CasesGrid'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Search, Table, Grid, Plus, FileDown, Filter, XCircle } from 'lucide-react'
import { Case } from '@/hooks/useCases'

interface CasesMainContentProps {
  filteredCases: Case[]
  templates: any[]
  searchTerm: string
  onSearchChange: (term: string) => void
  statusFilter: string
  setStatusFilter: (status: string) => void
  practiceAreaFilter: string
  setPracticeAreaFilter: (area: string) => void
  solicitorFilter: string
  setSolicitorFilter: (solicitor: string) => void
  hasActiveFilters: boolean
  onClearFilters: () => void
  selectedCases: string[]
  onViewCase: (case_: Case) => void
  onOpenWorkspace: (case_: Case) => void
  onEditCase: (case_: Case) => void
  onDeleteCase: (case_: Case) => void
  onArchiveCase: (case_: Case) => void
  onSelectCase: (caseId: string, selected: boolean) => void
  onSelectAll: (selected: boolean) => void
  searchResultsWithScore?: { id: string; score: number }[]
  isSearching: boolean
  statusOptions: { label: string; value: string }[]
  practiceAreaOptions: { label: string; value: string }[]
  solicitorOptions: { label: string; value: string }[]
}

export function CasesMainContent({
  filteredCases,
  templates,
  searchTerm,
  onSearchChange,
  statusFilter,
  setStatusFilter,
  practiceAreaFilter,
  setPracticeAreaFilter,
  solicitorFilter,
  setSolicitorFilter,
  hasActiveFilters,
  onClearFilters,
  selectedCases,
  onViewCase,
  onOpenWorkspace,
  onEditCase,
  onDeleteCase,
  onArchiveCase,
  onSelectCase,
  onSelectAll,
  searchResultsWithScore,
  isSearching,
  statusOptions,
  practiceAreaOptions,
  solicitorOptions
}: CasesMainContentProps) {
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table')

  const handleBulkDelete = () => {
    alert('Eliminar casos seleccionados')
  }

  const handleBulkArchive = () => {
    alert('Archivar casos seleccionados')
  }

  const handleBulkExport = () => {
    alert('Exportar casos seleccionados')
  }

  const handleViewModeChange = (value: string) => {
    setViewMode(value as 'table' | 'grid')
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
            <Input
              type="search"
              placeholder="Buscar expedientes..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filtrar
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              <div className="p-4 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="status">Estado</Label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger id="status">
                      <SelectValue placeholder="Todos los estados" />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="practice-area">Área de Práctica</Label>
                  <Select
                    value={practiceAreaFilter}
                    onValueChange={setPracticeAreaFilter}
                  >
                    <SelectTrigger id="practice-area">
                      <SelectValue placeholder="Todas las áreas" />
                    </SelectTrigger>
                    <SelectContent>
                      {practiceAreaOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="solicitor">Abogado Responsable</Label>
                  <Select value={solicitorFilter} onValueChange={setSolicitorFilter}>
                    <SelectTrigger id="solicitor">
                      <SelectValue placeholder="Todos los abogados" />
                    </SelectTrigger>
                    <SelectContent>
                      {solicitorOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {hasActiveFilters && (
                  <Button
                    variant="link"
                    size="sm"
                    className="justify-start text-red-500"
                    onClick={onClearFilters}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Borrar filtros
                  </Button>
                )}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex items-center gap-2">
          {selectedCases.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Acciones ({selectedCases.length})
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleBulkDelete}>
                  Eliminar
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleBulkArchive}>
                  Archivar
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleBulkExport}>
                  Exportar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      <Tabs value={viewMode} onValueChange={handleViewModeChange}>
        <div className="flex items-center justify-between mb-4">
          <TabsList>
            <TabsTrigger value="table">
              <Table className="h-4 w-4 mr-2" />
              Tabla
            </TabsTrigger>
            <TabsTrigger value="grid">
              <Grid className="h-4 w-4 mr-2" />
              Tarjetas
            </TabsTrigger>
          </TabsList>
          
          {selectedCases.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Acciones ({selectedCases.length})
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleBulkDelete}>
                  Eliminar
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleBulkArchive}>
                  Archivar
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleBulkExport}>
                  Exportar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        <TabsContent value="table">
          <CaseTable
            cases={filteredCases}
            selectedCases={selectedCases}
            onViewCase={onViewCase}
            onOpenWorkspace={onOpenWorkspace}
            onEditCase={onEditCase}
            onDeleteCase={onDeleteCase}
            onArchiveCase={onArchiveCase}
            onSelectCase={onSelectCase}
            onSelectAll={onSelectAll}
          />
        </TabsContent>

        <TabsContent value="grid">
          <CasesGrid
            cases={filteredCases}
            selectedCases={selectedCases}
            onViewCase={onViewCase}
            onOpenWorkspace={onOpenWorkspace}
            onEditCase={onEditCase}
            onDeleteCase={onDeleteCase}
            onArchiveCase={onArchiveCase}
            onSelectCase={onSelectCase}
            onSelectAll={onSelectAll}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
