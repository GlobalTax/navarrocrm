
import React, { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { FileUploadHandler } from '@/components/pwa/FileUploadHandler'
import { toast } from 'sonner'

const ShareHandler = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [sharedData, setSharedData] = useState<{
    files: File[]
    title: string
    text: string
    url: string
  }>({
    files: [],
    title: '',
    text: '',
    url: ''
  })

  useEffect(() => {
    // Extraer datos de la URL o del POST data
    const title = searchParams.get('title') || ''
    const text = searchParams.get('text') || ''
    const url = searchParams.get('url') || ''
    
    setSharedData(prev => ({
      ...prev,
      title,
      text,
      url
    }))

    // Si hay archivos en el FormData, se procesarían aquí
    // En un escenario real, esto vendría del POST request
    console.log('Shared data received:', { title, text, url })
  }, [searchParams])

  const handleSave = async (data: any) => {
    try {
      // Aquí implementarías la lógica para guardar los archivos
      // Por ejemplo, subirlos a Supabase Storage y crear registros en la base de datos
      
      console.log('Saving shared data:', data)
      
      toast.success('Archivos guardados correctamente')
      
      // Redireccionar al dashboard o a la sección relevante
      navigate('/documents')
    } catch (error) {
      console.error('Error saving shared files:', error)
      toast.error('Error al guardar los archivos')
    }
  }

  const handleCancel = () => {
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <FileUploadHandler
        files={sharedData.files}
        title={sharedData.title}
        text={sharedData.text}
        url={sharedData.url}
        onSave={handleSave}
        onCancel={handleCancel}
      />
    </div>
  )
}

export default ShareHandler
