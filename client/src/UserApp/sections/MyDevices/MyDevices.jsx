import React, { useEffect, useState } from 'react'
import axios from 'axios'
import './MyDevices.scss'

const MyDevices = () => {
  const [devices, setDevices] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchDevices()
  }, [])

  const fetchDevices = async () => {
    try {
      setLoading(true)
      const response = await axios.post('/api/user/devices', {}, {
        withCredentials: true
      })
      setDevices(response.data.devices)
      setError(null)
    } catch (err) {
      console.error('Error fetching devices:', err)
      setError('Failed to load devices')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="my-devices-loading">Loading your devices...</div>
  }

  if (error) {
    return <div className="my-devices-error">{error}</div>
  }

  if (devices.length === 0) {
    return (
      <div className="my-devices-empty">
        <h2>No devices assigned</h2>
        <p>You don't have any devices assigned to your account yet.</p>
      </div>
    )
  }

  return (
    <div className="my-devices">
      <div className="devices-grid">
        {devices.map((device) => (
          <div key={device.id} className="device-card">
            <div className="device-header">
              <h3>{device.name}</h3>
              <span className={`device-status ${device.status === 1 ? 'online' : 'offline'}`}>
                {device.status === 1 ? 'Online' : 'Offline'}
              </span>
            </div>
            <div className="device-body">
              <div className="device-info">
                <span className="label">Template:</span>
                <span className="value">{device.template}</span>
              </div>
              <div className="device-info">
                <span className="label">Device ID:</span>
                <span className="value">#{device.id}</span>
              </div>
            </div>
            <div className="device-footer">
              <button className="btn-details">View Details</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default MyDevices
