import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import MyDevices from './sections/MyDevices/MyDevices'
import { useAuth } from '../Auth/AuthContext'
import './styles/UserApp.scss'
import { ReactComponent as PlantIcon } from './assets/plant_icon.svg'

const UserApp = () => {
  const { user, logout } = useAuth()

  return (
    <BrowserRouter>
      <div className="user-app">
        <header className="user-header">
          <div className="user-header-content">
            <div className="header-title">
              <PlantIcon className="plant-icon" />
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
