import { DocumentGenerator } from '@/components/documents/DocumentGenerator'
import { StandardPageContainer } from '@/components/layout/StandardPageContainer'

export default function Documents() {
  return (
    <StandardPageContainer>
      <DocumentGenerator />
    </StandardPageContainer>
  )
}