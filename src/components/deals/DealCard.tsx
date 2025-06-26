
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Calendar, DollarSign, User, Eye, Edit, MoreHorizontal } from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import type { Proposal } from '@/hooks/useProposals'

interface DealCardProps {
  deal: Proposal
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'won': return 'bg-green-100 text-green-800'
    case 'lost': return 'bg-red-100 text-red-800'
    case 'sent': return 'bg-blue-100 text-blue-800'
    case 'draft': return 'bg-gray-100 text-gray-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'won': return 'Ganado'
    case 'lost': return 'Perdido'
    case 'sent': return 'Enviado'
    case 'draft': return 'Borrador'
    default: return status
  }
}

export function DealCard({ deal }: DealCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="font-semibold text-lg">{deal.title}</h3>
              <Badge className={getStatusColor(deal.status)}>
                {getStatusLabel(deal.status)}
              </Badge>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span>{deal.contact?.name || 'Sin contacto'}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                <span>€{deal.total_amount?.toLocaleString() || '0'}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>
                  {deal.created_at 
                    ? format(new Date(deal.created_at), 'dd/MM/yyyy', { locale: es })
                    : 'Sin fecha'
                  }
                </span>
              </div>
            </div>

            {deal.description && (
              <p className="text-sm text-muted-foreground mt-3 line-clamp-2">
                {deal.description}
              </p>
            )}
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Eye className="h-4 w-4 mr-2" />
                Ver Detalles
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  )
}
