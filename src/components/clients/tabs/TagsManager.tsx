
import { useState } from 'react'
import { UseFormReturn } from 'react-hook-form'
import { FormLabel } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { X, Plus } from 'lucide-react'
import type { ClientFormData } from '@/components/clients/ClientFormTabs'

interface TagsManagerProps {
  form: UseFormReturn<ClientFormData>
}

export const TagsManager = ({ form }: TagsManagerProps) => {
  const [newTag, setNewTag] = useState('')
  const tags = form.watch('tags') || []

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      const updatedTags = [...tags, newTag.trim()]
      form.setValue('tags', updatedTags)
      setNewTag('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    const updatedTags = tags.filter(tag => tag !== tagToRemove)
    form.setValue('tags', updatedTags)
  }

  return (
    <div className="space-y-4">
      <div>
        <FormLabel>Etiquetas</FormLabel>
        <div className="flex flex-wrap gap-2 mt-2 mb-2">
          {tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="flex items-center gap-1">
              {tag}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => removeTag(tag)}
              />
            </Badge>
          ))}
        </div>
        <div className="flex gap-2">
          <Input
            placeholder="Nueva etiqueta"
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
          />
          <Button type="button" variant="outline" size="sm" onClick={addTag}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
