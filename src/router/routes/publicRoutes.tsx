
import { RouteModule } from '../types'

// Página pública - no necesita lazy loading por su naturaleza crítica
import RoomOccupancyPanel from '@/pages/RoomOccupancyPanel'

export const publicRoutes: RouteModule = {
  routes: [
    {
      path: '/panel-ocupacion',
      element: <RoomOccupancyPanel />
    }
  ]
}
