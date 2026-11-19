import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router'
import App from '@/app/App'
import ReaderSettingsProvider from '@/app/ReaderSettingsProvider'
import '@/styles/fonts.css'
import '@/styles/globals.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ReaderSettingsProvider>
      <HashRouter>
        <App />
      </HashRouter>
    </ReaderSettingsProvider>
  </StrictMode>,
)
