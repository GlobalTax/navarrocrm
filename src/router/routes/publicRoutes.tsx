
import { RouteModule } from '../types'

// Páginas públicas - no necesitan lazy loading por su naturaleza crítica
import RoomOccupancyPanel from '@/pages/RoomOccupancyPanel'
import NavarooConstruction from '@/pages/NavarooConstruction'

export const publicRoutes: RouteModule = {
  routes: [
    {
      path: '/panel-ocupacion',
      element: <RoomOccupancyPanel />
    },
    {
      path: '/construccion',
      element: <NavarooConstruction />
    },
    {
      path: '/navaroo',
      element: <NavarooConstruction />
    }
  ]
}
