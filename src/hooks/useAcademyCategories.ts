
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { useApp } from '@/contexts/AppContext'
import { toast } from 'sonner'

export const useAcademyCategoriesMutation = () => {
  const { user } = useApp()
  const queryClient = useQueryClient()

  const createCategory = useMutation({
    mutationFn: async (data: {
      name: string
      description?: string
      icon?: string
      color: string
      sort_order?: number
      is_active: boolean
    }) => {
      if (!user?.org_id) throw new Error('No organization found')

      console.log('🏗️ Creating category:', data)

      const { data: category, error } = await supabase
        .from('academy_categories')
        .insert({
          ...data,
          org_id: user.org_id
        })
        .select()
        .single()

      if (error) {
        console.error('❌ Error creating category:', error)
        throw error
      }
      
      console.log('✅ Category created successfully:', category)
      return category
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['academy-categories'] })
      toast.success('Categoría creada exitosamente')
    },
    onError: (error) => {
      console.error('Error creating category:', error)
      toast.error('Error al crear la categoría: ' + error.message)
    }
  })

  const updateCategory = useMutation({
    mutationFn: async ({ id, ...data }: {
      id: string
      name: string
      description?: string
      icon?: string
      color: string
      sort_order?: number
      is_active: boolean
    }) => {
      const { data: category, error } = await supabase
        .from('academy_categories')
        .update(data)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return category
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['academy-categories'] })
      toast.success('Categoría actualizada exitosamente')
    },
    onError: (error) => {
      console.error('Error updating category:', error)
      toast.error('Error al actualizar la categoría')
    }
  })

  const deleteCategory = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('academy_categories')
        .delete()
        .eq('id', id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['academy-categories'] })
      toast.success('Categoría eliminada exitosamente')
    },
    onError: (error) => {
      console.error('Error deleting category:', error)
      toast.error('Error al eliminar la categoría')
    }
  })

  return { createCategory, updateCategory, deleteCategory }
}
