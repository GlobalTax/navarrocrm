import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { MainLayout } from './components/layout/MainLayout'
import { Dashboard } from './pages/Dashboard'
import { Contacts } from './pages/Contacts'
import { Cases } from './pages/Cases'
import { Emails } from './pages/Emails'

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={
          <MainLayout>
            <Dashboard />
          </MainLayout>
        } />
        <Route path="/contacts" element={
          <MainLayout>
            <Contacts />
          </MainLayout>
        } />
        <Route path="/cases" element={
          <MainLayout>
            <Cases />
          </MainLayout>
        } />
        <Route path="/emails" element={
          <MainLayout>
            <Emails />
          </MainLayout>
        } />
      </Routes>
    </Router>
  )
}

export default App