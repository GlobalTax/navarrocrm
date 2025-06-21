
import { 
  Home, 
  UserCheck, 
  Scale, 
  ScrollText,
  Calendar,
  Timer
} from 'lucide-react'

export const navigation = [
  { name: 'Dashboard', href: '/', icon: Home },
  { name: 'Clientes', href: '/clients', icon: UserCheck },
  { name: 'Casos', href: '/cases', icon: Scale },
  { name: 'Propuestas', href: '/proposals', icon: ScrollText },
  { name: 'Calendario', href: '/calendar', icon: Calendar },
  { name: 'Registro de Tiempo', href: '/time-tracking', icon: Timer },
]
