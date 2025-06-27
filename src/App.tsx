
import { GlobalStateProvider } from '@/contexts/GlobalStateContext'
import { AppContext } from '@/contexts/AppContext'
import { QueryProvider } from '@/contexts/QueryContext'
import { AppRouter } from '@/components/routing/AppRouter'
import './App.css'

function App() {
  return (
    <QueryProvider>
      <AppContext>
        <GlobalStateProvider>
          <AppRouter />
        </GlobalStateProvider>
      </AppContext>
    </QueryProvider>
  )
}

export default App
