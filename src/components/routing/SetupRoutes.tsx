
import { Routes, Route, Navigate } from 'react-router-dom'
import Setup from '@/pages/Setup'

export const SetupRoutes = () => (
  <Routes>
    <Route path="/setup" element={<Setup />} />
    <Route path="*" element={<Navigate to="/setup" replace />} />
  </Routes>
)
