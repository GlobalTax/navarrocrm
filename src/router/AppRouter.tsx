
import { Routes, Route } from 'react-router-dom'
import { authRoutes, publicRoutes } from './routes'
import { RouteConfig } from './types'
import NotFound from '@/pages/NotFound'

const renderRoutes = (routes: RouteConfig[]): React.ReactNode => {
  return routes.map((route, index) => (
    <Route
      key={`${route.path}-${index}`}
      path={route.path}
      element={route.element}
    >
      {route.children && renderRoutes(route.children)}
    </Route>
  ))
}

export const AppRouter = () => {
  return (
    <Routes>
      {/* Rutas públicas */}
      {renderRoutes(publicRoutes.routes)}
      
      {/* Rutas de autenticación */}
      {renderRoutes(authRoutes.routes)}
      
      {/* 404 - no lazy */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
