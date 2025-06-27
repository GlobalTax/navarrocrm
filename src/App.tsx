
import { GlobalStateProvider } from '@/contexts/GlobalStateContext'
import { AppProvider } from '@/contexts/AppContext'
import { QueryClient } from '@/contexts/QueryContext'
import { AppRouter } from '@/components/routing/AppRouter'
import './App.css'

function App() {
  return (
    <QueryClient>
      <AppProvider>
        <GlobalStateProvider>
          <AppRouter />
        </GlobalStateProvider>
      </AppProvider>
    </QueryClient>
  )
}

export default App
