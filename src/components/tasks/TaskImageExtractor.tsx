import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { ImageIcon, Loader2, X, Camera } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { supabase } from '@/integrations/supabase/client'
import { toast } from 'sonner'

interface ExtractedTaskData {
  title: string
  description: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  due_date: string
  estimated_hours: number
}

interface TaskImageExtractorProps {
  onExtracted: (data: ExtractedTaskData) => void
  onClose: () => void
}

export const TaskImageExtractor = ({ onExtracted, onClose }: TaskImageExtractorProps) => {
  const [isProcessing, setIsProcessing] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)

  const processImage = useCallback(async (base64: string) => {
    setIsProcessing(true)
    try {
      const { data, error } = await supabase.functions.invoke('extract-task-from-image', {
        body: { image: base64 }
      })

      if (error) throw new Error(error.message || 'Error al procesar la imagen')
      if (data?.error) throw new Error(data.error)

      onExtracted(data)
      toast.success('Datos extraídos correctamente')
      onClose()
    } catch (err: any) {
      console.error('Error extrayendo datos:', err)
      toast.error(err.message || 'Error al analizar la imagen')
    } finally {
      setIsProcessing(false)
    }
  }, [onExtracted, onClose])

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      toast.error('La imagen no puede superar 5MB')
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      const base64 = reader.result as string
      setPreview(base64)
      processImage(base64)
    }
    reader.readAsDataURL(file)
  }, [processImage])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpg', '.jpeg', '.png', '.webp'] },
    maxFiles: 1,
    disabled: isProcessing
  })

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-medium">
          <Camera className="h-4 w-4" />
          Extraer tarea desde imagen
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="h-6 w-6 p-0"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {isProcessing ? (
        <div className="flex flex-col items-center justify-center py-8 border-[0.5px] border-black rounded-[10px] bg-muted/30">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-3" />
          <p className="text-sm text-muted-foreground">Analizando imagen con IA...</p>
        </div>
      ) : (
        <div
          {...getRootProps()}
          className={`flex flex-col items-center justify-center py-8 border-[0.5px] border-dashed rounded-[10px] cursor-pointer transition-all duration-200 ${
            isDragActive
              ? 'border-primary bg-primary/5'
              : 'border-black hover:border-primary hover:bg-muted/20'
          }`}
        >
          <input {...getInputProps()} />
          {preview ? (
            <img src={preview} alt="Preview" className="max-h-32 rounded-[10px] mb-2" />
          ) : (
            <ImageIcon className="h-10 w-10 text-muted-foreground mb-2" />
          )}
          <p className="text-sm text-muted-foreground text-center px-4">
            {isDragActive
              ? 'Suelta la imagen aquí...'
              : 'Arrastra una captura de email o documento, o haz clic para seleccionar'}
          </p>
          <p className="text-xs text-muted-foreground mt-1">JPG, PNG, WEBP · Máx 5MB</p>
        </div>
      )}
    </div>
  )
}
