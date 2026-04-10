import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import { LangProvider } from './contexts/lang.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <LangProvider>
    <BrowserRouter>
      <Routes>
        <Route path="/:country?" element={<App />} />
      </Routes>
    </BrowserRouter>
    </LangProvider>
  </StrictMode>,
)