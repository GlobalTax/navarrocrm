
import { Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { StandardPageContainer } from '@/components/layout/StandardPageContainer'
import { MainLayout } from '@/components/layout/MainLayout'
import { PageLoadingSkeleton } from '@/components/layout/PageLoadingSkeleton'
import { EmailDashboard } from '@/components/emails/EmailDashboard'
import { EmailInbox } from '@/components/emails/EmailInbox'
import { EmailCompose } from '@/components/emails/EmailCompose'
import { EmailThread } from '@/components/emails/EmailThread'
import { EmailSettings } from '@/components/emails/EmailSettings'
import NylasCallback from './NylasCallback'

export default function Emails() {
  return (
    <MainLayout>
      <Suspense fallback={<PageLoadingSkeleton />}>
        <Routes>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<EmailDashboard />} />
          <Route path="inbox" element={<EmailInbox />} />
          <Route path="sent" element={<EmailInbox folder="sent" />} />
          <Route path="drafts" element={<EmailInbox folder="drafts" />} />
          <Route path="compose" element={<EmailCompose />} />
          <Route path="thread/:threadId" element={<EmailThread />} />
          <Route path="settings" element={<EmailSettings />} />
          <Route path="callback" element={<NylasCallback />} />
        </Routes>
      </Suspense>
    </MainLayout>
  )
}
