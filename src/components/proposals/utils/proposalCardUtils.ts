
export const getStatusColor = (status: string) => {
  switch (status) {
    case 'draft': return 'bg-gray-100 text-gray-800'
    case 'sent': return 'bg-blue-100 text-blue-800'
    case 'won': return 'bg-green-100 text-green-800'
    case 'lost': return 'bg-red-100 text-red-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}

export const getStatusText = (status: string) => {
  switch (status) {
    case 'draft': return 'Borrador'
    case 'sent': return 'Enviada'
    case 'won': return 'Ganada'
    case 'lost': return 'Perdida'
    default: return status
  }
}

export const getFrequencyText = (frequency: string) => {
  switch (frequency) {
    case 'monthly': return 'Mensual'
    case 'quarterly': return 'Trimestral'
    case 'yearly': return 'Anual'
    default: return frequency
  }
}
