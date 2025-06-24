
import { useState } from 'react'
import { UseFormReturn } from 'react-hook-form'
import { FormLabel } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { X } from 'lucide-react'
import type { ContactFormData } from '@/components/contacts/ContactFormTabs'

interface TagsManagerProps {
  form: UseFormReturn<ContactFormData>
}

export const TagsManager = ({ form }: TagsManagerProps) => {
  const [newTag, setNewTag] = useState('')

  const addTag = () => {
    if (newTag.trim()) {
      const currentTags = form.getValues('tags') || []
      if (!currentTags.includes(newTag.trim())) {
        form.setValue('tags', [...currentTags, newTag.trim()])
      }
      setNewTag('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    const currentTags = form.getValues('tags') || []
    form.setValue('tags', currentTags.filter(tag => tag !== tagToRemove))
  }

  return (
    <div>
      <FormLabel>Etiquetas</FormLabel>
      <div className="flex flex-wrap gap-2 mt-2">
        {form.watch('tags')?.map((tag) => (
          <Badge key={tag} variant="secondary" className="flex items-center gap-1">
            {tag}
            <X
              className="h-3 w-3 cursor-pointer"
              onClick={() => removeTag(tag)}
            />
          </Badge>
        ))}
      </div>
      <div className="flex gap-2 mt-2">
        <Input
          value={newTag}
          onChange={(e) => setNewTag(e.target.value)}
          placeholder="Agregar etiqueta"
          onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
        />
        <Button type="button" onClick={addTag} variant="outline">
          Agregar
        </Button>
      </div>
    </div>
  )
}
