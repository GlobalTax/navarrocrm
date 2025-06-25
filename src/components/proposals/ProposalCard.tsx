
import React from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { ProposalRecurringFeeButton } from './ProposalRecurringFeeButton'
import { ProposalCardHeader } from './components/ProposalCardHeader'
import { ProposalCardMainInfo } from './components/ProposalCardMainInfo'
import { ProposalCardConversionInfo } from './components/ProposalCardConversionInfo'
import { ProposalCardRecurringInfo } from './components/ProposalCardRecurringInfo'
import { ProposalCardDates } from './components/ProposalCardDates'
import { ProposalCardActions } from './components/ProposalCardActions'
import type { Proposal } from '@/types/proposals'

interface ProposalCardProps {
  proposal: Proposal
  onStatusChange: (id: string, status: string) => void
  onView: (proposal: Proposal) => void
}

export function ProposalCard({ proposal, onStatusChange, onView }: ProposalCardProps) {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <ProposalCardHeader 
          proposal={proposal}
          onMoreClick={() => {}} // Handled by ProposalCardActions now
        />
      </CardHeader>

      <CardContent className="space-y-4">
        <ProposalCardMainInfo proposal={proposal} />
        
        <ProposalCardConversionInfo proposal={proposal} />
        
        <ProposalCardRecurringInfo proposal={proposal} />
        
        <ProposalCardDates proposal={proposal} />

        {proposal.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {proposal.description}
          </p>
        )}

        {proposal.is_recurring && proposal.status === 'won' && (
          <ProposalRecurringFeeButton proposal={proposal} />
        )}

        <div className="flex justify-end">
          <ProposalCardActions
            proposal={proposal}
            onStatusChange={onStatusChange}
            onView={onView}
          />
        </div>
      </CardContent>
    </Card>
  )
}
