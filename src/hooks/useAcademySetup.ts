
import { supabase } from '@/integrations/supabase/client'
import { toast } from 'sonner'

export const useAcademySetup = () => {
  const setupAcademyData = async () => {
    try {
      // Obtener org_id del usuario actual
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Usuario no autenticado')

      const { data: userData } = await supabase
        .from('users')
        .select('org_id')
        .eq('id', user.id)
        .single()

      if (!userData?.org_id) throw new Error('Usuario sin organización')

      const orgId = userData.org_id

      // Verificar si ya existen cursos
      const { data: existingCourses } = await supabase
        .from('academy_courses')
        .select('id')
        .eq('org_id', orgId)
        .limit(1)

      if (existingCourses && existingCourses.length > 0) {
        console.log('Los cursos ya existen')
        return
      }

      // Crear categorías si no existen
      const categoriesData = [
        {
          org_id: orgId,
          name: 'Gestión Básica',
          description: 'Fundamentos del CRM y gestión de clientes',
          icon: 'Users',
          color: '#3B82F6',
          sort_order: 1
        },
        {
          org_id: orgId,
          name: 'Funcionalidades Comerciales',
          description: 'Propuestas, ventas y facturación',
          icon: 'FileText', 
          color: '#10B981',
          sort_order: 2
        },
        {
          org_id: orgId,
          name: 'Automatización y IA',
          description: 'Workflows y herramientas de inteligencia artificial',
          icon: 'Brain',
          color: '#8B5CF6',
          sort_order: 3
        },
        {
          org_id: orgId,
          name: 'Administración',
          description: 'Configuración y gestión del sistema',
          icon: 'Settings',
          color: '#6B7280',
          sort_order: 4
        }
      ]

      // Insertar categorías
      const { data: categories, error: categoriesError } = await supabase
        .from('academy_categories')
        .upsert(categoriesData, { onConflict: 'org_id,name', ignoreDuplicates: true })
        .select()

      if (categoriesError) throw categoriesError

      // Crear cursos de ejemplo
      const basicCategory = categories?.find(c => c.name === 'Gestión Básica')
      const commercialCategory = categories?.find(c => c.name === 'Funcionalidades Comerciales')
      const automationCategory = categories?.find(c => c.name === 'Automatización y IA')

      if (basicCategory || commercialCategory || automationCategory) {
        const coursesData = []

        if (basicCategory) {
          coursesData.push({
            org_id: orgId,
            category_id: basicCategory.id,
            title: 'Gestión Completa de Clientes',
            description: 'Domina el arte de gestionar clientes desde el primer contacto hasta la fidelización',
            level: 'beginner',
            estimated_duration: 120,
            total_lessons: 8,
            sort_order: 1,
            is_published: true,
            created_by: user.id
          })
        }

        if (commercialCategory) {
          coursesData.push({
            org_id: orgId,
            category_id: commercialCategory.id,
            title: 'Propuestas Comerciales Ganadoras',
            description: 'Aprende a crear propuestas que conviertan prospectos en clientes',
            level: 'intermediate',
            estimated_duration: 90,
            total_lessons: 6,
            sort_order: 1,
            is_published: true,
            created_by: user.id
          })
        }

        if (automationCategory) {
          coursesData.push({
            org_id: orgId,
            category_id: automationCategory.id,
            title: 'Workflows y Automatización',
            description: 'Automatiza procesos repetitivos y optimiza tu productividad',
            level: 'advanced',
            estimated_duration: 180,
            total_lessons: 10,
            sort_order: 1,
            is_published: true,
            created_by: user.id
          })
        }

        const { error: coursesError } = await supabase
          .from('academy_courses')
          .upsert(coursesData, { onConflict: 'org_id,title', ignoreDuplicates: true })

        if (coursesError) throw coursesError
      }

      toast.success('Academia configurada correctamente')
      return true
    } catch (error) {
      console.error('Error configurando la academia:', error)
      toast.error('Error configurando la academia')
      return false
    }
  }

  return { setupAcademyData }
}
