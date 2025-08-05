import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { X } from 'lucide-react'
import { CreateEmployeeData, SimpleEmployee } from '@/hooks/useSimpleEmployees'
import { useTeams } from '@/hooks/useTeams'

interface AdvancedEmployeeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: CreateEmployeeData) => void
  employee?: SimpleEmployee | null
  isSubmitting: boolean
}

export function AdvancedEmployeeDialog({
  open,
  onOpenChange,
  onSubmit,
  employee,
  isSubmitting
}: AdvancedEmployeeDialogProps) {
  const { departments, isLoading: loadingDepartments } = useTeams()
  const [formData, setFormData] = useState<CreateEmployeeData>({
    name: '',
    email: '',
    phone: '',
    position: '',
    department: '',
    hire_date: new Date().toISOString().split('T')[0],
    salary: undefined,
    status: 'active',
    notes: '',
    // Nuevos campos
    birth_date: '',
    address_street: '',
    address_city: '',
    address_postal_code: '',
    address_country: 'España',
    emergency_contact_name: '',
    emergency_contact_phone: '',
    dni_nie: '',
    social_security_number: '',
    bank_account: '',
    contract_type: 'indefinido',
    working_hours_per_week: 40,
    skills: [],
    languages: [],
    education_level: ''
  })

  const [skillInput, setSkillInput] = useState('')
  const [languageInput, setLanguageInput] = useState('')

  useEffect(() => {
    if (employee) {
      setFormData({
        name: employee.name,
        email: employee.email,
        phone: employee.phone || '',
        position: employee.position,
        department: employee.department || 'none',
        hire_date: employee.hire_date,
        salary: employee.salary,
        status: employee.status,
        notes: employee.notes || '',
        birth_date: employee.birth_date || '',
        address_street: employee.address_street || '',
        address_city: employee.address_city || '',
        address_postal_code: employee.address_postal_code || '',
        address_country: employee.address_country || 'España',
        emergency_contact_name: employee.emergency_contact_name || '',
        emergency_contact_phone: employee.emergency_contact_phone || '',
        dni_nie: employee.dni_nie || '',
        social_security_number: employee.social_security_number || '',
        bank_account: employee.bank_account || '',
        contract_type: employee.contract_type || 'indefinido',
        working_hours_per_week: employee.working_hours_per_week || 40,
        skills: employee.skills || [],
        languages: employee.languages || [],
        education_level: employee.education_level || ''
      })
    } else {
      setFormData({
        name: '',
        email: '',
        phone: '',
        position: '',
        department: 'none',
        hire_date: new Date().toISOString().split('T')[0],
        salary: undefined,
        status: 'active',
        notes: '',
        birth_date: '',
        address_street: '',
        address_city: '',
        address_postal_code: '',
        address_country: 'España',
        emergency_contact_name: '',
        emergency_contact_phone: '',
        dni_nie: '',
        social_security_number: '',
        bank_account: '',
        contract_type: 'indefinido',
        working_hours_per_week: 40,
        skills: [],
        languages: [],
        education_level: ''
      })
    }
  }, [employee, open])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const submitData = {
      ...formData,
      department: formData.department === 'none' ? '' : formData.department
    }
    onSubmit(submitData)
  }

  const handleInputChange = (field: keyof CreateEmployeeData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const addSkill = () => {
    if (skillInput.trim() && !formData.skills?.includes(skillInput.trim())) {
      setFormData(prev => ({
        ...prev,
        skills: [...(prev.skills || []), skillInput.trim()]
      }))
      setSkillInput('')
    }
  }

  const removeSkill = (skill: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills?.filter(s => s !== skill) || []
    }))
  }

  const addLanguage = () => {
    if (languageInput.trim() && !formData.languages?.includes(languageInput.trim())) {
      setFormData(prev => ({
        ...prev,
        languages: [...(prev.languages || []), languageInput.trim()]
      }))
      setLanguageInput('')
    }
  }

  const removeLanguage = (language: string) => {
    setFormData(prev => ({
      ...prev,
      languages: prev.languages?.filter(l => l !== language) || []
    }))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {employee ? 'Editar Empleado' : 'Nuevo Empleado'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="basic">Básico</TabsTrigger>
              <TabsTrigger value="personal">Personal</TabsTrigger>
              <TabsTrigger value="contract">Contrato</TabsTrigger>
              <TabsTrigger value="skills">Habilidades</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre Completo *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Teléfono</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="position">Posición *</Label>
                  <Input
                    id="position"
                    value={formData.position}
                    onChange={(e) => handleInputChange('position', e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="department">Departamento</Label>
                  <Select 
                    value={formData.department} 
                    onValueChange={(value) => handleInputChange('department', value)}
                    disabled={loadingDepartments}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={loadingDepartments ? "Cargando..." : "Seleccionar departamento"} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Sin departamento</SelectItem>
                      {departments.map((dept) => (
                        <SelectItem key={dept.id} value={dept.name}>
                          {dept.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Estado</Label>
                  <Select 
                    value={formData.status} 
                    onValueChange={(value) => handleInputChange('status', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Activo</SelectItem>
                      <SelectItem value="inactive">Inactivo</SelectItem>
                      <SelectItem value="on_leave">De Baja</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="personal" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="birth_date">Fecha de Nacimiento</Label>
                  <Input
                    id="birth_date"
                    type="date"
                    value={formData.birth_date}
                    onChange={(e) => handleInputChange('birth_date', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dni_nie">DNI/NIE</Label>
                  <Input
                    id="dni_nie"
                    value={formData.dni_nie}
                    onChange={(e) => handleInputChange('dni_nie', e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address_street">Dirección</Label>
                <Input
                  id="address_street"
                  value={formData.address_street}
                  onChange={(e) => handleInputChange('address_street', e.target.value)}
                  placeholder="Calle, número, piso..."
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="address_city">Ciudad</Label>
                  <Input
                    id="address_city"
                    value={formData.address_city}
                    onChange={(e) => handleInputChange('address_city', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address_postal_code">Código Postal</Label>
                  <Input
                    id="address_postal_code"
                    value={formData.address_postal_code}
                    onChange={(e) => handleInputChange('address_postal_code', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address_country">País</Label>
                  <Input
                    id="address_country"
                    value={formData.address_country}
                    onChange={(e) => handleInputChange('address_country', e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="emergency_contact_name">Contacto de Emergencia</Label>
                  <Input
                    id="emergency_contact_name"
                    value={formData.emergency_contact_name}
                    onChange={(e) => handleInputChange('emergency_contact_name', e.target.value)}
                    placeholder="Nombre del contacto"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="emergency_contact_phone">Teléfono de Emergencia</Label>
                  <Input
                    id="emergency_contact_phone"
                    value={formData.emergency_contact_phone}
                    onChange={(e) => handleInputChange('emergency_contact_phone', e.target.value)}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="contract" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="hire_date">Fecha de Contratación *</Label>
                  <Input
                    id="hire_date"
                    type="date"
                    value={formData.hire_date}
                    onChange={(e) => handleInputChange('hire_date', e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contract_type">Tipo de Contrato</Label>
                  <Select 
                    value={formData.contract_type} 
                    onValueChange={(value) => handleInputChange('contract_type', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="indefinido">Indefinido</SelectItem>
                      <SelectItem value="temporal">Temporal</SelectItem>
                      <SelectItem value="practicas">Prácticas</SelectItem>
                      <SelectItem value="formacion">Formación</SelectItem>
                      <SelectItem value="freelance">Freelance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="salary">Salario Bruto Anual (€)</Label>
                  <Input
                    id="salary"
                    type="number"
                    step="0.01"
                    value={formData.salary || ''}
                    onChange={(e) => handleInputChange('salary', e.target.value ? parseFloat(e.target.value) : undefined)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="working_hours_per_week">Horas Semanales</Label>
                  <Input
                    id="working_hours_per_week"
                    type="number"
                    value={formData.working_hours_per_week}
                    onChange={(e) => handleInputChange('working_hours_per_week', parseInt(e.target.value))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="social_security_number">Número Seguridad Social</Label>
                  <Input
                    id="social_security_number"
                    value={formData.social_security_number}
                    onChange={(e) => handleInputChange('social_security_number', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bank_account">Cuenta Bancaria (IBAN)</Label>
                  <Input
                    id="bank_account"
                    value={formData.bank_account}
                    onChange={(e) => handleInputChange('bank_account', e.target.value)}
                    placeholder="ES..."
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="skills" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="education_level">Nivel de Educación</Label>
                <Select 
                  value={formData.education_level} 
                  onValueChange={(value) => handleInputChange('education_level', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar nivel" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Sin especificar</SelectItem>
                    <SelectItem value="eso">ESO</SelectItem>
                    <SelectItem value="bachillerato">Bachillerato</SelectItem>
                    <SelectItem value="fp_medio">FP Grado Medio</SelectItem>
                    <SelectItem value="fp_superior">FP Grado Superior</SelectItem>
                    <SelectItem value="universitario">Universitario</SelectItem>
                    <SelectItem value="master">Máster</SelectItem>
                    <SelectItem value="doctorado">Doctorado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Habilidades</Label>
                <div className="flex space-x-2">
                  <Input
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    placeholder="Añadir habilidad..."
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                  />
                  <Button type="button" onClick={addSkill}>Añadir</Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.skills?.map((skill) => (
                    <Badge key={skill} variant="secondary" className="flex items-center gap-1">
                      {skill}
                      <X className="h-3 w-3 cursor-pointer" onClick={() => removeSkill(skill)} />
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Idiomas</Label>
                <div className="flex space-x-2">
                  <Input
                    value={languageInput}
                    onChange={(e) => setLanguageInput(e.target.value)}
                    placeholder="Añadir idioma..."
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addLanguage())}
                  />
                  <Button type="button" onClick={addLanguage}>Añadir</Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.languages?.map((language) => (
                    <Badge key={language} variant="secondary" className="flex items-center gap-1">
                      {language}
                      <X className="h-3 w-3 cursor-pointer" onClick={() => removeLanguage(language)} />
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notas Adicionales</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  rows={4}
                />
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end space-x-2 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Guardando...' : (employee ? 'Actualizar' : 'Crear')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}