import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import mockApi from './mockApi.js'
import './styles/globals.css'
import Landing from './Landing.jsx'
import AppShell from './AppShell.jsx'

window.api = mockApi

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/app" element={<AppShell />} />
        <Route path="/app/*" element={<AppShell />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
)
