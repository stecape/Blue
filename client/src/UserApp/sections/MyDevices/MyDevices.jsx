import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './MyDevices.scss';
import DeviceInfoPanel from './DeviceInfoPanel';

const MyDevices = () => {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDevices();
  }, []);

  const fetchDevices = async () => {
    try {
      setLoading(true);
      const response = await axios.post('/api/user/devices');
      setDevices(response.data.result);
      setError(null);
    } catch (err) {
      console.error('Error fetching devices:', err);
      setError('Failed to load devices');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="my-devices-loading">Loading your devices...</div>;
  }

  if (error) {
    return <div className="my-devices-error">{error}</div>;
  }

  if (devices.length === 0) {
    return (
      <div className="my-devices-empty">
        <h2>No devices assigned</h2>
        <p>You don&apos;t have any devices assigned to your account yet.</p>
      </div>
    );
  }

  return (
    <div className="my-devices">
      <div className="devices-grid">
        {devices.map((device) => (
          <DeviceInfoPanel key={device.id} device={device} />
        ))}
      </div>
    </div>
  );
};

export default MyDevices;
