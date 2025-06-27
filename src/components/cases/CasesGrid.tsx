
import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Eye, Edit, Trash2, Archive, MoreHorizontal, Briefcase } from 'lucide-react'
import { Case } from '@/hooks/useCases'

interface CasesGridProps {
  cases: Case[]
  selectedCases: string[]
  onViewCase: (case_: Case) => void
  onOpenWorkspace?: (case_: Case) => void
  onEditCase: (case_: Case) => void
  onDeleteCase: (case_: Case) => void
  onArchiveCase: (case_: Case) => void
  onSelectCase: (caseId: string, selected: boolean) => void
  onSelectAll: (selected: boolean) => void
}

export function CasesGrid({ 
  cases, 
  selectedCases, 
  onViewCase, 
  onOpenWorkspace,
  onEditCase, 
  onDeleteCase, 
  onArchiveCase, 
  onSelectCase, 
  onSelectAll 
}: CasesGridProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-blue-100 text-blue-800'
      case 'on_hold': return 'bg-yellow-100 text-yellow-800'
      case 'closed': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'open': return 'Abierto'
      case 'on_hold': return 'En Espera'
      case 'closed': return 'Cerrado'
      default: return status
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {cases.map((case_) => (
        <Card key={case_.id} className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={selectedCases.includes(case_.id)}
                    onCheckedChange={(checked) => onSelectCase(case_.id, !!checked)}
                  />
                  <h3 className="font-medium text-sm">{case_.title}</h3>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {onOpenWorkspace && (
                      <>
                        <DropdownMenuItem onClick={() => onOpenWorkspace(case_)}>
                          <Briefcase className="h-4 w-4 mr-2" />
                          Abrir Workspace
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                      </>
                    )}
                    <DropdownMenuItem onClick={() => onViewCase(case_)}>
                      <Eye className="h-4 w-4 mr-2" />
                      Ver Detalles
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onEditCase(case_)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Editar
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => onArchiveCase(case_)}>
                      <Archive className="h-4 w-4 mr-2" />
                      Archivar
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => onDeleteCase(case_)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Eliminar
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              
              {case_.description && (
                <p className="text-sm text-gray-600 line-clamp-2">{case_.description}</p>
              )}
              
              <div className="flex items-center justify-between">
                <Badge className={getStatusColor(case_.status)}>
                  {getStatusLabel(case_.status)}
                </Badge>
                <div className="text-xs text-gray-500">
                  {new Date(case_.created_at).toLocaleDateString()}
                </div>
              </div>
              
              <div className="space-y-1 text-xs text-gray-500">
                <div>Cliente: {case_.contact?.name || 'Sin asignar'}</div>
                <div>Área: {case_.practice_area || 'No especificada'}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
