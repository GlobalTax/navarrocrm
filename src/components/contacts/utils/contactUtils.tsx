
import { Building, User } from 'lucide-react'

export const getInitials = (name: string) => {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

export const getClientTypeIcon = (type: string | null) => {
  switch (type) {
    case 'empresa': return <Building className="h-4 w-4" />
    case 'particular':
    case 'autonomo': return <User className="h-4 w-4" />
    default: return <User className="h-4 w-4" />
  }
}
