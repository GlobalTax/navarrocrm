import React, { useState } from 'react'

console.log('✅ CleanApp: Loading clean application')

const CleanApp = () => {
  console.log('✅ CleanApp: Component rendering')
  
  const [status, setStatus] = useState('CRM Legal Pro - Sistema Limpio')
  const [counter, setCounter] = useState(0)
  
  console.log('✅ CleanApp: useState working correctly')
  
  return (
    <div style={{
      fontFamily: 'Manrope, system-ui, sans-serif',
      padding: '20px',
      maxWidth: '1200px',
      margin: '0 auto',
      background: '#ffffff',
      minHeight: '100vh'
    }}>
      <div style={{
        background: '#ffffff',
        border: '0.5px solid #000000',
        borderRadius: '10px',
        padding: '24px',
        marginBottom: '20px',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
      }}>
        <h1 style={{
          fontSize: '32px',
          fontWeight: '700',
          color: '#000000',
          marginBottom: '16px'
        }}>
          {status}
        </h1>
        
        <div style={{
          display: 'grid',
          gap: '16px',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          marginBottom: '24px'
        }}>
          <div style={{
            background: '#f8f9fa',
            border: '0.5px solid #000000',
            borderRadius: '10px',
            padding: '16px'
          }}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>
              Estado del Sistema
            </h3>
            <p style={{ color: '#059669', fontWeight: '500' }}>
              ✅ React funcionando correctamente
            </p>
            <p style={{ color: '#059669', fontWeight: '500' }}>
              ✅ useState operativo
            </p>
            <p style={{ color: '#059669', fontWeight: '500' }}>
              ✅ Aplicación limpia cargada
            </p>
          </div>
          
          <div style={{
            background: '#f8f9fa',
            border: '0.5px solid #000000',
            borderRadius: '10px',
            padding: '16px'
          }}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>
              Contador de Prueba
            </h3>
            <p style={{ fontSize: '24px', fontWeight: '700', color: '#0061FF' }}>
              {counter}
            </p>
            <button
              onClick={() => setCounter(counter + 1)}
              style={{
                background: '#ffffff',
                border: '0.5px solid #000000',
                borderRadius: '10px',
                padding: '8px 16px',
                cursor: 'pointer',
                fontWeight: '500',
                transition: 'all 0.2s ease-out'
              }}
              onMouseEnter={(e) => {
                const target = e.target as HTMLButtonElement
                target.style.transform = 'translateY(-2px)'
                target.style.boxShadow = '0 4px 12px 0 rgba(0, 0, 0, 0.15)'
              }}
              onMouseLeave={(e) => {
                const target = e.target as HTMLButtonElement
                target.style.transform = 'translateY(0)'
                target.style.boxShadow = '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
              }}
            >
              Incrementar
            </button>
          </div>
        </div>
        
        <div style={{
          display: 'flex',
          gap: '12px',
          flexWrap: 'wrap'
        }}>
          <button
            onClick={() => setStatus('Dashboard CRM - Listo para desarrollo')}
            style={{
              background: '#0061FF',
              color: '#ffffff',
              border: 'none',
              borderRadius: '10px',
              padding: '12px 24px',
              cursor: 'pointer',
              fontWeight: '500',
              transition: 'all 0.2s ease-out'
            }}
            onMouseEnter={(e) => {
              const target = e.target as HTMLButtonElement
              target.style.transform = 'translateY(-2px)'
              target.style.boxShadow = '0 4px 12px 0 rgba(6, 97, 255, 0.3)'
            }}
            onMouseLeave={(e) => {
              const target = e.target as HTMLButtonElement
              target.style.transform = 'translateY(0)'
              target.style.boxShadow = 'none'
            }}
          >
            Ir a Dashboard
          </button>
          
          <button
            onClick={() => setStatus('CRM Legal Pro - Sistema funcionando')}
            style={{
              background: '#ffffff',
              color: '#000000',
              border: '0.5px solid #000000',
              borderRadius: '10px',
              padding: '12px 24px',
              cursor: 'pointer',
              fontWeight: '500',
              transition: 'all 0.2s ease-out'
            }}
            onMouseEnter={(e) => {
              const target = e.target as HTMLButtonElement
              target.style.transform = 'translateY(-2px)'
              target.style.boxShadow = '0 4px 12px 0 rgba(0, 0, 0, 0.15)'
            }}
            onMouseLeave={(e) => {
              const target = e.target as HTMLButtonElement
              target.style.transform = 'translateY(0)'
              target.style.boxShadow = '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
            }}
          >
            Reset Status
          </button>
        </div>
      </div>
      
      <div style={{
        background: '#f0f9ff',
        border: '0.5px solid #0061FF',
        borderRadius: '10px',
        padding: '16px',
        color: '#1e40af'
      }}>
        <h4 style={{ fontWeight: '600', marginBottom: '8px' }}>
          🎉 Sistema Recuperado Exitosamente
        </h4>
        <p style={{ fontSize: '14px', lineHeight: '1.5' }}>
          La aplicación React está funcionando correctamente. Todos los hooks y el estado 
          están operativos. El sistema está listo para el desarrollo del CRM Legal Pro.
        </p>
      </div>
    </div>
  )
}

export default CleanApp