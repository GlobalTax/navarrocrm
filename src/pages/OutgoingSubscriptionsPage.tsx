import React from 'react'
import { OutgoingSubscriptionsList } from '@/components/outgoing-subscriptions/OutgoingSubscriptionsList'
import { OutgoingSubscriptionStats } from '@/components/outgoing-subscriptions/OutgoingSubscriptionStats'

const OutgoingSubscriptionsPage = () => {
  return (
    <div className="space-y-8 p-6">
      <OutgoingSubscriptionStats />
      <OutgoingSubscriptionsList />
    </div>
  )
}

export default OutgoingSubscriptionsPage