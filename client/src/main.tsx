import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import { installAuth } from './shared/api/authToken'
import './i18n'
import './index.css'

// Attach identity tokens to /api requests and bootstrap the guest session before rendering
installAuth()

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>,
)
