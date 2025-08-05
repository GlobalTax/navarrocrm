import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Loader2, Users, Plus } from 'lucide-react'
import { useApp } from '@/contexts/AppContext'
import { useCreateCandidate } from '@/hooks/recruitment/useCandidates'
import { toast } from 'sonner'

interface SampleCandidate {
  first_name: string
  last_name: string
  email: string
  phone: string
  linkedin_url: string
  current_position: string
  current_company: string
  years_experience: number
  expected_salary: number
  salary_currency: string
  location: string
  source: 'manual' | 'linkedin' | 'job_board' | 'referral' | 'website'
  remote_work_preference: 'onsite' | 'remote' | 'hybrid'
  cover_letter: string
  notes: string
  skills: string[]
  languages: string[]
  level: 'Junior' | 'Mid' | 'Senior'
  description: string
}

const sampleCandidates: SampleCandidate[] = [
  {
    first_name: 'Ana',
    last_name: 'García López',
    email: 'ana.garcia@email.com',
    phone: '+34 666 123 456',
    linkedin_url: 'https://linkedin.com/in/ana-garcia-dev',
    current_position: 'Desarrolladora Frontend Junior',
    current_company: 'TechStart Solutions',
    years_experience: 2,
    expected_salary: 35000,
    salary_currency: 'EUR',
    location: 'Madrid',
    source: 'linkedin',
    remote_work_preference: 'hybrid',
    cover_letter: 'Soy una desarrolladora junior apasionada por crear interfaces de usuario intuitivas y modernas. Durante mis 2 años de experiencia he trabajado principalmente con React y TypeScript, siempre buscando aprender nuevas tecnologías y mejores prácticas.',
    notes: 'Candidata muy prometedora, muestra gran motivación por aprender. Excelente actitud y capacidad de trabajo en equipo.',
    skills: ['React', 'TypeScript', 'CSS', 'HTML', 'Git', 'Figma', 'Responsive Design'],
    languages: ['Español', 'Inglés'],
    level: 'Junior',
    description: 'Perfil junior con 2 años de experiencia en desarrollo frontend. Ideal para proyectos de crecimiento.'
  },
  {
    first_name: 'Carlos',
    last_name: 'Ruiz Martínez',
    email: 'carlos.ruiz@email.com',
    phone: '+34 677 987 654',
    linkedin_url: 'https://linkedin.com/in/carlos-ruiz-fullstack',
    current_position: 'Desarrollador Full Stack',
    current_company: 'InnovaTech Corp',
    years_experience: 5,
    expected_salary: 55000,
    salary_currency: 'EUR',
    location: 'Barcelona',
    source: 'job_board',
    remote_work_preference: 'remote',
    cover_letter: 'Con 5 años de experiencia en desarrollo full stack, he liderado equipos pequeños y participado en proyectos de gran escala. Mi expertise incluye arquitecturas microservicios, CI/CD y metodologías ágiles. Busco nuevos retos que me permitan seguir creciendo profesionalmente.',
    notes: 'Excelente perfil técnico. Ha demostrado capacidad de liderazgo y conocimientos sólidos en arquitectura de software. Muy recomendable.',
    skills: ['React', 'Node.js', 'TypeScript', 'PostgreSQL', 'Docker', 'AWS', 'Kubernetes', 'GraphQL', 'Jest', 'CI/CD'],
    languages: ['Español', 'Inglés', 'Francés'],
    level: 'Mid',
    description: 'Desarrollador mid-level con experiencia en arquitecturas complejas y liderazgo técnico.'
  },
  {
    first_name: 'María',
    last_name: 'Fernández Silva',
    email: 'maria.fernandez@email.com',
    phone: '+34 688 456 789',
    linkedin_url: 'https://linkedin.com/in/maria-fernandez-architect',
    current_position: 'Arquitecta de Software Senior',
    current_company: 'GlobalTech Enterprise',
    years_experience: 12,
    expected_salary: 85000,
    salary_currency: 'EUR',
    location: 'Valencia',
    source: 'referral',
    remote_work_preference: 'hybrid',
    cover_letter: 'Como arquitecta de software con más de 12 años de experiencia, he diseñado y supervisado la implementación de sistemas críticos para empresas Fortune 500. Mi enfoque se centra en crear soluciones escalables, mantenibles y que agreguen valor real al negocio. He liderado equipos de hasta 15 desarrolladores y implementado transformaciones digitales completas.',
    notes: 'Perfil excepcional. Amplia experiencia en arquitectura empresarial, liderazgo técnico y gestión de equipos grandes. Candidata ideal para roles de alta responsabilidad.',
    skills: ['Arquitectura de Software', 'Microservicios', 'Java', 'Spring', 'React', 'Python', 'AWS', 'Azure', 'Kubernetes', 'DDD', 'Event Sourcing', 'CQRS', 'Team Leadership', 'Agile'],
    languages: ['Español', 'Inglés', 'Alemán', 'Italiano'],
    level: 'Senior',
    description: 'Arquitecta senior con experiencia en transformación digital y liderazgo de equipos grandes.'
  }
]

export function CreateSampleCandidates() {
  const { user } = useApp()
  const [isCreating, setIsCreating] = useState(false)
  const [createdCount, setCreatedCount] = useState(0)
  const createCandidateMutation = useCreateCandidate()

  const createSampleCandidates = async () => {
    if (!user?.org_id) {
      toast.error('Usuario no autenticado')
      return
    }

    setIsCreating(true)
    setCreatedCount(0)

    try {
      for (const candidate of sampleCandidates) {
        const candidateData = {
          ...candidate,
          availability_date: new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // Fecha aleatoria en los próximos 30 días
        }

        await new Promise((resolve, reject) => {
          createCandidateMutation.mutate(candidateData, {
            onSuccess: () => {
              setCreatedCount(prev => prev + 1)
              resolve(true)
            },
            onError: (error) => {
              console.error('Error creando candidato:', error)
              reject(error)
            }
          })
        })

        // Pequeña pausa entre creaciones
        await new Promise(resolve => setTimeout(resolve, 500))
      }

      toast.success(`${sampleCandidates.length} candidatos de prueba creados exitosamente`)
    } catch (error) {
      console.error('Error creando candidatos de prueba:', error)
      toast.error('Error al crear algunos candidatos de prueba')
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <Card className="border-0.5 border-foreground rounded-[10px] shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5" />
          Perfiles de Prueba
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-muted-foreground">
          Crea 3 perfiles de candidatos de diferentes niveles para probar la funcionalidad del sistema.
        </div>

        <div className="grid gap-3">
          {sampleCandidates.map((candidate, index) => (
            <div key={index} className="p-3 border rounded-[10px] border-border">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h4 className="font-medium text-sm">
                    {candidate.first_name} {candidate.last_name}
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    {candidate.current_position} · {candidate.years_experience} años exp.
                  </p>
                </div>
                <Badge 
                  variant={candidate.level === 'Senior' ? 'default' : candidate.level === 'Mid' ? 'secondary' : 'outline'}
                  className="rounded-[10px] border-0.5"
                >
                  {candidate.level}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mb-2">
                {candidate.description}
              </p>
              <div className="flex flex-wrap gap-1">
                {candidate.skills.slice(0, 4).map((skill) => (
                  <Badge key={skill} variant="outline" className="text-xs rounded-[10px] border-0.5">
                    {skill}
                  </Badge>
                ))}
                {candidate.skills.length > 4 && (
                  <Badge variant="outline" className="text-xs rounded-[10px] border-0.5">
                    +{candidate.skills.length - 4}
                  </Badge>
                )}
              </div>
            </div>
          ))}
        </div>

        <Button
          onClick={createSampleCandidates}
          disabled={isCreating}
          className="w-full rounded-[10px]"
        >
          {isCreating ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Creando {createdCount}/{sampleCandidates.length}...
            </>
          ) : (
            <>
              <Plus className="w-4 h-4 mr-2" />
              Crear Perfiles de Prueba
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  )
}