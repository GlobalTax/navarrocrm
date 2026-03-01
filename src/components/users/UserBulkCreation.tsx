import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import Papa from 'papaparse'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Upload, Download, FileSpreadsheet, CheckCircle2, XCircle,
  AlertTriangle, Users, Loader2, Eye, Copy
} from 'lucide-react'
import { supabase } from '@/integrations/supabase/client'
import { useApp } from '@/contexts/AppContext'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

const VALID_ROLES = ['partner', 'area_manager', 'senior', 'junior', 'finance'] as const
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

interface CsvRow {
  email: string
  role: string
  first_name: string
  last_name: string
}

interface ValidationResult {
  row: CsvRow
  index: number
  errors: string[]
  isValid: boolean
}

interface CreationResult {
  email: string
  password?: string
  success: boolean
  error?: string
}

type Step = 'upload' | 'preview' | 'processing' | 'summary'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  onClose: () => void
}

export const UserBulkCreation = ({ open, onOpenChange, onClose }: Props) => {
  const { user } = useApp()
  const queryClient = useQueryClient()

  const [step, setStep] = useState<Step>('upload')
  const [validatedRows, setValidatedRows] = useState<ValidationResult[]>([])
  const [results, setResults] = useState<CreationResult[]>([])
  const [progress, setProgress] = useState(0)
  const [isProcessing, setIsProcessing] = useState(false)
  const [showPasswords, setShowPasswords] = useState(false)

  const reset = () => {
    setStep('upload')
    setValidatedRows([])
    setResults([])
    setProgress(0)
    setIsProcessing(false)
    setShowPasswords(false)
  }

  const handleClose = () => {
    reset()
    onClose()
  }

  // ── CSV Template ──
  const downloadTemplate = () => {
    const csv = 'email,role,first_name,last_name\njuan.perez@empresa.com,senior,Juan,Pérez\nmaria.garcia@empresa.com,junior,María,García\n'
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'plantilla_usuarios.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  // ── Validation ──
  const validateRows = (rows: CsvRow[]): ValidationResult[] => {
    const seen = new Set<string>()
    return rows.map((row, index) => {
      const errors: string[] = []
      const email = row.email?.trim().toLowerCase()
      const role = row.role?.trim().toLowerCase()

      if (!email) errors.push('Email vacío')
      else if (!EMAIL_REGEX.test(email)) errors.push('Email inválido')
      else if (seen.has(email)) errors.push('Email duplicado en CSV')
      else seen.add(email)

      if (!role) errors.push('Rol vacío')
      else if (!VALID_ROLES.includes(role as any)) errors.push(`Rol inválido (válidos: ${VALID_ROLES.join(', ')})`)

      return { row: { ...row, email, role }, index, errors, isValid: errors.length === 0 }
    })
  }

  // ── File Drop ──
  const onDrop = useCallback((files: File[]) => {
    const file = files[0]
    if (!file) return

    Papa.parse<CsvRow>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (res) => {
        if (!res.data.length) {
          toast.error('El CSV está vacío')
          return
        }
        const validated = validateRows(res.data)
        setValidatedRows(validated)
        setStep('preview')
      },
      error: () => toast.error('Error al leer el CSV'),
    })
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'text/csv': ['.csv'] },
    maxFiles: 1,
  })

  // ── Processing ──
  const processUsers = async () => {
    if (!user?.org_id) return
    const validRows = validatedRows.filter(r => r.isValid)
    if (!validRows.length) return

    setStep('processing')
    setIsProcessing(true)
    const newResults: CreationResult[] = []

    for (let i = 0; i < validRows.length; i++) {
      const { row } = validRows[i]
      try {
        const { data, error } = await supabase.functions.invoke('create-user', {
          body: {
            email: row.email,
            role: row.role,
            firstName: row.first_name || '',
            lastName: row.last_name || '',
            orgId: user.org_id,
          },
        })

        if (error || data?.error) {
          newResults.push({ email: row.email, success: false, error: data?.error || error?.message })
        } else {
          newResults.push({ email: data.email, password: data.password, success: true })
        }
      } catch (err: any) {
        newResults.push({ email: row.email, success: false, error: err.message })
      }

      setResults([...newResults])
      setProgress(((i + 1) / validRows.length) * 100)

      // Rate-limit pause
      if (i < validRows.length - 1) await new Promise(r => setTimeout(r, 500))
    }

    setIsProcessing(false)
    setStep('summary')

    // Invalidate queries
    queryClient.invalidateQueries({ queryKey: ['users', user.org_id] })
    queryClient.invalidateQueries({ queryKey: ['user-invitations', user.org_id] })

    const ok = newResults.filter(r => r.success).length
    const fail = newResults.filter(r => !r.success).length
    toast.success(`Creación finalizada: ${ok} exitosos, ${fail} errores`)
  }

  // ── Download Credentials ──
  const downloadCredentials = () => {
    const successful = results.filter(r => r.success)
    if (!successful.length) return
    const csv = 'email,password\n' + successful.map(r => `${r.email},${r.password}`).join('\n') + '\n'
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'credenciales_usuarios.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  const copyCredentials = () => {
    const successful = results.filter(r => r.success)
    const text = successful.map(r => `${r.email} / ${r.password}`).join('\n')
    navigator.clipboard.writeText(text)
    toast.success('Credenciales copiadas al portapapeles')
  }

  const validCount = validatedRows.filter(r => r.isValid).length
  const invalidCount = validatedRows.filter(r => !r.isValid).length
  const successCount = results.filter(r => r.success).length
  const errorCount = results.filter(r => !r.success).length

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!isProcessing) { if (!v) handleClose(); else onOpenChange(v) } }}>
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col border-[0.5px] border-black rounded-[10px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-['Manrope']">
            <Users className="h-5 w-5" />
            Importación Masiva de Usuarios
          </DialogTitle>
          <DialogDescription>
            Crea usuarios reales con auth y perfil a partir de un CSV.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          {/* ── STEP: UPLOAD ── */}
          {step === 'upload' && (
            <div className="space-y-4">
              <div className="flex justify-end">
                <Button variant="outline" size="sm" onClick={downloadTemplate}
                  className="border-[0.5px] border-black rounded-[10px]">
                  <Download className="h-4 w-4 mr-2" />
                  Descargar Plantilla CSV
                </Button>
              </div>

              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-[10px] p-10 text-center cursor-pointer transition-all duration-200
                  ${isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/30 hover:border-primary/50'}`}
              >
                <input {...getInputProps()} />
                <Upload className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
                <p className="text-sm font-medium">
                  {isDragActive ? 'Suelta el archivo aquí...' : 'Arrastra un CSV o haz clic para seleccionar'}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Columnas: email, role, first_name, last_name
                </p>
              </div>

              <div className="bg-muted/50 rounded-[10px] p-3 text-xs space-y-1">
                <p className="font-semibold">Roles válidos:</p>
                <div className="flex flex-wrap gap-1">
                  {VALID_ROLES.map(r => (
                    <Badge key={r} variant="outline" className="border-[0.5px] border-black rounded-[10px] text-xs">{r}</Badge>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── STEP: PREVIEW ── */}
          {step === 'preview' && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Badge className="rounded-[10px]" variant={validCount > 0 ? 'default' : 'destructive'}>
                  <CheckCircle2 className="h-3 w-3 mr-1" /> {validCount} válidos
                </Badge>
                {invalidCount > 0 && (
                  <Badge variant="destructive" className="rounded-[10px]">
                    <XCircle className="h-3 w-3 mr-1" /> {invalidCount} con errores
                  </Badge>
                )}
              </div>

              <ScrollArea className="h-[300px] border-[0.5px] border-black rounded-[10px]">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50 sticky top-0">
                    <tr>
                      <th className="p-2 text-left">#</th>
                      <th className="p-2 text-left">Email</th>
                      <th className="p-2 text-left">Rol</th>
                      <th className="p-2 text-left">Nombre</th>
                      <th className="p-2 text-left">Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {validatedRows.map((v) => (
                      <tr key={v.index} className={!v.isValid ? 'bg-destructive/5' : ''}>
                        <td className="p-2 text-muted-foreground">{v.index + 1}</td>
                        <td className="p-2 font-mono text-xs">{v.row.email}</td>
                        <td className="p-2">{v.row.role}</td>
                        <td className="p-2">{[v.row.first_name, v.row.last_name].filter(Boolean).join(' ')}</td>
                        <td className="p-2">
                          {v.isValid ? (
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                          ) : (
                            <span className="text-xs text-destructive">{v.errors.join(', ')}</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </ScrollArea>

              <div className="flex justify-between">
                <Button variant="outline" onClick={reset} className="border-[0.5px] border-black rounded-[10px]">
                  Volver
                </Button>
                <Button onClick={processUsers} disabled={validCount === 0}
                  className="border-[0.5px] border-black rounded-[10px]">
                  <Users className="h-4 w-4 mr-2" />
                  Crear {validCount} Usuario{validCount !== 1 ? 's' : ''}
                </Button>
              </div>
            </div>
          )}

          {/* ── STEP: PROCESSING ── */}
          {step === 'processing' && (
            <div className="space-y-6 py-4">
              <div className="text-center space-y-2">
                <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                <p className="text-sm font-medium">
                  Creando usuarios... {results.length} de {validCount}
                </p>
              </div>

              <Progress value={progress} className="h-3 rounded-[10px]" />

              <div className="flex gap-3 justify-center">
                <Badge variant="default" className="rounded-[10px]">
                  <CheckCircle2 className="h-3 w-3 mr-1" /> {successCount} creados
                </Badge>
                {errorCount > 0 && (
                  <Badge variant="destructive" className="rounded-[10px]">
                    <XCircle className="h-3 w-3 mr-1" /> {errorCount} errores
                  </Badge>
                )}
              </div>

              <ScrollArea className="h-[200px] border-[0.5px] border-black rounded-[10px] p-2">
                {results.map((r, i) => (
                  <div key={i} className="flex items-center gap-2 py-1 text-xs">
                    {r.success ? (
                      <CheckCircle2 className="h-3 w-3 text-green-600 shrink-0" />
                    ) : (
                      <XCircle className="h-3 w-3 text-destructive shrink-0" />
                    )}
                    <span className="font-mono">{r.email}</span>
                    {!r.success && <span className="text-destructive ml-auto truncate max-w-[200px]">{r.error}</span>}
                  </div>
                ))}
              </ScrollArea>
            </div>
          )}

          {/* ── STEP: SUMMARY ── */}
          {step === 'summary' && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Badge variant="default" className="rounded-[10px]">
                  <CheckCircle2 className="h-3 w-3 mr-1" /> {successCount} creados
                </Badge>
                {errorCount > 0 && (
                  <Badge variant="destructive" className="rounded-[10px]">
                    <XCircle className="h-3 w-3 mr-1" /> {errorCount} errores
                  </Badge>
                )}
              </div>

              {successCount > 0 && (
                <>
                  <div className="bg-amber-50 border border-amber-200 rounded-[10px] p-3 text-xs flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                    <span>Las contraseñas solo se muestran una vez. Descárgalas o cópialas antes de cerrar.</span>
                  </div>

                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => setShowPasswords(!showPasswords)}
                      variant="outline" className="border-[0.5px] border-black rounded-[10px]">
                      <Eye className="h-4 w-4 mr-1" />
                      {showPasswords ? 'Ocultar' : 'Mostrar'} contraseñas
                    </Button>
                    <Button size="sm" onClick={copyCredentials}
                      variant="outline" className="border-[0.5px] border-black rounded-[10px]">
                      <Copy className="h-4 w-4 mr-1" /> Copiar
                    </Button>
                    <Button size="sm" onClick={downloadCredentials}
                      className="border-[0.5px] border-black rounded-[10px]">
                      <Download className="h-4 w-4 mr-1" /> Descargar CSV
                    </Button>
                  </div>
                </>
              )}

              <ScrollArea className="h-[250px] border-[0.5px] border-black rounded-[10px]">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50 sticky top-0">
                    <tr>
                      <th className="p-2 text-left">Email</th>
                      <th className="p-2 text-left">Contraseña</th>
                      <th className="p-2 text-left">Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((r, i) => (
                      <tr key={i} className={!r.success ? 'bg-destructive/5' : ''}>
                        <td className="p-2 font-mono text-xs">{r.email}</td>
                        <td className="p-2 font-mono text-xs">
                          {r.success ? (showPasswords ? r.password : '••••••••') : '—'}
                        </td>
                        <td className="p-2">
                          {r.success ? (
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                          ) : (
                            <span className="text-xs text-destructive truncate block max-w-[180px]">{r.error}</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </ScrollArea>

              <div className="flex justify-end">
                <Button onClick={handleClose} className="border-[0.5px] border-black rounded-[10px]">
                  Cerrar
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
