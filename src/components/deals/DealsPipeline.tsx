
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import type { Proposal } from '@/hooks/useProposals'

interface DealsPipelineProps {
  deals: Proposal[]
}

const stages = [
  { id: 'draft', title: 'Borrador', color: 'bg-gray-100' },
  { id: 'sent', title: 'Enviado', color: 'bg-blue-100' },
  { id: 'won', title: 'Ganado', color: 'bg-green-100' },
  { id: 'lost', title: 'Perdido', color: 'bg-red-100' }
]

export function DealsPipeline({ deals }: DealsPipelineProps) {
  const dealsByStage = stages.reduce((acc, stage) => {
    acc[stage.id] = deals.filter(deal => deal.status === stage.id)
    return acc
  }, {} as Record<string, Proposal[]>)

  const onDragEnd = (result: any) => {
    console.log('Drag ended:', result)
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <DragDropContext onDragEnd={onDragEnd}>
        {stages.map((stage) => (
          <Card key={stage.id} className={stage.color}>
            <CardHeader>
              <CardTitle className="text-sm font-medium flex items-center justify-between">
                {stage.title}
                <Badge variant="secondary">
                  {dealsByStage[stage.id]?.length || 0}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Droppable droppableId={stage.id}>
                {(provided) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="space-y-3 min-h-[200px]"
                  >
                    {dealsByStage[stage.id]?.map((deal, index) => (
                      <Draggable
                        key={deal.id}
                        draggableId={deal.id}
                        index={index}
                      >
                        {(provided) => (
                          <Card
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className="bg-white shadow-sm hover:shadow-md transition-shadow cursor-grab"
                          >
                            <CardContent className="p-4">
                              <h4 className="font-medium text-sm mb-2 line-clamp-2">
                                {deal.title}
                              </h4>
                              <p className="text-xs text-muted-foreground mb-2">
                                {deal.client?.name || 'Sin cliente'}
                              </p>
                              <p className="text-sm font-medium text-green-600">
                                €{deal.total_amount?.toLocaleString() || '0'}
                              </p>
                            </CardContent>
                          </Card>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </CardContent>
          </Card>
        ))}
      </DragDropContext>
    </div>
  )
}
