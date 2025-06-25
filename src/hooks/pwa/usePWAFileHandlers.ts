
import { useCallback } from 'react'

export const usePWAFileHandlers = () => {
  const handleFileOpen = useCallback((files: FileList) => {
    console.log('Files opened via PWA:', files)
    const fileArray = Array.from(files)
    const uploadUrl = new URL('/upload', window.location.origin)
    window.location.href = uploadUrl.toString()
    return fileArray
  }, [])

  const handleProtocolAction = useCallback((action: string) => {
    console.log('Protocol action:', action)
    const urlParams = new URLSearchParams(action)
    const actionType = urlParams.get('type')
    const entityId = urlParams.get('id')
    
    switch (actionType) {
      case 'client':
        window.location.href = entityId ? `/clients/${entityId}` : '/contacts'
        break
      case 'case':
        window.location.href = entityId ? `/cases/${entityId}` : '/cases'
        break
      case 'proposal':
        window.location.href = entityId ? `/proposals/${entityId}` : '/proposals'
        break
      case 'timer':
        window.location.href = '/time-tracking'
        break
      default:
        window.location.href = '/'
    }
  }, [])

  return {
    handleFileOpen,
    handleProtocolAction
  }
}
