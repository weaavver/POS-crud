import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import { DealsProvider } from './context/DealsContext'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <DealsProvider>
          <CartProvider>
            <App />
          </CartProvider>
        </DealsProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)