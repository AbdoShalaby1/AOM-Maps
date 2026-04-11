import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import { LangProvider } from './contexts/lang.tsx'
import { ThemeProvider } from './contexts/theme.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <LangProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/:country?" element={<App />} />
        </Routes>
      </BrowserRouter>
      </LangProvider>
    </ThemeProvider>
  </StrictMode>,
)