export const getStatusColor = (status: string) => {
  switch (status) {
    case 'draft': return 'bg-gray-100 text-gray-800'
    case 'sent': return 'bg-blue-100 text-blue-800'
    case 'negotiating': return 'bg-yellow-100 text-yellow-800'
    case 'won': return 'bg-green-100 text-green-800'
    case 'lost': return 'bg-red-100 text-red-800'
    case 'expired': return 'bg-orange-100 text-orange-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}

export const getStatusLabel = (status: string) => {
  switch (status) {
    case 'draft': return 'Borrador'
    case 'sent': return 'Enviada'
    case 'negotiating': return 'Negociando'
    case 'won': return 'Ganada'
    case 'lost': return 'Perdida'
    case 'expired': return 'Expirada'
    default: return status
  }
}

export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount || 0)
}

export const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('es-ES')
}