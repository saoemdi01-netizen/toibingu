import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, info: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, info) {
    this.setState({ info });
    console.error('💥 App crashed:', error, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          background: '#0a0b10', color: 'white', minHeight: '100vh',
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', padding: '2rem', fontFamily: 'monospace'
        }}>
          <div style={{ maxWidth: '800px', width: '100%' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>💥</div>
            <h1 style={{ color: '#f87171', fontSize: '1.5rem', marginBottom: '1rem' }}>
              App Crashed — Runtime Error
            </h1>
            <pre style={{
              background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
              borderRadius: '12px', padding: '1.5rem', fontSize: '0.82rem',
              whiteSpace: 'pre-wrap', wordBreak: 'break-word', color: '#fca5a5',
              maxHeight: '60vh', overflow: 'auto'
            }}>
              {this.state.error?.toString()}
              {'\n\n'}
              {this.state.info?.componentStack}
            </pre>
            <button
              onClick={() => window.location.reload()}
              style={{
                marginTop: '1.5rem', background: '#6366f1', border: 'none',
                color: 'white', padding: '0.8rem 2rem', borderRadius: '10px',
                fontSize: '0.9rem', fontWeight: '700', cursor: 'pointer'
              }}
            >
              🔄 Tải lại trang
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>,
);
