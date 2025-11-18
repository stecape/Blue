import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import MyDevices from './sections/MyDevices/MyDevices'
import { useAuth } from '../Auth/AuthContext'
import './styles/UserApp.scss'

const UserApp = () => {
  const { user, logout } = useAuth()

  const PlantIcon = () => (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="plant-icon">
      {/* Vaso */}
      <path d="M12 22 L10 30 L22 30 L20 22 Z" fill="#8D6E63" stroke="#6D4C41" strokeWidth="1.5" strokeLinejoin="round"/>
      {/* Terra */}
      <ellipse cx="16" cy="22" rx="4.5" ry="1.5" fill="#5D4037"/>
      {/* Stelo */}
      <line x1="16" y1="22" x2="16" y2="10" stroke="#66BB6A" strokeWidth="2" strokeLinecap="round"/>
      {/* Foglia sinistra */}
      <path d="M16 14 Q10 12 8 8" stroke="#4CAF50" strokeWidth="2" fill="none" strokeLinecap="round"/>
      <path d="M16 14 Q11 13 9 9" stroke="#66BB6A" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
      {/* Foglia destra */}
      <path d="M16 14 Q22 12 24 8" stroke="#4CAF50" strokeWidth="2" fill="none" strokeLinecap="round"/>
      <path d="M16 14 Q21 13 23 9" stroke="#66BB6A" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
      {/* Foglia centrale */}
      <path d="M16 10 Q16 6 16 4" stroke="#4CAF50" strokeWidth="2" fill="none" strokeLinecap="round"/>
      <ellipse cx="16" cy="3.5" rx="2" ry="2.5" fill="#66BB6A"/>
    </svg>
  )

  return (
    <BrowserRouter>
      <div className="user-app">
        <header className="user-header">
          <div className="user-header-content">
            <div className="header-title">
              <PlantIcon />
              <h1>My Devices</h1>
            </div>
            <div className="user-info">
              {user?.picture && <img src={user.picture} alt={user.name} className="user-avatar" />}
              <span>{user?.name}</span>
              <button onClick={logout} className="logout-btn">Logout</button>
            </div>
          </div>
        </header>
        
        <main className="user-main">
          <Routes>
            <Route path="/" element={<Navigate to="/my-devices" replace />} />
            <Route path="/my-devices" element={<MyDevices />} />
            <Route path="*" element={<Navigate to="/my-devices" replace />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}

export default UserApp
