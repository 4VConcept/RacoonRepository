import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import ParametresProvider from './context/ParametresContext.jsx'
import './index.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ParametresProvider>
      <App />
    </ParametresProvider>
  </StrictMode>
)