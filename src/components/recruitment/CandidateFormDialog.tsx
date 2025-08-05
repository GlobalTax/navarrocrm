import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { X, Plus, Loader2, Upload, FileText } from 'lucide-react'
import { useApp } from '@/contexts/AppContext'
import { toast } from 'sonner'
import { supabase } from '@/integrations/supabase/client'
import { type CreateCandidateData, CANDIDATE_STATUS_LABELS } from '@/types/recruitment'
import { useCreateCandidate, useUpdateCandidate } from '@/hooks/recruitment/useCandidates'

const candidateSchema = z.object({
  first_name: z.string().min(1, 'Nombre requerido'),
  last_name: z.string().min(1, 'Apellidos requeridos'),
  email: z.string().email('Email inválido'),
  phone: z.string().optional(),
  linkedin_url: z.string().url('URL inválida').optional().or(z.literal('')),
  current_position: z.string().optional(),
  current_company: z.string().optional(),
  years_experience: z.number().min(0).optional(),
  expected_salary: z.number().min(0).optional(),
  salary_currency: z.string().default('EUR'),
  location: z.string().optional(),
  source: z.enum(['manual', 'linkedin', 'job_board', 'referral', 'website']).default('manual'),
  remote_work_preference: z.enum(['onsite', 'remote', 'hybrid']).default('hybrid'),
  cover_letter: z.string().optional(),
  notes: z.string().optional(),
})

type CandidateFormData = z.infer<typeof candidateSchema>

interface CandidateFormDialogProps {
  open: boolean
  onClose: () => void
  candidate?: any
}

export function CandidateFormDialog({ open, onClose, candidate }: CandidateFormDialogProps) {
  const { user } = useApp()
  const [skills, setSkills] = useState<string[]>(candidate?.skills || [])
  const [languages, setLanguages] = useState<string[]>(candidate?.languages || [])
  const [newSkill, setNewSkill] = useState('')
  const [newLanguage, setNewLanguage] = useState('')
  const [cvFile, setCvFile] = useState<File | null>(null)
  const [cvUploading, setCvUploading] = useState(false)
  const [currentCvPath, setCurrentCvPath] = useState<string | null>(candidate?.cv_file_path || null)
  
  // Hooks de mutación
  const createCandidateMutation = useCreateCandidate()
  const updateCandidateMutation = useUpdateCandidate()
  
  const isLoading = createCandidateMutation.isPending || updateCandidateMutation.isPending

  const form = useForm<CandidateFormData>({
    resolver: zodResolver(candidateSchema),
    defaultValues: {
      first_name: candidate?.first_name || '',
      last_name: candidate?.last_name || '',
      email: candidate?.email || '',
      phone: candidate?.phone || '',
      linkedin_url: candidate?.linkedin_url || '',
      current_position: candidate?.current_position || '',
      current_company: candidate?.current_company || '',
      years_experience: candidate?.years_experience || 0,
      expected_salary: candidate?.expected_salary || undefined,
      salary_currency: candidate?.salary_currency || 'EUR',
      location: candidate?.location || '',
      source: candidate?.source || 'manual',
      remote_work_preference: candidate?.remote_work_preference || 'hybrid',
      cover_letter: candidate?.cover_letter || '',
      notes: candidate?.notes || '',
    }
  })


  const onSubmit = (data: CandidateFormData) => {
    console.log('🚀 [CandidateFormDialog] onSubmit triggered with data:', data)
    console.log('👤 [CandidateFormDialog] User context:', { 
      userId: user?.id, 
      orgId: user?.org_id,
      isAuthenticated: !!user 
    })
    console.log('🏷️ [CandidateFormDialog] Skills and languages:', { skills, languages })

    // Validar usuario autenticado
    if (!user?.id || !user?.org_id) {
      console.error('❌ [CandidateFormDialog] User not authenticated or missing org_id')
      toast.error('Usuario no autenticado. Por favor, vuelve a iniciar sesión.')
      return
    }

    // Validar campos requeridos
    if (!data.first_name || !data.last_name || !data.email) {
      console.error('❌ [CandidateFormDialog] Missing required fields:', {
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email
      })
      toast.error('Por favor, completa todos los campos obligatorios')
      return
    }

    // Preparar datos del candidato
    const candidateData: CreateCandidateData & { skills?: string[], languages?: string[], cv_file_path?: string } = {
      first_name: data.first_name,
      last_name: data.last_name,
      email: data.email,
      phone: data.phone || undefined,
      linkedin_url: data.linkedin_url || undefined,
      current_position: data.current_position || undefined,
      current_company: data.current_company || undefined,
      years_experience: data.years_experience || 0,
      expected_salary: data.expected_salary || undefined,
      salary_currency: data.salary_currency || 'EUR',
      location: data.location || undefined,
      source: data.source || 'manual',
      remote_work_preference: data.remote_work_preference || 'hybrid',
      cover_letter: data.cover_letter || undefined,
      notes: data.notes || undefined,
      skills: skills,
      languages: languages,
      cv_file_path: currentCvPath || undefined
    }

    console.log('📝 [CandidateFormDialog] Final candidateData:', candidateData)

    if (candidate) {
      console.log('✏️ [CandidateFormDialog] Updating existing candidate:', candidate.id)
      updateCandidateMutation.mutate({ 
        id: candidate.id, 
        data: candidateData 
      }, {
        onSuccess: () => {
          console.log('✅ [CandidateFormDialog] Update successful, closing dialog')
          onClose()
        }
      })
    } else {
      console.log('🆕 [CandidateFormDialog] Creating new candidate')
      createCandidateMutation.mutate(candidateData, {
        onSuccess: () => {
          console.log('✅ [CandidateFormDialog] Creation successful, closing dialog')
          onClose()
        }
      })
    }
  }

  const addSkill = () => {
    if (newSkill && !skills.includes(newSkill)) {
      setSkills([...skills, newSkill])
      setNewSkill('')
    }
  }

  const removeSkill = (skillToRemove: string) => {
    setSkills(skills.filter(skill => skill !== skillToRemove))
  }

  const addLanguage = () => {
    if (newLanguage && !languages.includes(newLanguage)) {
      setLanguages([...languages, newLanguage])
      setNewLanguage('')
    }
  }

  const removeLanguage = (langToRemove: string) => {
    setLanguages(languages.filter(lang => lang !== langToRemove))
  }

  const handleCvUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !user?.org_id) return

    // Validar tipo de archivo
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
    if (!allowedTypes.includes(file.type)) {
      toast.error('Solo se permiten archivos PDF, DOC o DOCX')
      return
    }

    // Validar tamaño (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('El archivo no puede superar los 10MB')
      return
    }

    setCvUploading(true)
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${user.org_id}/${crypto.randomUUID()}.${fileExt}`

      const { data, error } = await supabase.storage
        .from('candidate-cvs')
        .upload(fileName, file)

      if (error) throw error

      setCvFile(file)
      setCurrentCvPath(data.path)
      toast.success('CV subido correctamente')
    } catch (error) {
      console.error('Error subiendo CV:', error)
      toast.error('Error al subir el CV')
    } finally {
      setCvUploading(false)
    }
  }

  const handleDownloadCv = async () => {
    if (!currentCvPath) return

    try {
      const { data, error } = await supabase.storage
        .from('candidate-cvs')
        .download(currentCvPath)

      if (error) throw error

      const url = URL.createObjectURL(data)
      const a = document.createElement('a')
      a.href = url
      a.download = currentCvPath.split('/').pop() || 'cv.pdf'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error descargando CV:', error)
      toast.error('Error al descargar el CV')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-[10px] border-0.5 border-foreground">
        <DialogHeader>
          <DialogTitle>
            {candidate ? 'Editar Candidato' : 'Nuevo Candidato'}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Información personal */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Información Personal</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="first_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre *</FormLabel>
                      <FormControl>
                        <Input className="rounded-[10px] border-0.5 border-foreground" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="last_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Apellidos *</FormLabel>
                      <FormControl>
                        <Input className="rounded-[10px] border-0.5 border-foreground" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email *</FormLabel>
                      <FormControl>
                        <Input type="email" className="rounded-[10px] border-0.5 border-foreground" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Teléfono</FormLabel>
                      <FormControl>
                        <Input className="rounded-[10px] border-0.5 border-foreground" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="linkedin_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>LinkedIn</FormLabel>
                    <FormControl>
                      <Input placeholder="https://linkedin.com/in/..." className="rounded-[10px] border-0.5 border-foreground" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Información profesional */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Información Profesional</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="current_position"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Posición Actual</FormLabel>
                      <FormControl>
                        <Input className="rounded-[10px] border-0.5 border-foreground" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="current_company"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Empresa Actual</FormLabel>
                      <FormControl>
                        <Input className="rounded-[10px] border-0.5 border-foreground" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="years_experience"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Años Experiencia</FormLabel>
                      <FormControl>
                        <Input type="number" min="0" className="rounded-[10px] border-0.5 border-foreground" {...field} onChange={e => field.onChange(Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="expected_salary"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Salario Esperado</FormLabel>
                      <FormControl>
                        <Input type="number" min="0" className="rounded-[10px] border-0.5 border-foreground" {...field} onChange={e => field.onChange(Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="salary_currency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Moneda</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="rounded-[10px] border-0.5 border-foreground">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="EUR">EUR</SelectItem>
                          <SelectItem value="USD">USD</SelectItem>
                          <SelectItem value="GBP">GBP</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Skills y Languages */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Habilidades e Idiomas</h3>
              
              {/* Skills */}
              <div>
                <FormLabel>Habilidades</FormLabel>
                <div className="flex gap-2 mt-2 mb-2">
                  <Input
                    placeholder="Añadir habilidad..."
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                    className="rounded-[10px] border-0.5 border-foreground"
                  />
                  <Button type="button" onClick={addSkill} size="sm" className="rounded-[10px]">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {skills.map((skill) => (
                    <Badge key={skill} variant="secondary" className="rounded-[10px] border-0.5">
                      {skill}
                      <button
                        type="button"
                        onClick={() => removeSkill(skill)}
                        className="ml-2 hover:text-destructive"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Languages */}
              <div>
                <FormLabel>Idiomas</FormLabel>
                <div className="flex gap-2 mt-2 mb-2">
                  <Input
                    placeholder="Añadir idioma..."
                    value={newLanguage}
                    onChange={(e) => setNewLanguage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addLanguage())}
                    className="rounded-[10px] border-0.5 border-foreground"
                  />
                  <Button type="button" onClick={addLanguage} size="sm" className="rounded-[10px]">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {languages.map((language) => (
                    <Badge key={language} variant="secondary" className="rounded-[10px] border-0.5">
                      {language}
                      <button
                        type="button"
                        onClick={() => removeLanguage(language)}
                        className="ml-2 hover:text-destructive"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            {/* Preferencias */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Preferencias</h3>
              
              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ubicación</FormLabel>
                      <FormControl>
                        <Input className="rounded-[10px] border-0.5 border-foreground" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="remote_work_preference"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Trabajo Remoto</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="rounded-[10px] border-0.5 border-foreground">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="onsite">Presencial</SelectItem>
                          <SelectItem value="remote">Remoto</SelectItem>
                          <SelectItem value="hybrid">Híbrido</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="source"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fuente</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="rounded-[10px] border-0.5 border-foreground">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="manual">Manual</SelectItem>
                          <SelectItem value="linkedin">LinkedIn</SelectItem>
                          <SelectItem value="job_board">Portal de Empleo</SelectItem>
                          <SelectItem value="referral">Referencia</SelectItem>
                          <SelectItem value="website">Sitio Web</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* CV */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Curriculum Vitae</h3>
              
              <div className="space-y-3">
                <div className="border-2 border-dashed border-border rounded-[10px] p-6 text-center">
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleCvUpload}
                    className="hidden"
                    id="cv-upload"
                    disabled={cvUploading}
                  />
                  <label htmlFor="cv-upload" className="cursor-pointer">
                    <div className="space-y-2">
                      <Upload className="w-8 h-8 mx-auto text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">
                          {cvUploading ? 'Subiendo...' : 'Subir CV'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          PDF, DOC o DOCX (máx. 10MB)
                        </p>
                      </div>
                    </div>
                  </label>
                </div>

                {currentCvPath && (
                  <div className="flex items-center justify-between p-3 bg-muted rounded-[10px] border-0.5">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-medium">
                        {cvFile?.name || currentCvPath.split('/').pop()}
                      </span>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleDownloadCv}
                      className="rounded-[10px] border-0.5"
                    >
                      Descargar
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Notas */}
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="cover_letter"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Carta de Presentación</FormLabel>
                    <FormControl>
                      <Textarea className="rounded-[10px] border-0.5 border-foreground" rows={3} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notas Internas</FormLabel>
                    <FormControl>
                      <Textarea className="rounded-[10px] border-0.5 border-foreground" rows={3} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Botones */}
            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={onClose} className="rounded-[10px] border-0.5 border-foreground" disabled={isLoading}>
                Cancelar
              </Button>
              <Button type="submit" className="rounded-[10px]" disabled={isLoading}>
                {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {candidate ? 'Actualizar' : 'Crear'} Candidato
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}