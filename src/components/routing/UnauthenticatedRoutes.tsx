
import { Routes, Route, Navigate } from 'react-router-dom'
import Index from '@/pages/Index'
import Login from '@/pages/Login'
import Setup from '@/pages/Setup'

export const UnauthenticatedRoutes = () => (
  <Routes>
    <Route path="/" element={<Index />} />
    <Route path="/login" element={<Login />} />
    <Route path="/setup" element={<Setup />} />
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
)
