
import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface ProposalHistoryCardProps {
  title: string
  entryCount: number
  children: React.ReactNode
}

export const ProposalHistoryCard: React.FC<ProposalHistoryCardProps> = ({
  title,
  entryCount,
  children
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          📊 {title}
          <Badge variant="outline" className="ml-auto">
            {entryCount} entradas
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {children}
      </CardContent>
    </Card>
  )
}
