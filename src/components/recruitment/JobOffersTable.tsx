import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Search, Plus, MoreHorizontal, Eye, Send, Edit, Trash2, Download } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

interface JobOffer {
  id: string
  candidate_id: string
  position: string
  salary: number
  salary_currency: string
  start_date: string
  status: 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired'
  created_at: string
  candidate?: {
    first_name: string
    last_name: string
    email: string
  }
}

interface JobOffersTableProps {
  jobOffers: any[]
  isLoading?: boolean
  onCreateOffer: () => void
  onViewOffer: (offer: any) => void
  onEditOffer: (offer: any) => void
  onSendOffer: (offer: any) => void
  onDeleteOffer: (offer: any) => void
}

export function JobOffersTable({
  jobOffers,
  isLoading,
  onCreateOffer,
  onViewOffer,
  onEditOffer,
  onSendOffer,
  onDeleteOffer
}: JobOffersTableProps) {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')

  const filteredOffers = jobOffers.filter(offer => {
    const candidateName = offer.candidate 
      ? `${offer.candidate.first_name} ${offer.candidate.last_name}`.toLowerCase()
      : ''
    const searchLower = searchTerm.toLowerCase()
    
    return candidateName.includes(searchLower) ||
           offer.position?.toLowerCase().includes(searchLower) ||
           offer.status?.toLowerCase().includes(searchLower)
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-100 text-gray-800 border-gray-200'
      case 'sent':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'accepted':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'expired':
        return 'bg-orange-100 text-orange-800 border-orange-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'draft':
        return 'Borrador'
      case 'sent':
        return 'Enviada'
      case 'accepted':
        return 'Aceptada'
      case 'rejected':
        return 'Rechazada'
      case 'expired':
        return 'Expirada'
      default:
        return status
    }
  }

  const formatSalary = (salary: number, currency: string) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: currency || 'EUR'
    }).format(salary)
  }

  const handleViewOffer = (offer: any) => {
    navigate(`/recruitment/job-offers/${offer.id}`)
  }

  if (isLoading) {
    return (
      <Card className="border-0.5 border-foreground rounded-[10px] shadow-sm">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-12 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-0.5 border-foreground rounded-[10px] shadow-sm hover:shadow-lg transition-all duration-200">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">Ofertas de Trabajo</CardTitle>
          <Button 
            onClick={onCreateOffer}
            size="sm"
            className="gap-2 border-0.5 border-foreground rounded-[10px]"
          >
            <Plus className="h-4 w-4" />
            Nueva Oferta
          </Button>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Buscar ofertas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 border-0.5 border-foreground rounded-[10px]"
            />
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Candidato</TableHead>
              <TableHead>Posición</TableHead>
              <TableHead>Salario</TableHead>
              <TableHead>Fecha de Inicio</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Creada</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredOffers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  <div className="text-muted-foreground">
                    {searchTerm ? 'No se encontraron ofertas con ese criterio.' : 'No hay ofertas de trabajo.'}
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredOffers.map((offer) => (
                <TableRow 
                  key={offer.id}
                  className="hover:bg-muted/50 cursor-pointer"
                  onClick={() => handleViewOffer(offer)}
                >
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">
                        {offer.candidate 
                          ? `${offer.candidate.first_name} ${offer.candidate.last_name}`
                          : 'Candidato no disponible'
                        }
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {offer.candidate?.email}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="font-medium">{offer.position || 'Sin especificar'}</span>
                  </TableCell>
                  <TableCell>
                    <span className="font-medium">
                      {offer.salary ? formatSalary(offer.salary, offer.salary_currency) : 'Sin especificar'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">
                      {offer.start_date ? format(new Date(offer.start_date), 'dd/MM/yyyy', { locale: es }) : '-'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`border-0.5 rounded-[10px] ${getStatusColor(offer.status)}`}>
                      {getStatusLabel(offer.status)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground">
                      {format(new Date(offer.created_at), 'dd/MM/yyyy', { locale: es })}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="border-0.5 border-foreground rounded-[10px]">
                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onViewOffer(offer); }}>
                          <Eye className="h-4 w-4 mr-2" />
                          Ver Detalles
                        </DropdownMenuItem>
                        {offer.status === 'draft' && (
                          <>
                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEditOffer(offer); }}>
                              <Edit className="h-4 w-4 mr-2" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onSendOffer(offer); }}>
                              <Send className="h-4 w-4 mr-2" />
                              Enviar Oferta
                            </DropdownMenuItem>
                          </>
                        )}
                        <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                          <Download className="h-4 w-4 mr-2" />
                          Descargar PDF
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={(e) => { e.stopPropagation(); onDeleteOffer(offer); }}
                          className="text-red-600"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}