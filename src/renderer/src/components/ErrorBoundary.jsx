import { Component } from 'react'

export default class ErrorBoundary extends Component {
  state = { error: null }

  static getDerivedStateFromError(error) {
    return { error }
  }

  render() {
    if (this.state.error) {
      return (
        <div style={{
          padding: '2rem', fontFamily: 'sans-serif',
          background: 'var(--bg-primary, #1a1a1a)', color: 'var(--text-primary, #eee)',
          minHeight: '100vh', display: 'flex', flexDirection: 'column', gap: '1rem'
        }}>
          <h2 style={{ color: 'var(--red, #e05252)', margin: 0 }}>Algo deu errado</h2>
          <p style={{ color: 'var(--text-secondary, #aaa)', margin: 0 }}>
            Ocorreu um erro inesperado. Você pode tentar recarregar ou navegar para outra tela.
          </p>
          <pre style={{
            background: 'rgba(255,0,0,0.08)', border: '1px solid rgba(255,0,0,0.2)',
            borderRadius: 6, padding: '0.75rem', fontSize: 12,
            color: 'var(--red, #e05252)', whiteSpace: 'pre-wrap', maxWidth: 600
          }}>
            {this.state.error.message}
          </pre>
          <button
            onClick={() => this.setState({ error: null })}
            style={{
              padding: '0.5rem 1.25rem', background: 'var(--accent, #4f8ef7)',
              border: 'none', borderRadius: 6, color: '#fff',
              cursor: 'pointer', fontSize: 14, width: 'fit-content'
            }}
          >
            Tentar novamente
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
