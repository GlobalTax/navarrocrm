import { useCallback } from 'react'
import { Upload } from 'lucide-react'
import { useDropzone } from 'react-dropzone'

interface HubSpotUploadStepProps {
  onFileSelected: (file: File) => void
  isDragActive?: boolean
}

export function HubSpotUploadStep({ onFileSelected }: HubSpotUploadStepProps) {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (file) {
      onFileSelected(file)
    }
  }, [onFileSelected])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx']
    },
    maxFiles: 1
  })

  return (
    <div
      {...getRootProps()}
      className={`border-2 border-dashed rounded-[10px] p-8 text-center cursor-pointer transition-colors ${
        isDragActive ? 'border-primary bg-primary/5' : 'border-gray-300'
      }`}
    >
      <input {...getInputProps()} />
      {isDragActive ? (
        <p>Suelta el archivo de HubSpot aquí...</p>
      ) : (
        <div className="space-y-2">
          <Upload className="h-8 w-8 mx-auto text-gray-400" />
          <p>Arrastra y suelta tu archivo de exportación de HubSpot aquí</p>
          <p className="text-sm text-muted-foreground">
            Formatos soportados: .csv, .xls, .xlsx
          </p>
          <p className="text-xs text-blue-600">
            💡 Asegúrate de incluir los campos: firstname, lastname, email, company, phone
          </p>
        </div>
      )}
    </div>
  )
}