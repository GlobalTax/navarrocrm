import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { QueryProvider } from './contexts/QueryContext'
import { AppProvider } from './contexts/AppContext'
import { MainLayout } from './components/layout/MainLayout'
import Dashboard from './pages/Dashboard'
import Contacts from './pages/Contacts'
import Cases from './pages/Cases'
import Emails from './pages/Emails'
import Reports from './pages/Reports'
import Proposals from './pages/Proposals'
import RecurringFees from './pages/RecurringFees'
import Subscriptions from './pages/Subscriptions'
import OutgoingSubscriptions from './pages/OutgoingSubscriptions'
import Tasks from './pages/Tasks'
import TimeTracking from './pages/TimeTracking'
import Calendar from './pages/Calendar'

const App = () => {
  return (
    <QueryProvider>
      <AppProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={
              <MainLayout>
                <Dashboard />
              </MainLayout>
            } />
            <Route path="/emails" element={
              <MainLayout>
                <Emails />
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
            <Route path="/proposals" element={
              <MainLayout>
                <Proposals />
              </MainLayout>
            } />
            <Route path="/recurring-fees" element={
              <MainLayout>
                <RecurringFees />
              </MainLayout>
            } />
            <Route path="/subscriptions" element={
              <MainLayout>
                <Subscriptions />
              </MainLayout>
            } />
            <Route path="/outgoing-subscriptions" element={
              <MainLayout>
                <OutgoingSubscriptions />
              </MainLayout>
            } />
            <Route path="/tasks" element={
              <MainLayout>
                <Tasks />
              </MainLayout>
            } />
            <Route path="/time-tracking" element={
              <MainLayout>
                <TimeTracking />
              </MainLayout>
            } />
            <Route path="/calendar" element={
              <MainLayout>
                <Calendar />
              </MainLayout>
            } />
            <Route path="/reports" element={
              <MainLayout>
                <Reports />
              </MainLayout>
            } />
          </Routes>
        </Router>
      </AppProvider>
    </QueryProvider>
  )
}

export default App