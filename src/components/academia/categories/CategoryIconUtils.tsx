
import { 
  Users, FileText, Brain, Settings, BookOpen
} from 'lucide-react'

export const getCategoryIcon = (iconName: string) => {
  switch (iconName) {
    case 'Users': return Users
    case 'FileText': return FileText
    case 'Brain': return Brain
    case 'Settings': return Settings
    default: return BookOpen
  }
}
