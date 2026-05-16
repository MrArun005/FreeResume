import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import ErrorBoundary from './components/ui/ErrorBoundary.jsx'
import { AppThemeProvider } from './context/AppThemeContext'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <AppThemeProvider>
        <App />
      </AppThemeProvider>
    </ErrorBoundary>
  </StrictMode>,
)
