
import React from 'react'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { X } from 'lucide-react'

const AVAILABLE_TAGS = [
  'Fiscal', 'Laboral', 'Jurídico', 'Contable', 'Mercantil', 
  'Premium', 'Urgente', 'Consultoría', 'Asesoría', 'Compliance'
] as const

interface RecurringFeeTagsManagerProps {
  selectedTags: string[]
  onTagToggle: (tag: string) => void
  onTagRemove: (tag: string) => void
}

export function RecurringFeeTagsManager({ 
  selectedTags, 
  onTagToggle, 
  onTagRemove 
}: RecurringFeeTagsManagerProps) {
  return (
    <div className="space-y-2">
      <Label>Etiquetas</Label>
      <div className="flex flex-wrap gap-2 mb-2">
        {AVAILABLE_TAGS.map((tag) => (
          <Badge
            key={tag}
            variant={selectedTags.includes(tag) ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() => onTagToggle(tag)}
          >
            {tag}
          </Badge>
        ))}
      </div>
      {selectedTags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {selectedTags.map((tag) => (
            <Badge key={tag} variant="secondary" className="gap-1">
              {tag}
              <X 
                className="w-3 h-3 cursor-pointer" 
                onClick={() => onTagRemove(tag)}
              />
            </Badge>
          ))}
        </div>
      )}
    </div>
  )
}
