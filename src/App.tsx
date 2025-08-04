// Phase 1: Complete React Isolation Test
import React from 'react'

const App = () => {
  const [status, setStatus] = React.useState('Testing React Core...')
  const [counter, setCounter] = React.useState(0)

  React.useEffect(() => {
    console.log('✅ Phase 1: React hooks working')
    setStatus('✅ React Core Working!')
  }, [])

  return (
    <div style={{
      padding: '50px',
      fontFamily: 'system-ui',
      maxWidth: '800px',
      margin: '0 auto'
    }}>
      <div style={{
        background: '#28a745',
        color: 'white',
        padding: '20px',
        borderRadius: '8px',
        marginBottom: '20px'
      }}>
        <h1 style={{ margin: '0 0 10px 0' }}>Phase 1: React Core Test</h1>
        <p style={{ margin: 0 }}>Status: {status}</p>
      </div>
      
      <div style={{
        background: '#f8f9fa',
        border: '2px solid #28a745',
        padding: '20px',
        borderRadius: '8px',
        marginBottom: '20px'
      }}>
        <h2>React Functionality Test</h2>
        <p><strong>React Version:</strong> {React.version}</p>
        <p><strong>Counter:</strong> {counter}</p>
        <button 
          onClick={() => setCounter(c => c + 1)}
          style={{
            background: '#007bff',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '4px',
            cursor: 'pointer',
            marginRight: '10px'
          }}
        >
          Test State (+)
        </button>
        <button 
          onClick={() => setStatus(`Updated: ${new Date().toLocaleTimeString()}`)}
          style={{
            background: '#28a745',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Test Update
        </button>
      </div>

      <div style={{
        background: '#fff3cd',
        border: '1px solid #ffeaa7',
        padding: '20px',
        borderRadius: '4px'
      }}>
        <strong>🔧 Phase 1 Test:</strong><br/>
        If both buttons work, React core is functional. 
        Next step will be adding providers one by one.
      </div>
    </div>
  )
}

export default App