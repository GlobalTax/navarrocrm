
import { supabase } from '@/integrations/supabase/client'
import { toast } from 'sonner'

export const useAcademySetup = () => {
  const setupAcademyData = async () => {
    try {
      console.log('🎓 [Academia Setup] Iniciando configuración...')
      
      // Obtener org_id del usuario actual
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        console.log('❌ [Academia Setup] Usuario no autenticado')
        return false
      }

      const { data: userData } = await supabase
        .from('users')
        .select('org_id')
        .eq('id', user.id)
        .single()

      if (!userData?.org_id) {
        console.log('❌ [Academia Setup] Usuario sin organización')
        return false
      }

      const orgId = userData.org_id
      console.log('✅ [Academia Setup] Org ID obtenido:', orgId)

      // Verificar si ya existen categorías
      const { data: existingCategories } = await supabase
        .from('academy_categories')
        .select('id')
        .eq('org_id', orgId)
        .limit(1)

      if (existingCategories && existingCategories.length > 0) {
        console.log('ℹ️ [Academia Setup] Las categorías ya existen, omitiendo setup')
        return true
      }

      // Crear categorías
      const categoriesData = [
        {
          org_id: orgId,
          name: 'Gestión Básica',
          description: 'Fundamentos del CRM y gestión de clientes',
          icon: 'Users',
          color: '#3B82F6',
          sort_order: 1,
          is_active: true
        },
        {
          org_id: orgId,
          name: 'Funcionalidades Comerciales',
          description: 'Propuestas, ventas y facturación',
          icon: 'FileText', 
          color: '#10B981',
          sort_order: 2,
          is_active: true
        },
        {
          org_id: orgId,
          name: 'Automatización y IA',
          description: 'Workflows y herramientas de inteligencia artificial',
          icon: 'Brain',
          color: '#8B5CF6',
          sort_order: 3,
          is_active: true
        },
        {
          org_id: orgId,
          name: 'Administración',
          description: 'Configuración y gestión del sistema',
          icon: 'Settings',
          color: '#6B7280',
          sort_order: 4,
          is_active: true
        }
      ]

      console.log('📝 [Academia Setup] Insertando categorías...')
      const { data: categories, error: categoriesError } = await supabase
        .from('academy_categories')
        .insert(categoriesData)
        .select()

      if (categoriesError) {
        console.error('❌ [Academia Setup] Error creando categorías:', categoriesError)
        throw categoriesError
      }

      console.log('✅ [Academia Setup] Categorías creadas:', categories?.length)

      // Crear cursos de ejemplo
      const basicCategory = categories?.find(c => c.name === 'Gestión Básica')
      const commercialCategory = categories?.find(c => c.name === 'Funcionalidades Comerciales')
      const automationCategory = categories?.find(c => c.name === 'Automatización y IA')

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

      if (coursesData.length > 0) {
        console.log('📚 [Academia Setup] Insertando cursos...')
        const { data: courses, error: coursesError } = await supabase
          .from('academy_courses')
          .insert(coursesData)
          .select()

        if (coursesError) {
          console.error('❌ [Academia Setup] Error creando cursos:', coursesError)
          throw coursesError
        }

        console.log('✅ [Academia Setup] Cursos creados:', courses?.length)

        // Crear lecciones de ejemplo para el primer curso
        if (courses && courses.length > 0) {
          const firstCourse = courses[0]
          const lessonsData = [
            {
              org_id: orgId,
              course_id: firstCourse.id,
              title: 'Introducción a la Gestión de Clientes',
              content: 'En esta lección aprenderás los conceptos básicos de la gestión de clientes y por qué es fundamental para el éxito de tu negocio.',
              lesson_type: 'text',
              estimated_duration: 15,
              sort_order: 1,
              is_published: true,
              learning_objectives: ['Comprender la importancia de la gestión de clientes', 'Identificar los beneficios del CRM'],
              prerequisites: []
            },
            {
              org_id: orgId,
              course_id: firstCourse.id,
              title: 'Creando tu Primer Cliente',
              content: 'Paso a paso para crear y configurar correctamente el perfil de un cliente en el sistema.',
              lesson_type: 'interactive',
              estimated_duration: 20,
              sort_order: 2,
              is_published: true,
              learning_objectives: ['Crear perfiles de cliente completos', 'Configurar preferencias de comunicación'],
              prerequisites: ['Introducción a la Gestión de Clientes']
            }
          ]

          console.log('📖 [Academia Setup] Insertando lecciones...')
          const { error: lessonsError } = await supabase
            .from('academy_lessons')
            .insert(lessonsData)

          if (lessonsError) {
            console.error('❌ [Academia Setup] Error creando lecciones:', lessonsError)
            // No lanzamos error aquí para no bloquear el setup completo
          } else {
            console.log('✅ [Academia Setup] Lecciones creadas')
          }
        }
      }

      console.log('🎉 [Academia Setup] Configuración completada exitosamente')
      toast.success('Academia configurada correctamente')
      return true

    } catch (error) {
      console.error('❌ [Academia Setup] Error:', error)
      toast.error('Error configurando la academia: ' + (error as Error).message)
      return false
    }
  }

  return { setupAcademyData }
}
