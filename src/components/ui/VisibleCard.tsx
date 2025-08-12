import { ReactNode } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useUIPreferences } from '@/hooks/useUIPreferences'

interface VisibleCardProps {
  pageKey: string
  cardId: string
  title?: string
  className?: string
  children: ReactNode
}

export function VisibleCard({ pageKey, cardId, title, className, children }: VisibleCardProps) {
  const { isCardVisible, hideCard } = useUIPreferences(pageKey)

  if (!isCardVisible(cardId)) return null

  return (
    <Card className={`p-4 border rounded-[10px] shadow-sm hover:shadow-lg transition-transform duration-200 ease-out ${className || ''}`}>
      {(title || true) && (
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-base font-medium truncate">{title || 'Widget'}</h3>
          <Button variant="outline" size="sm" onClick={() => hideCard(cardId)} aria-label="Ocultar tarjeta">
            Ocultar
          </Button>
        </div>
      )}
      <div>
        {children}
      </div>
    </Card>
  )
}
