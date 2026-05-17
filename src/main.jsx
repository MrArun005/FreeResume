import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import ErrorBoundary from './components/ui/ErrorBoundary.jsx'
import { AppThemeProvider } from './context/AppThemeContext'
import { initTheme } from './theme/tokens'

// Apply the saved theme before React mounts so the first paint already
// reflects the user's chosen brand color (no teal→indigo flash).
initTheme();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <AppThemeProvider>
        <App />
      </AppThemeProvider>
    </ErrorBoundary>
  </StrictMode>,
)
